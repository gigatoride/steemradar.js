const { validateAccountName } = require('steem').utils;
const { sleep, isProfane, readableStream } = require('./../utils');
/**
 * Scan blockchain comments/posts/replies that includes profane
 * @param {?String=} name - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(name) {
  if (name && !validateAccountName(name)) throw new Error('Account name is not valid or exist.');

  const scan = this.scan;
  const iterator = async function * (ms = 700) {
    let latestCatch;
    while (true) {
      const transactions = await scan.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        const isUnique = trx.transaction_id !== latestCatch;
        if (isUnique)
          switch (txType) {
            case 'comment':
              if (!name || txData.author === name)
                if (isProfane(txData.body)) {
                  latestCatch = trx.transaction_id;
                  yield trx;
                }
              break;
            case 'transfer':
              if (!name || txData.from === name)
                if (isProfane(txData.memo)) {
                  latestCatch = trx.transaction_id;
                  yield trx;
                }
              break;
          }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
