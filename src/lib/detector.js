const Promise = require('bluebird'); // Promise library
const steem = require('steem'); // Steem JS library
const utils = require('./utils'); // Utils library
const Filter = require('bad-words'), // Filter profane words.
    badWords = new Filter();

module.exports = {
    /**
     * Listing to blockchain transfers
     * @param {array} senders - an array of usernames for senders
     * @param {string} min_amount - a string for minimum SBD/STEEM amount
     * @param {array} receivers - an array of usernames for receivers
     * @param {string} target_memo - a string for memo to match with the callbacks of transactions
     * @param {function} callback - a callback for the results
     */
    transfer: { // Transfer method
        detect: (senders, min_amount, receivers, target_memo, callback) => {
            if (receivers !== null) {
                if (!Array.isArray(receivers)) throw new Error('Receivers are not in array.'); // Check if senders has a valid array.
                if (!utils.isUsername(receivers)) throw new Error('Receivers are not valid.'); // Check all receivers
            }
            if (senders !== null) {
                if (!Array.isArray(senders)) throw new Error('Senders are not in array.'); // Check if senders has a valid array.
                if (!utils.isUsername(senders)) throw new Error('Senders are not valid.'); // Check all senders
            }
            if (!typeof parseInt(min_amount) === 'number' && !/(SBD|STEEM|\|)/.test(min_amount)) throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.'); // Check if senders has a valid array.
            if (typeof callback === "function") {
                this.release = steem.api.streamTransactions('head', (err, res) => { // Listing for blockchain transactions.
                    if (err === null && res.operations[0][0] == 'transfer') { // Check if there is no errors before doing anything.
                        const {
                            from, // Sender
                            to, // Receiver
                            amount, // Amount of SBD/STEEM
                            memo // Transaction MEMO
                        } = res.operations[0][1]; // Convert the matches object into local variables.
                        // Check operation type, Ternary operator for passing null as true instead of array
                        if ((senders === null) ? true : senders.includes(from) && // Check senders
                            (receivers === null) ? true : receivers.includes(to) && // Check receivers
                            (target_memo === null) ? true : memo.includes(target_memo)) { // Check memo
                            const [target_amount, currency] = min_amount.split(/\s/); // Split min_amount to array then local variables with value and name of currency
                            reAmount = new RegExp(currency); // Convert to array then use type of currency (SBD, STEEM, STEEM|SBD) as regular expression.                     
                            if (reAmount.test(amount) && parseFloat(target_amount) <= parseFloat(amount)) // Check if transfer account is bigger than or equal min_amount
                                callback(res); // Callback transaction object
                        }
                    } else if (err !== null)
                        callback(err); // Callback error.
                });
            }
        },
        stop: () => this.release(), // Stop streaming
    },
    /**
     * Listing to blockchain comments/posts/replies
     * @param {string} username - account username
     * @param {function} callback - a callback for the results for bad word and author as well
     */
    profane: { // Profane method
        detect: (username, callback) => {
            if (!utils.isUsername(username)) throw new Error('Username is not valid or exist.'); // Check if username is valid

            if (typeof callback === "function") {
                this.release = steem.api.streamTransactions('head', (err, res) => { // Stream latest blockchain transaction
                    if (err !== null) // Check if error is null
                        if (res.operations[0][0] === 'comment') { // Check type of transaction
                            let op = res.operations[0][1]; // Operations object
                            if (username === null) { // Check if username is not null
                                if (typeof badWords.isProfane(op.body) === 'string') // Check if there is a bad word.
                                    callback([badWords.isProfane(op.body), op.author]); // Return bad word and author.
                            } else
                            if (badWords.isProfane(op.parent_author === username))
                                if (typeof badWords.isProfane(op.body) === 'string') // Check if there is a bad word.
                                    callback([badWords.isProfane(op.body), op.author]); // Return bad word and author.
                        }
                })
            }
        },
        stop: () => this.release() // Stop streaming
    },
    activity: { // Activity method
        /**
         * Listing to blockchain activity
         * @param {array} usernames - accounts usernames
         * @param {function} callback - a callback for the results for timestamp
         */
        detect: (usernames, callback) => { // detect user activity.
            if (!utils.isUsername(usernames)) throw new Error('Username is not valid or exist.'); // Check if usernames are valid
            if (typeof callback === "function") {
                let last = false; // Save latest activity and to compare it with the current one.
                this.run = true; // Toggle run for updating.
                const update = () => { // Keep updating any further activities by callback timestamp.
                    if (!this.run) return; // If run is false stop updating.
                    steem.api.getAccountsAsync(usernames) // Request account history
                        .then(res => {
                            res = res.map(obj => { // Detector filter activity object
                                return {
                                    username: obj.name, // Username
                                    timestamp: obj.last_bandwidth_update // Get latest bandwidth update
                                }
                            });
                            if (!last || !utils.compareTsDub(last, res)) {
                                last = res;
                                callback(last); // Callback by timestamp
                            }
                            // Will return last time the user had been active based on blockchain.
                            Promise.delay(300).then(update).catch(callback); // Promise for updating callbacks and error handler.
                        }).catch(callback); // Update by seconds interval.
                }
                update(); // Run the update function
                return () => this.run = false; // Return by stopping update.
            }
        },
        stop: () => this.run = false // Stop getting latest timestamp updates.
    },
    memo: { // Memo method
        /**
         * Listing to blockchain memos
         * @param {string} username - account username
         * @param {function} callback - a callback for the results for memo  sender, receiver, amount, memo
         */
        detect: (memoKey, username, callback) => {
            if (!utils.isUsername(username) && username !== null) throw new Error('Username is not valid or exist.') // Check username
            utils.isMemoKey(memoKey, username).then((isMemo) => {
                if (!isMemo) throw new Error('Memo key is not valid.') // Check username
            })
            if (typeof callback === "function") {
            let latest_timestamp;
            this.run = true; // Start updating
                const update = () => {
                    if (!this.run) return; // If run is false stop updating.
                    steem.api.getAccountHistoryAsync(username, -1, 100).then(res => {
                        let transfer;
                        // Reserve for the first activity becomes the last, and the last activity becomes the first.
                        const received = res.reverse().find(obj => obj[1].op[0] === 'transfer' && obj[1].op[1].to === username)
                        const {
                            from, // Sender
                            to, // Receiver
                            amount, // Amount of SBD/STEEM
                            memo // Transaction MEMO
                        } = received[1].op[1]; // Convert the matches object into local variables
                        if (latest_timestamp !== received[1].timestamp) {
                            latest_timestamp = received[1].timestamp;
                            if (memo !== '') // Check if private memo
                                if (memo.charAt(0) === '#' && memoKey !== null) {
                                    let privateMemo = utils.isMemo(memoKey, memo);
                                    transfer = (privateMemo !== false) ? [from, amount, privateMemo] : [from, amount, 'Wrong Memo Key.'];
                                } else
                                    transfer = [from, amount, memo]; // It is private memo in case of (no wif key)
                            else
                                transfer = [from, amount, memo]; // It is public memo
                            callback(transfer);
                        }
                        Promise.delay(300).then(update).catch(callback); // Promise for updating callbacks and error handler.
                    }).catch(callback);
                }
                update(); // Run the update function
                return () => this.run = false; // Return by stopping update.
            }
        },
        stop: () => this.run = false // Stop getting latest memos
    }
}