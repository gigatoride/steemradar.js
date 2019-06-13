const { validateAccountName } = require('steem').utils;
const blockchain = require('./../helper');
const { sleep, isProfane, readableStream } = require('./../utils');
/**
 * Scan blockchain comments/posts/replies that includes profane
 * @param {?String=} name - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getProfanity(name) {
  if (name && !validateAccountName(name)) throw new Error('Account name is not valid or exist.');

  const iterator = async function * (ms = 700) {
    let latestCatch;
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        const isUnique = trx.transaction_id !== latestCatch;
        if (isUnique)
          switch (txType) {
            case 'comment':
              if (!name || txData.author === name) {
                const word = isProfane(txData.body);
                if (typeof word === 'string') {
                  latestCatch = trx.transaction_id;
                  yield trx;
                }
              }
              break;
            case 'transfer':
              if (!name || txData.from === name) {
                const word = isProfane(txData.memo);
                if (typeof word === 'string') {
                  latestCatch = trx.transaction_id;
                  yield trx;
                }
              }
              break;
          }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
}

module.exports = getProfanity;
