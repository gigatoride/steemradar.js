const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan for mentions
 * @param {?Array=} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(accounts) {
  if (accounts && isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  const scan = this.scan;
  let latestCatch;
  const iterator = async function * (ms = 800) {
    while (true) {
      const transactions = await scan.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        const isUnique = trx.transaction_id !== latestCatch;
        const isContent = txType === 'comment';
        if (isUnique && isContent) {
          const mentionAccounts = txData.body.match(/\B@[a-z0-9-.]+/g);
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
};
