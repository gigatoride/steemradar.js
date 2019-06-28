const EventEmitter = require('events');
const Client = require('./../client');

const { sleep, setOperation, isProfanity, isMention, isBlacklisted, getCommentType } = require('../utils');

class Blockchain extends EventEmitter {
  constructor(client = Client) {
    super(client);

    this.client = client;
    this.options = client.options;
    this.settings = client.settings;
    this.isTrackingFunds = false;
    this._start();
  }

  /**
   * Set stream by destructuring operation property
   * @param {Boolean} enabled
   */
  setStreamOperations(enabled) {
    this.settings.set('streamOperation', enabled);
  }

  /**
   * Set comment by options
   * @param {Object} opts
   */
  setCommentOptions(opts = {}) {
    for (const name in opts) this.settings.comment.set(name, opts[name]);
  }

  /**
   * Set transfer by options
   * @param {Object} opts
   */
  setTransferOptions(opts = {}) {
    for (const name in opts) this.settings.transfer.set(name, opts[name]);
  }

  /**
   * Set funds track information
   */
  setFundsTrackOptions(opts = {}) {
    for (const name in opts) this.settings.funds.track.set(name, opts[name]);
  }

  /**
   * Clears all settings, stop all emits
   */
  close() {
    this.settings.clear();
    this.running = false;
    this.removeAllListeners();
  }

  /**
   * Emit transaction by types
   * @param {!Object} trx - transaction
   * @param {String=} type - operation type
   * @param {String=} parent - custom parent
   * @param {String=} child - custom child
   * @fires Blockchain#transaction
   * @fires Blockchain#transaction:<operationType>
   * @fires Blockchain#transaction:<operationType>:<customParent>
   * @fires Blockchain#transaction:<operationType>:<customParent>:<customChild>
   * @private
   */
  _emitTransaction(trx, type, parent, child) {
    if (this.running) {
      let event;
      if (type && !parent && !child) event = `transaction:${type}`;
      else if (type && parent && !child) event = `transaction:${type}:${parent}`;
      else if (type && parent && child) event = `transaction:${type}:${parent}:${child}`;
      else event = 'transaction';

      this.settings.get('streamOperation') ? this.emit(event, ...setOperation(trx)) : this.emit(event, trx);
    }
  }

  /**
   * Emit comment by types
   * @param {Object} trx - transaction
   * @private
   */
  async _emitCommentTypes(trx) {
    const [type, data] = setOperation(trx);
    const { author, body } = data;
    this._emitTransaction(trx, type);

    if (!this.settings.comment.has('authors') || this.settings.comment.get('authors').includes(author))
      this._emitTransaction(trx, type, getCommentType(data));

    if (isProfanity(body)) this._emitTransaction(trx, type, 'body', 'profane');
    if (isMention(body)) this._emitTransaction(trx, type, 'body', 'mention');

    isBlacklisted(author)
      .then(res => {
        if (res.blacklisted.length) this._emitTransaction(trx, type, 'author', 'blacklisted');
      })
      .catch(err => {
        this.emit('error', err);
      });
  }

  /**
   * Emit transfer by multiple types
   * @param {Object} trx - transaction
   * @private
   */
  _emitTransferTypes(trx) {
    const [type, data] = setOperation(trx);
    const { from, to, memo } = data;

    const customSenders = this.settings.transfer.get('senders') || [];
    const customReceivers = this.settings.transfer.get('receivers') || [];

    if (!customReceivers.length && !customSenders.length) this._emitTransaction(trx, type);
    if (customReceivers.includes(to)) this._emitTransaction(trx, type);
    if (customSenders.includes(from)) this._emitTransaction(trx, type);
    if (isProfanity(memo)) this._emitTransaction(trx, type, 'memo', 'profane');

    if (this.isTrackingFunds) this._emitTransaction(trx, type, 'funds', 'track');
  }

  /**
   * Emit vote by types
   * @param {Object} trx - transactions
   * @private
   */
  _emitVoteTypes(trx) {
    const [type, data] = setOperation(trx);
    const { weight } = data;
    if (weight > 0) this._emitTransaction(trx, type, 'positive');
    else this._emitTransaction(trx, type, 'negative');
    this._emitTransaction(trx, type);
  }

  /**
   * Account counter event
   * @private
   */
  async _emitAccountCount(ts = 1) {
    let current;
    while (true) {
      try {
        const count = await this.client.api.getAccountCount();
        if (count && current !== count) {
          current = count;
          this.emit('account:count', count);
        }
      } catch (error) {
        this.emit('error', error);
      }
      await sleep(ts * 1000);
    }
  }

  /**
   * Format operations and emit types
   * @param {Object} options  - options
   * @private
   */
  async _operationsFormatter(options = {}) {
    for await (const trx of this.client.api.getOperations(options)) {
      if (!this.running) break;
      const type = setOperation(trx)[0];

      this._emitTransaction(trx);

      switch (type) {
        case 'comment':
          this._emitCommentTypes(trx);
          break;
        case 'transfer':
          this._emitTransferTypes(trx);
          break;
        case 'vote':
          this._emitVoteTypes(trx);
          break;
        default:
          this._emitTransaction(trx, type);
          break;
      }
    }
  }

  /**
   * Starts all events emitters
   * @private
   */
  _start() {
    try {
      this.running = true;
      this._emitAccountCount();
      this._operationsFormatter();
    } catch (error) {
      this.running = false;
      this.emit('error', error);
    }
  }
}

module.exports = Blockchain;
