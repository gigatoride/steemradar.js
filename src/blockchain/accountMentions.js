const iteratorStream = require('async-iterator-to-stream');
const { validateAccountName } = require('steem').utils;
const blockchain = require('../helper');
const { sleep } = require('../utils');

/**
 * Scan for mentions
 * @param {Array} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function accountMentions(accounts) {
  if (accounts && !accounts.every(account => validateAccountName(account) === null))
    throw new Error('An account name is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        if (txType === 'comment') {
          const mentionAccounts = txData.body.match(/\B@[a-z0-9-.]+/gm);
          const mentionTargets = accounts
            ? accounts.map(name => {
              return `@${name}`;
            })
            : [];
          const setMentions = accounts ? mentionAccounts.some(name => mentionTargets.includes(name)) : true;
          if (mentionAccounts && setMentions && trx.transaction_id !== latestCatch) {
            latestCatch = trx.transaction_id;
            yield trx;
          }
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = accountMentions;
