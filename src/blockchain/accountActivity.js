const steem = require('steem');
const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan account database recent activity
 * @param {?Array=} names - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getAccountActivity(names) {
  if (names && isValidAccountNames(names)) throw new Error('An account name is not valid.');

  let latestCatch = [];

  const iterator = async function * (ms = 4 * 1000) {
    while (true) {
      const history = await steem.api.getAccountsAsync(names);
      const changes = history.every((account, i) => {
        return !Object.is(account, latestCatch[i]);
      });
      if (changes) {
        latestCatch = history;
        yield history;
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
}

module.exports = getAccountActivity;
