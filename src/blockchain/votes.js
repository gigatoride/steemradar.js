const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Get accounts votes or entire blockchain
 * @param {?Array=} accounts - scanning accounts votes
 * @param {!Number} targetWeight - the minimum vote weight
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(accounts, targetWeight) {
  if (targetWeight && !isNaN(targetWeight)) throw new Error('weight is not a valid number');

  if (accounts && isValidAccountNames(accounts)) throw new Error('An account name is not valid or exist.');

  let latestCatch;
  const scan = this.scan;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await scan.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];

        const isUnique = trx.transaction_id !== latestCatch;
        const isVote = txType === 'vote';
        const isAccountExist = (accounts && accounts.includes(txData.author)) || !accounts;
        const isMinWeight = !targetWeight || targetWeight <= txData.weight;

        if (isUnique && isVote && isAccountExist && isMinWeight) {
          latestCatch = trx.transaction_id;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
