const iteratorStream = require('async-iterator-to-stream');
const steem = require('steem');
const { validateAccountName } = require('steem').utils;
const { sleep } = require('../utils');

/**
 * Scan account database recent activity
 * @param {Array} accounts - steem accounts
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function accountActivity(accounts) {
  if (accounts && !accounts.every(account => validateAccountName(account) === null))
    throw new Error('accounts are not valid.');

  let latestCatch = [];

  const iterator = async function * (ms = 4 * 1000) {
    while (true) {
      const history = await steem.api.getAccountsAsync(accounts);
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

  return iteratorStream.obj(iterator());
}

module.exports = accountActivity;
