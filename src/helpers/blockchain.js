/**
 * Module dependencies.
 */

const { Client } = require('dsteem');
const utils = require('../utils');

module.exports = class Blockchain {
  constructor(options) {
    this.client = new Client(options.node);
    this.stream = this.client.blockchain.getOperationsStream();
  }

  /**
   * Pause operations stream
   * @api public
   */
  pause() {
    if (!this.stream.isPaused()) this.stream.pause();
  }

  /**
   * Resume operations stream
   * @api public
   */
  resume() {
    if (this.stream.isPaused()) this.stream.pause();
  }

  /**
   * Scan usernames for votes or entire blockchain
   * @param {array} usernames - scanning these usernames vote their votes
   * @param {number} targetWeight - the minimum vote weight
   * @param {function} callback - a callback function for votes results
   * @api public
   */
  votes(usernames, targetWeight, callback) {
    if (typeof targetWeight !== 'number') throw new Error('weight is not a valid number');

    if (usernames && !utils.validAccountName(usernames)) {
      throw new Error('Username is not valid or exist.');
    }

    if (typeof callback === 'function') {
      this.stream
        .on('data', async operation => {
          const [txType, txData] = operation.op;
          if (!usernames || (usernames.includes(txData.author) && txType === 'vote')) {
            if (targetWeight <= txData.weight) callback(null, txData);
          }
        })
        .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan for any blacklisted user on blockchain latest blocks.
   * @param {function} callback - a callback for results.
   * @api public
   */
  blacklist(callback) {
    if (typeof callback === 'function') {
      this.stream
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
            if (res.blacklisted.length) callback(null, res);
          }
        })
        .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan blockchain transfers
   * @param {array} senders - an array of usernames for senders
   * @param {string} minAccount - a string for minimum SBD/STEEM amount
   * @param {array} receivers - an array of usernames for receivers
   * @param {string} targetMemo - a string for memo to match with the callbacks of transactions
   * @param {function} callback - a callback for the results
   * @api public
   */
  transfers(senders, minAccount, receivers, targetMemo, callback) {
    if (receivers) {
      if (!Array.isArray(receivers)) throw new Error('Receivers are not in array.');

      if (receivers && !utils.validAccountName(receivers)) {
        throw new Error('Receivers are not valid.');
      }
    }
    if (senders) {
      if (!Array.isArray(senders)) throw new Error('Senders are not in array.');
      if (senders && !utils.validAccountName(senders)) throw new Error('Senders are not valid.');
    }

    if (!typeof parseInt(minAccount) === 'number' && !/(SBD|STEEM|\|)/.test(minAccount)) {
      throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.');
    }

    if (typeof callback === 'function') {
      this.stream
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
              // Check memo
              const [targetAmount, currency] = minAccount.split(/\s/); // Split minAccount to array then local variables with value and name of currency
              const reAmount = new RegExp(currency); // destructing to array then use type of currency (SBD, STEEM, STEEM|SBD) as regular expression.
              // Check if transfer account is bigger than or equal minAccount
              if (reAmount.test(amount) && parseFloat(targetAmount) <= parseFloat(amount)) {
                callback(null, txData);
              }
            }
          }
        })
        .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan blockchain comments/posts/replies
   * @param {string} username - account username
   * @param {function} callback - a callback for the results for bad word and author as well
   * @api public
   */
  profane(username, callback) {
    // Check if username is valid
    if (username && !utils.validAccountName(username)) {
      throw new Error('Username is not valid or exist.');
    }

    // Check callback is a valid function
    if (typeof callback === 'function') {
      this.stream
        .on('data', operation => {
          const [txType, txData] = operation.op;
          switch (txType) {
            case 'comment':
              // Check type of transaction
              if (!username || txData.author === username) {
                const word = utils.profaneWord(txData.body); // Check word is profane or not
                if (typeof word === 'string') {
                  const badWord = [word, txData.author];
                  callback(null, badWord);
                }
              }
              break;
            case 'transfer':
              if (!username || txData.from === username) {
                const word = utils.profaneWord(txData.memo); // Check word is profane or not
                if (typeof word === 'string') {
                  const badWord = [word, txData.author];
                  callback(null, badWord);
                }
              }
              break;
          }
        })
        .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan Database activity
   * @param {array} usernames - accounts usernames
   * @param {function} callback - a callback for the results for timestamp
   * @param {number} ms - milliseconds
   * @api public
   */
  async accounts(usernames, callback, ms = 200) {
    if (!usernames && !utils.validAccountName(usernames)) {
      throw new Error('Usernames are not valid.');
    }

    if (typeof callback === 'function') {
      this.running = true;
      let last = [];
      let count = 0;
      const update = async() => {
        if (this.running) {
          await this.client.database
            .getAccounts(usernames)
            .then(res => {
              const changes = res.every(account => {
                if (count) count++;
                return !Object.is(account, last[count]); // Compare every object if the same or not.
              });
              if (changes) {
                count = 0;
                last = res;
                callback(null, res);
              }
            })
            .catch(callback);
        }

        await utils.sleep(ms); // Await some milliseconds between every request
        await update(); // Run the update again.
      };
      update(); // Start  update function
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan Database memos
   * @param {string} username - account username
   * @param {function} callback - a callback for the results for memo  sender, receiver, amount, memo
   * @param {number} ms - milliseconds
   * @api public
   */
  memo(username, callback, ms = 200) {
    if (!username && !utils.validAccountName(username)) throw new Error('Usernames are not valid.');

    if (typeof callback === 'function') {
      let lastTimestamp;
      this.running = true;
      const update = async() => {
        if (this.running) {
          await this.client.database // Client database data
            .call('get_account_history', [username, -1, 100]) // Call account history by latest 100.
            .then(res => {
              const received = res
                .reverse() // Reserve for the first memo becomes the last, and the last activity becomes the first.
                .find(obj => obj[1].op[0] === 'transfer' && obj[1].op[1].to === username);
              const { from, amount, memo } = received[1].op[1]; // destructing the matches object into local variables
              if (lastTimestamp !== received[1].timestamp) {
                lastTimestamp = received[1].timestamp;
                const transfer = [from, amount, memo]; // It is Global memo
                callback(null, transfer); // Callback results
              }
            })
            .catch(callback);
        }

        await utils.sleep(ms); // Await some milliseconds between every request
        await update(); // Run the update again.
      };
      update();
    } else throw new Error('Callback is not a function');
  }
};
