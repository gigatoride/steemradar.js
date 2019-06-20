const api = require('../helper');
const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan for mentions
 * @param {?Array=} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getAccountMentions(accounts) {
  if (accounts && isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await api.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        const isContent = txType === 'comment';
        const isUnique = trx.transaction_id !== latestCatch;
        if (isUnique && isContent) {
          const mentionAccounts = txData.body.match(/\B@[a-z0-9-.]+/gm);
          const mentionTargets = accounts
            ? accounts.map(name => {
              return `@${name}`;
            })
            : [];
          const setMentions = accounts ? mentionAccounts.some(name => mentionTargets.includes(name)) : true;
          if (mentionAccounts && setMentions) {
            latestCatch = trx.transaction_id;
            yield trx;
          }
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
}

module.exports = getAccountMentions;
