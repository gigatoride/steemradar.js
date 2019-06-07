const steem = require('steem');

class API {
  /**
   * Blockchain transactions collector
   * @param {String} mode - transactions mode
   * @returns {Promise.<Array>} - resolves after collecting some block transactions
   * @access private
   */
  static getTransactions(mode) {
    return new Promise((resolve, reject) => {
      let transactions = [];
      const release = steem.api.streamTransactions(mode || 'head', (err, res) => {
        transactions.push(res);
        !err ? resolve(transactions) : reject(err);
        release();
      });
    });
  }

  /**
   * Blockchain account history transactions collector
   * @param {String} account - account name
   * @returns {Promise.<Array>} - resolves after getting account history
   * @access private
   */
  static getRecentAccountTransactions(account, limit = 200) {
    const start = -1;
    return steem.api.getAccountHistoryAsync(account, start, limit);
  }

  /**
   * Blockchain account history transactions collector
   * @returns {Promise.<Array>} - resolves after getting account history
   * @access private
   */
  static getAccountCount() {
    return steem.api.getAccountCountAsync();
  }
}

module.exports = API;
