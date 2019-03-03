/**
 * Module dependencies.
 */

const { Client } = require('dsteem');
const { PassThrough } = require('stream');
const utils = require('../utils');
const exchanges = require('../exchanges.json');

module.exports = class Blockchain {
  constructor(options) {
    this.client = new Client(options.node);
    this.mode = options.mode;
    this.operations = this.client.blockchain.getOperationsStream();
    this.pause = false;
  }

  /**
   * Pause operations stream
   * @api public
   */
  pause() {
    if (!this.operations.isPaused()) this.operations.pause();
    this.pause = true;
  }

  /**
   * Resume operations stream
   * @api public
   */
  resume() {
    if (this.operations.isPaused()) this.operations.resume();
    this.pause = false;
  }

  close() {
    if (!this.operations.isPaused()) this.operations.destroy();
    this.pause = true;
  }

  /**
   * Scan usernames for votes or entire blockchain
   * @param {array} usernames - scanning these usernames vote their votes
   * @param {number} targetWeight - the minimum vote weight
   * @api public
   */
  votes(usernames, targetWeight) {
    const stream = new PassThrough({ objectMode: true });

    if (typeof targetWeight !== 'number') {
      throw new Error('weight is not a valid number');
    }

    if (usernames && !utils.validAccountName(usernames)) {
      throw new Error('Username is not valid or exist.');
    }

    this.operations
      .on('data', async operation => {
        const [txType, txData] = operation.op;
        if (
          !usernames ||
          (usernames.includes(txData.author) && txType === 'vote')
        ) {
          if (targetWeight <= txData.weight) stream.write(txData);
        }
      })
      .on('error', err => stream.emit('error', err));

    return stream;
  }

  /**
   * Scan for any blacklisted user on blockchain latest blocks.
   * @api public
   */
  blacklist() {
    const stream = new PassThrough({ objectMode: true });

    this.operations
      .on('data', async operation => {
        let username;
        const [txType, txData] = operation.op;
        switch (txType) {
          case 'transfer':
            username = txData.from;
            break;
          case 'comment':
            username = txData.author;
            break;
          default:
            username = null;
            break;
        }
        if (username) {
          const res = await utils.inBlackList(username);
          if (res.blacklisted.length) stream.write(res);
        }
      })
      .on('error', err => stream.emit('error', err));
    return stream;
  }

  /**
   * Scan blockchain transfers
   * @param {array} senders - an array of usernames for senders
   * @param {string} minAccount - a string for minimum SBD/STEEM amount
   * @param {array} receivers - an array of usernames for receivers
   * @param {string} targetMemo - a string for memo to match with the callbacks of transactions
   * @api public
   */
  transfers(senders, minAccount, receivers, targetMemo) {
    const stream = new PassThrough({ objectMode: true });

    if (receivers) {
      if (!Array.isArray(receivers)) {
        throw new Error('Receivers are not in array.');
      }

      if (receivers && !utils.validAccountName(receivers)) {
        throw new Error('Receivers are not valid.');
      }
    }
    if (senders) {
      if (!Array.isArray(senders)) throw new Error('Senders are not in array.');
      if (senders && !utils.validAccountName(senders)) {
        throw new Error('Senders are not valid.');
      }
    }

    if (
      !typeof parseInt(minAccount) === 'number' &&
      !/(SBD|STEEM|\|)/.test(minAccount)
    ) {
      throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.');
    }

    this.operations
      .on('data', operation => {
        const [txType, txData] = operation.op;
        if (txType === 'transfer') {
          const { from, to, amount, memo } = txData;
          if (
            !senders
              ? true
              : senders.includes(from) && !receivers
                ? true
                : receivers.includes(to) && !targetMemo
                  ? true
                  : memo.includes(targetMemo)
          ) {
            const [targetAmount, currency] = minAccount.split(/\s/);
            const reAmount = new RegExp(currency);
            if (
              reAmount.test(amount) &&
              parseFloat(targetAmount) <= parseFloat(amount)
            ) {
              stream.write(txData);
            }
          }
        }
      })
      .on('error', err => stream.emit('error', err));
    return stream;
  }

  /**
   * Scan blockchain comments/posts/replies
   * @param {string} username - account username
   * @api public
   */
  profane(username) {
    const stream = new PassThrough({ objectMode: true });

    // Check if username is valid
    if (username && !utils.validAccountName(username)) {
      throw new Error('Username is not valid or exist.');
    }

    this.operations
      .on('data', operation => {
        const [txType, txData] = operation.op;
        switch (txType) {
          case 'comment':
            // Check type of transaction
            if (!username || txData.author === username) {
              const word = utils.profaneWord(txData.body);
              if (typeof word === 'string') {
                const badWord = { word: word, author: txData.author };
                stream.write(badWord);
              }
            }
            break;
          case 'transfer':
            if (!username || txData.from === username) {
              const word = utils.profaneWord(txData.memo);
              if (typeof word === 'string') {
                const badWord = { word: word, author: txData.author };
                stream.write(badWord);
              }
            }
            break;
        }
      })
      .on('error', err => stream.emit('error', err));
    return stream;
  }

  /**
   * Scan Database activity
   * @param {array} usernames - accounts usernames
   * @param {int} ms - milliseconds
   * @api public
   */
  accounts(usernames, ms = 200) {
    const stream = new PassThrough({ objectMode: true });

    if (!usernames && !utils.validAccountName(usernames)) {
      throw new Error('Usernames are not valid.');
    }

    this.pause = false;
    let last = [];
    let count = 0;
    const update = async() => {
      if (!this.pause) {
        await this.client.database
          .getAccounts(usernames)
          .then(res => {
            const changes = res.every(account => {
              if (count) count++;
              return !Object.is(account, last[count]);
            });
            if (changes) {
              count = 0;
              last = res;
              stream.write(res);
            }
          })
          .catch(err => stream.emit('error', err));
      }

      await utils.sleep(ms);
      await update();
    };
    update();
    return stream;
  }

  /**
   * Scan Database memos
   * @param {string} username - account username
   * @param {int} ms - milliseconds
   * @api public
   */
  memo(username, ms = 200) {
    const stream = new PassThrough({ objectMode: true });
    if (!username && !utils.validAccountName(username)) {
      throw new Error('Usernames are not valid.');
    }

    let lastTimestamp;
    const update = async() => {
      if (!this.pause) {
        await this.client.database
          .call('get_account_history', [username, -1, 100])
          .then(res => {
            const received = res.reverse().find(obj => {
              return (
                obj[1].op[0] === 'transfer' && obj[1].op[1].to === username
              );
            });
            const { from, amount, memo } = received[1].op[1];
            if (
              typeof received !== 'undefined' &&
              lastTimestamp !== received[1].timestamp
            ) {
              lastTimestamp = received[1].timestamp;
              const transfer = [from, amount, memo];
              stream.write(transfer);
            }
          })
          .catch(err => stream.emit('error', err));
      }

      await utils.sleep(ms);
      await update();
    };
    update();
    return stream;
  }
  /**
   * Scan for seucrity threats or account changes.
   * @param {string} username - steem account username
   * @param {int} ms - milliseconds
   */
  security(username, ms = 200) {
    const stream = new PassThrough({ objectMode: true });
    if (!username && !utils.validAccountName(username)) {
      throw new Error('Usernames are not valid.');
    }

    let lastestTimestamp;
    const update = async() => {
      const types = [
        'account_update',
        'change_recovery_account',
        'transfer_from_savings'
      ];
      const account = await this.client.database.getAccounts([username]);

      const minPercentage = (50 / 100) * parseFloat(account[0].balance);
      if (!this.pause) {
        await this.client.database
          .call('get_account_history', [username, -1, 10])
          .then(res => {
            const received = res.reverse().find(obj => {
              const operation = obj[1].op[1];
              const operationType = obj[1].op[0];
              if (operationType === 'transfer') {
                const amount = operation.amount;
                return parseFloat(amount) >= minPercentage;
              } else {
                return types.includes(operationType);
              }
            });
            if (
              typeof received !== 'undefined' &&
              lastestTimestamp !== received[1].timestamp
            ) {
              lastestTimestamp = received[1].timestamp;
              stream.write(received);
            }
          })
          .catch(err => stream.emit('error', err));
      }
      await utils.sleep(ms);
      await update();
    };
    update();
    return stream;
  }
  /**
   * Tracking funds until it goes out of blockchain by 3rd party exchange
   * @param {string} username - steem account to be tracked.
   * @param {string} trxId - transaction Id for the transfer
   */
  fundsTracker(username, trxId) {
    const stream = new PassThrough({ objectMode: true });

    const getTransactions = username => {
      return this.client.database.call('get_account_history', [
        username,
        -1,
        200
      ]);
    };

    const getTransfer = transactions => {
      return transactions.reverse().find(t => {
        if (trxId) {
          return t[1].op[0] === 'transfer' && t[1].trx_id === trxId;
        } else {
          return t[1].op[0] === 'transfer' && t[1].op[1].from === username;
        }
      });
    };

    getTransactions(username)
      .then(async res => {
        const follow = getTransfer(res);
        let target = {
          trxId: follow[1].trx_id,
          username: follow[1].op[1].to,
          amount: follow[1].op[1].amount,
          timestamp: follow[1].timestamp,
          percentage: 100
        };
        const fullAmount = target.amount;
        if (exchanges.includes(target.username)) {
          stream.write(target);
        } else {
          stream.write(target);
          this.operations
            .on('data', async trx => {
              if (trx.op[1].from === target.username) {
                target = {
                  trxId: trx.trx_id,
                  username: trx.op[1].to,
                  amount: trx.op[1].amount,
                  timestamp: trx.timestamp,
                  percentage: utils.percentage(
                    parseFloat(trx.op[1].amount),
                    parseFloat(fullAmount)
                  )
                };
                stream.write(target);
                if (target && !exchanges.includes(target.username)) {
                  this.operations.destroy();
                }
              }
            })
            .on('error', err => stream.emit('error', err));
        }
      })
      .catch(err => stream.emit('error', err));

    return stream;
  }
};
