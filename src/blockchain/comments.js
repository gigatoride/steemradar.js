const { isValidAccountNames, readableStream } = require('./../utils');
/**
 * Scan blockchain for comments
 * @param {?Array=} authors - steem account names for comment author
 * @param {?Array=} parentAuthors - steem account names for post author
 * @returns {Stream.<Object>}
 * @memberof Scan.blockchain
 */
module.exports = function(authors, parentAuthors) {
  const scan = this.scan;
  if (authors && isValidAccountNames(authors)) throw new Error('An author account name is not valid or exist.');
  if (parentAuthors && isValidAccountNames(parentAuthors))
    throw new Error('A parent author account name is not valid or exist.');

  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];

      const isComment = txType === 'comment' && txData.parent_author;
      const isParentAuthorExist = (parentAuthors && parentAuthors.includes(txData.parentAuthor)) || !parentAuthors;
      const isAuthorExist = (authors && authors.includes(txData.author)) || !authors;
      if (isComment && isParentAuthorExist && isAuthorExist) yield trx;
    }
  };
  return readableStream(iterator());
};
