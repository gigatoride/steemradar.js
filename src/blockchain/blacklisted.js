const { isBlacklisted, readableStream } = require('../utils');

/**
 * Scan for any blacklisted user on blockchain latest blocks.
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function() {
  const scan = this.scan;
  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      let account;
      const [txType, txData] = trx.operations[0];
      switch (txType) {
        case 'transfer':
          account = txData.from;
          break;
        case 'comment':
          account = txData.author;
          break;
        default:
          account = null;
          break;
      }
      if (account) {
        const res = await isBlacklisted(account);
        if (res.blacklisted && res.blacklisted.length) yield trx;
      }
    }
  };

  return readableStream(iterator());
};
