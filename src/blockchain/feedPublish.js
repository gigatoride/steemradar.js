const iteratorStream = require('async-iterator-to-stream');
const blockchain = require('../helper');
const { sleep } = require('../utils');

/**
 * Stream price feed
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function feedPublish() {
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType] = trx.operations[0];
        if (txType === 'feed_publish' && trx.transaction_id !== latestCatch) {
          latestCatch = trx.transaction_id;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = feedPublish;
