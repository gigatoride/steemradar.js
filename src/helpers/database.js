const utils = require('../utils'); // Some utils

/**
 * Scan Database class
 */
class Database {
  /**
   * Database Scan contractor
   * @param {object} options - scan class and it's constructor options
   */
  constructor(options = {}) {
    this.options = options; // Options object for dsteem client instance.
    this.client = this.options.client; // Set client instance.
  }

  /**
   * Pause streaming
   */
  pause() {
    this.running = false; // Pause method
  }

  /**
   * Resume streaming
   */
  resume() {
    this.running = true; // Resume method
  }

  /**
   * Scan Database activity
   * @param {array} usernames - accounts usernames
   * @param {function} callback - a callback for the results for timestamp
   * @param {number} ms - milliseconds
   */
  async accounts(usernames, callback, ms = 200) {
    if (!usernames && !utils.valid.accountName(usernames)) {
      throw new Error('Usernames are not valid.');
    } // Check if username is valid
    if (typeof callback === 'function') {
      this.running = true; // Toggle run for updating.
      let last = []; // Save latest activity and to compare it with the current one.
      let count = 0; // Counter
      const update = async () => {
        // Pause or Resume
        if (this.running) {
          await this.client.database
              .getAccounts(usernames) // Get accounts by usernames
              .then((res) => {
                const changes = res.every((account) => {
                  if (count) count++;
                  return !Object.is(account, last[count]); // Compare every object if the same or not.
                });
                if (changes) {
                  (count = 0), (last = res); // Reset count and set the array to latest results.
                  callback(null, res); // Callback is there is a changes
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
    if (!username && !utils.valid.accountName(usernames)) {
      throw new Error('Usernames are not valid.');
    } // Check if username is valid
    if (typeof callback === 'function') {
      let lastTimestamp;
      this.running = true; // Start updating
      // this.running // Pause or Resume
      const update = async () => {
        if (this.running) {
          await this.client.database // Client database data
              .call('get_account_history', [username, -1, 100]) // Call account history by latest 100.
              .then((res) => {
              // Reserve for the first activity becomes the last, and the last activity becomes the first.
                const received = res
                    .reverse()
                    .find(
                        (obj) =>
                          obj[1].op[0] === 'transfer' && obj[1].op[1].to === username
                    );
                const {from, amount, memo} = received[1].op[1]; // destructing the matches object into local variables
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
    } else throw new Error('Callback is not a function'); // Callback an error if callback is not a function.
  }
}

// Exports database scan methods
exports.Database = Database;