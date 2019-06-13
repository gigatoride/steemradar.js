const api = require('../helper');
const { sleep, readableStream } = require('../utils');

/**
 * Stream price feed
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getFeedPublish() {
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await api.getTransactions();
      for (const trx of transactions) {
        const [txType] = trx.operations[0];
        const isUnique = trx.transaction_id !== latestCatch;
        if (isUnique & (txType === 'feed_publish')) {
          latestCatch = trx.transaction_id;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
}

module.exports = getFeedPublish;
