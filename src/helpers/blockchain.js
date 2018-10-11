const utils = require('../utils'); // Some utils
/**
 * Blockchain class
 */
class Blockchain {
  /**
   * @param {object} options - scan class object
   */
  constructor(options = {}) {
    this.options = options; // Options object for dsteem client instance.
    this.client = this.options.client; // Set client instance.
    this.stream = this.client.blockchain.getOperationsStream(); // Create new dsteem instance.
  }

  /**
   * Pause operations stream
   */
  pause() {
    if (!this.stream.isPaused()) this.stream.pause(); // Pause stream instance if it running.
  }

  /**
   * Resume operations stream
   */
  resume() {
    if (this.stream.isPaused()) this.stream.pause(); // Resume stream instance if it not running.
  }

  /**
   * Scan usernames for votes or entire blockchain
   * @param {array} usernames - scanning these usernames vote their votes
   * @param {number} targetWeight - the minimum vote weight
   * @param {function} callback - a callback function for votes results
   */
  votes(usernames, targetWeight, callback) {
    if (typeof targetWeight !== 'number') throw new Error('weight is not a valid number');
    // Check if username is valid
    if (usernames && !utils.valid.accountName(usernames)) throw new Error('Username is not valid or exist.');
    if (typeof callback === 'function') {
      this.stream
          .on('data', async (operation) => {
            const [txType, txData] = operation.op;
            if (!usernames || (usernames.includes(txData.author) && txType === 'vote')) {
              if (targetWeight <= txData.weight) callback(null, txData);
            }
          })
          .on('error', callback);
    } else throw new Error('Callback is not a function'); // Throw an error if callback is not a function
  }
  /**
   * Scan for any blacklisted user on blockchain latest blocks.
   * @param {function} callback - a callback for results.
   */
  blacklist(callback) {
    // Check callback is a valid function
    if (typeof callback === 'function') {
      this.stream // Stream blockchain operations
          .on('data', async (operation) => {
            let username;
            const [txType, txData] = operation.op;
            switch (txType) {
              case 'transfer': // In case of transfer set username from sender
                username = txData.from;
                break;
              case 'comment': // In case of transfer set username from author
                username = txData.author;
                break;
              default:
              // The default username should be null
                username = null;
                break;
            }
            if (username) {
              const res = await utils.filter.inBlackList(username); // Filter username in global blacklist then return an array of services if exist.
              if (res.blacklisted.length) callback(null, res); // Callback if blacklisted array elements more than zero.
            }
          })
          .on('error', callback);
    } else throw new Error('Callback is not a function'); // Throw an error if callback is not a function
  }

  /**
   * Scan blockchain transfers
   * @param {array} senders - an array of usernames for senders
   * @param {string} minAccount - a string for minimum SBD/STEEM amount
   * @param {array} receivers - an array of usernames for receivers
   * @param {string} targetMemo - a string for memo to match with the callbacks of transactions
   * @param {function} callback - a callback for the results
   */
  transfers(senders, minAccount, receivers, targetMemo, callback) {
    // Check receivers is null or in array
    if (receivers) {
      if (!Array.isArray(receivers)) throw new Error('Receivers are not in array.');
      // Check if senders has a valid array.
      if (receivers && !utils.valid.accountName(receivers)) throw new Error('Receivers are not valid.');
      // Check all receivers
    }
    // Check senders is null or in array
    if (senders) {
      if (!Array.isArray(senders)) throw new Error('Senders are not in array.'); // Check if senders has a valid array.
      if (senders && !utils.valid.accountName(senders)) throw new Error('Senders are not valid.');
      // Check all senders
    }

    // Check if senders has a valid array.
    if (!typeof parseInt(minAccount) === 'number' && !/(SBD|STEEM|\|)/.test(minAccount)) {
      throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.');
    }
    // Check callback is a valid function
    if (typeof callback === 'function') {
      this.stream // Stream blockchain operations
          .on('data', (operation) => {
            const [txType, txData] = operation.op;
            if (txType == 'transfer') {
            // Check if there is no errors before doing anything.
              const {from, to, amount, memo} = txData; // destructing the matches object into local variables.
              // Check operation type, Ternary operator for passing null as true instead of array
              if (
              !senders
                ? true
                : senders.includes(from) && !receivers // Check senders
                  ? true
                  : receivers.includes(to) && !targetMemo // Check receivers
                    ? true
                    : memo.includes(targetMemo)
              ) {
              // Check memo
                const [targetAmount, currency] = minAccount.split(/\s/); // Split minAccount to array then local variables with value and name of currency
                let reAmount = new RegExp(currency); // destructing to array then use type of currency (SBD, STEEM, STEEM|SBD) as regular expression.
                // Check if transfer account is bigger than or equal minAccount
                if (reAmount.test(amount) && parseFloat(targetAmount) <= parseFloat(amount)) {
                  callback(null, txData); // Callback transaction data object
                }
              }
            }
          })
      // Callback stream error.
          .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scan blockchain comments/posts/replies
   * @param {string} username - account username
   * @param {function} callback - a callback for the results for bad word and author as well
   */
  profane(username, callback) {
    // Check if username is valid
    if (usernames && !utils.valid.accountName(username)) throw new Error('Username is not valid or exist.');
    // Check callback is a valid function
    if (typeof callback === 'function') {
      this.stream // Stream blockchain operations
          .on('data', (operation) => {
          // Stream latest blockchain transaction
            const [txType, txData] = operation.op;
            // Check if error is null and operation type is comment
            switch (txType) {
              case 'comment':
              // Check type of transaction
                if (!username || txData.author === username) {
                // Check if username is not null
                  const word = utils.filter.profaneWord(txData.body); // Check word is profane or not
                  // String means it is a profane anything else will be false.
                  if (typeof word === 'string') {
                    const badWord = [word, txData.author];
                    callback(null, badWord);
                  }
                }
                break;
              case 'transfer':
              // Check type of transaction
                if (!username || txData.from === username) {
                // Check if username is not null
                  const word = utils.filter.profaneWord(txData.memo); // Check word is profane or not
                  // String means it is a profane anything else will be false.
                  if (typeof word === 'string') {
                    const badWord = [word, txData.author];
                    callback(null, badWord);
                  }
                }
                break;
              default:
                break;
            }
          })
      // Callback stream error.
          .on('error', callback);
    } else throw new Error('Callback is not a function'); // Throw an error if callback is not a function
  }
}

// Exports Blockchain class
exports.Blockchain = Blockchain;
