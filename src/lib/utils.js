const Promise = require('bluebird'); // A fully featured promise library with focus on innovative features and performance better than ES6 promises
const steem = require('steem'); // Steem JS library

module.exports = {
    isUsername: (verify) => {
        if (verify !== null && Array.isArray(verify)) { // Username is not null
            return (verify.some((name) => steem.utils.validateAccountName(name) === null)) ? true : false; // Verify username array one by one.
        } else if (typeof username === 'string') {
            return steem.utils.validateAccountName(verify) === null ? true : false; // Verify username if single
        } else
            return true; // Ignore verify if username is null
    },
    isMemoKey: (wif, username) =>
        new Promise((resolve, reject) =>
            steem.api.getAccountsAsync([username]).then((res) => { // Promise for account results
                const memo_public = res[0].memo_key, // Extract public memo key
                    memo_private = wif; // Private memo key
                if (memo_private === null) // Private Memo key optional if its value is null
                    resolve(true); // Resolve by true
                try { // try,catch for non-valid keys it will return an error of crash!
                    resolve(steem.auth.wifIsValid(memo_private, memo_public)); // Resolve true
                } catch (e) {
                    resolve(false); // Resolve false (not valid)
                }
            }).catch(reject)), // Catch error by reject
    compareTsDub: (first, last) => {
        for (const i in last) // Check all last array elements.
            if (first.some(obj => last[i].timestamp.includes(obj.timestamp))) // Check if it has the same timestamp
                return true // Return true if it is the same array
        return false; // Return false if it is different array
    }, 
    isMemo: (memoKey, memo) => {
        try {
            return steem.memo.decode(memoKey, memo); // Try to decode memo key
        } catch (e) {
            return false; // If error memo key is false
        }
    }
}