const defaultConfig = require('./../config.json');
const Settings = require('./settings');
const SteemAPI = require('./api');
const { Blockchain } = require('./helpers');

/**
 * @class
 * @desc Creates a scan instance
 * @param {object} options
 * @param {String} options.url RPC Node URL
 */
class Client {
  constructor(options = {}) {
    this._setTransporter(options);
    this.settings = new Settings();
    this.blockchain = new Blockchain(this);
  }

  async _setTransporter(options) {
    options.nodeURL = options.nodeURL || defaultConfig.nodeURL;
    if (options.nodeURL.match('^((https|http)?://)'))
      throw new Error(
        'Invalid `nodeURL`, `http(s)` protocol currently not supported, please use `wss` or `ws`'
      );
    if (!options.nodeURL.match('^((wss|ws)?://)'))
      throw new Error(
        'Invalid `nodeURL`, url should be a websocket `wss` or `ws`'
      );
    else options.transportType = 'ws';

    this.api = new SteemAPI(options, this.blockchain);
  }
}

module.exports = Client;
