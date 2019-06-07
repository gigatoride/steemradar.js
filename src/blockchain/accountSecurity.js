const iteratorStream = require('async-iterator-to-stream');
const blockchain = require('../helper');
const { validateAccountName } = require('steem').utils;
const { sleep } = require('../utils');

/**
 * Scan for security threats or account changes/transfers
 * @returns {Stream.<Object>} - transaction
 * @access public
 * @memberof Scan.blockchain
 */
function accountSecurity(accounts) {
  if (!accounts.every(account => validateAccountName(account) === null))
    throw new Error('An account name is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const operationTypes = ['account_update', 'change_recovery_account', 'transfer_from_savings'];
      const transactions = await blockchain.getTransactions();

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

  return iteratorStream.obj(iterator());
}

module.exports = accountSecurity;
