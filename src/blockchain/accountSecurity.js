const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan for security threats or account changes/transfers
 * @param {?Array=} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(accounts) {
  if (isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  const scan = this.scan;
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const operationTypes = ['account_update', 'change_recovery_account', 'transfer_from_savings'];
      const transactions = await scan.getTransactions();

      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];

        const alert = txType === 'transfer' ? accounts.includes(txData.from) : operationTypes.includes(txType);

        if (alert && trx.transaction_id !== latestCatch) {
          latestCatch = trx.transaction_id;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
