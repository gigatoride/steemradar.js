const { isValidAccountNames, readableStream } = require('./../utils');
/**
 * Scan blockchain for posts
 * @param {?Array=} authors - steem account names for post author
 * @returns {Stream.<Object>}
 * @memberof Scan.blockchain
 */
module.exports = function(authors) {
  if (authors && isValidAccountNames(authors)) throw new Error('An author account name is not valid or exist.');

  const scan = this.scan;
  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];
      const isPost = txType === 'comment' && !txData.parent_author;
      const isAuthorExist = (authors && authors.includes(txData.author)) || !authors;
      if (isPost && isAuthorExist) yield trx;
    }
  };
  return readableStream(iterator());
};
