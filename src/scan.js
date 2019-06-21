const defaultConfig = require('./../config.json');
const steem = require('steem');
const Blockchain = require('./blockchain');
const Utopian = require('./utopian');
const { readJson } = require('./utils');

/**
 * @class
 * @desc Creates a scan instance
 * @param {object} options
 * @param {String} options.url RPC Node URL
 */
class Scan {
  constructor(options = {}) {
    this.nodeURL = options.nodeURL || defaultConfig.nodeURL;
    this.testMode = options.testMode || defaultConfig.testMode;
    this.msg = 'This is test message';
    steem.api.setOptions({ url: this.nodeURL });
    /**
     * @memberof Scan
     */
    this.blockchain = new Blockchain(this);
    this.utopian = new Utopian(this);
  }

  /**
   * Blockchain transactions collector
   * @param {String} mode - transactions mode
   * @returns {Promise.<Array>} - resolves after collecting some block transactions
   * @access private
   */
  getTransactions(mode) {
    return new Promise((resolve, reject) => {
      if (this.testMode)
        readJson('./../testTransactions.json', (_err, transactions) => {
          resolve(transactions);
        });
      else {
        let transactions = [];
        const release = steem.api.streamTransactions(mode || 'head', (err, res) => {
          transactions.push(res);
          !err ? resolve(transactions) : reject(err);
          release();
        });
      }
    });
  }

  /**
   * Blockchain account history transactions collector
   * @param {String} account - account name
   * @returns {Promise.<Array>} - resolves after getting account history
   * @access private
   */
  getRecentAccountTransactions(account, limit = 200) {
    const start = -1;
    return steem.api.getAccountHistoryAsync(account, start, limit);
  }

  /**
   * Blockchain account history transactions collector
   * @returns {Promise.<Array>} - resolves after getting account history
   * @access private
   */
  getAccountCount() {
    return steem.api.getAccountCountAsync();
  }
}

module.exports = Scan;
