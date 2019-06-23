const { isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan for security threats or account changes/transfers
 * @param {?Array=} accounts - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(accounts) {
  if (isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  const scan = this.scan;
  const iterator = async function * () {
    const operationTypes = ['account_update', 'change_recovery_account', 'transfer_from_savings'];
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];

      const alert = txType === 'transfer' ? accounts.includes(txData.from) : operationTypes.includes(txType);

      if (alert) yield trx;
    }
  };

  return readableStream(iterator());
};
