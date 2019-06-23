const { isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan for mentions
 * @param {?Array=} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(accounts) {
  if (accounts && isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  const scan = this.scan;
  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];
      const isContent = txType === 'comment';
      if (isContent) {
        const mentionAccounts = txData.body.match(/\B@[a-z0-9-.]+/g);
        const mentionTargets = accounts
          ? accounts.map(name => {
            return `@${name}`;
          })
          : [];
        const setMentions = accounts ? mentionAccounts.some(name => mentionTargets.includes(name)) : true;
        if (mentionAccounts && setMentions)
          yield trx;
      }
    }
  };

  return readableStream(iterator());
};
