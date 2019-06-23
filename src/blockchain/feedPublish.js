const { readableStream } = require('../utils');

/**
 * Stream price feed
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function() {
  const scan = this.scan;
  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType] = trx.operations[0];
      if (txType === 'feed_publish') yield trx;
    }
  };

  return readableStream(iterator());
};
