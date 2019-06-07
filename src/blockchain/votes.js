const iteratorStream = require('async-iterator-to-stream');
const { validateAccountName } = require('steem').utils;
const blockchain = require('./../helper');
const { sleep } = require('./../utils');

/**
 * Get accounts votes or entire blockchain
 * @param {Array} accounts - scanning accounts votes
 * @param {Number} targetWeight - the minimum vote weight
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function votes(accounts, targetWeight) {
  if (typeof targetWeight !== 'number') throw new Error('weight is not a valid number');

  if (accounts && !accounts.every(account => validateAccountName(account) === null))
    throw new Error('Username is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        if (!accounts || (accounts.includes(txData.author) && txType === 'vote'))
          if (targetWeight <= txData.weight && trx.transaction_id !== latestCatch) {
            latestCatch = trx.transaction_id;
            yield trx;
          }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = votes;
