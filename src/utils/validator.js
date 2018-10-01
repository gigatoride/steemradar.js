const steem = require('steem'); // Steem JS library

module.exports = {
  isUsername: verify => {
    if (verify !== null && Array.isArray(verify)) {
      // Username is not null
      return verify.some(name => steem.utils.validateAccountName(name) === null) ? true : false; // Verify username array one by one.
    } else if (typeof username === 'string') {
      return steem.utils.validateAccountName(verify) === null ? true : false; // Verify username if single
    } else return true; // Ignore verify if username is null
  },
  isMemoKey: (wif, username, callback) =>
    steem.api
      .getAccountsAsync([username])
      .then(res => {
        // Promise for account results
        const memo_public = res[0].memo_key, // Extract public memo key
          memo_private = wif; // Private memo key
        if (memo_private === null)
          // Private Memo key optional if its value is null
          callback(true); // Resolve by true
        try {
          // try,catch for non-valid keys it will return an error of crash!
          callback(steem.auth.wifIsValid(memo_private, memo_public)); // Resolve true
        } catch (err) {
          callback(err); // Resolve false (not valid)
        }
      })
      .catch(callback), // Catch error by reject
  isTsDup: (first, last) => {
    for (const i in last) // Check all last array elements.
      if (first.some(obj => last[i].timestamp.includes(obj.timestamp)))
        // Check if it has the same timestamp
        return true; // Return true if it is the same array
    return false; // Return false if it is different array
  },
  isMemo: (memoKey, memo) => {
    try {
      return steem.memo.decode(memoKey, memo); // Try to decode memo key
    } catch (err) {
      return err; // If error memo key is false
    }
  }
};
