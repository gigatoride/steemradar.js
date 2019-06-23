const { validateAccountName } = require('steem').utils;
const { isProfane, readableStream } = require('./../utils');
/**
 * Scan blockchain comments/posts/replies that includes profane
 * @param {?String=} name - steem account names
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(name) {
  if (name && !validateAccountName(name)) throw new Error('Account name is not valid or exist.');

  const scan = this.scan;
  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];
      switch (txType) {
        case 'comment':
          if (!name || txData.author === name)
            if (isProfane(txData.body)) {
              yield trx;
            }
          break;
        case 'transfer':
          if (!name || txData.from === name)
            if (isProfane(txData.memo)) {
              yield trx;
            }
          break;
      }
    }
  };

  return readableStream(iterator());
};
