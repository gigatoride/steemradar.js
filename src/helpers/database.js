const { Client } = require('dsteem');
const utils = require('../utils');

module.exports = class Database {
  constructor(options = {}) {
    this.options = options;
    this.client = new Client(this.options.node);
  }

  /**
   * Pause streaming
   */
  pause() {
    this.running = false;
  }

  /**
   * Resume streaming
   */
  resume() {
    this.running = true;
  }

  /**
   * Scan Database activity
   * @param {array} usernames - accounts usernames
   * @param {function} callback - a callback for the results for timestamp
   * @param {number} ms - milliseconds
   */
  async accounts(usernames, callback, ms = 200) {
    if (!usernames && !utils.validAccountName(usernames)) { throw new Error('Usernames are not valid.'); }

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
