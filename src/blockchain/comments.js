// const iteratorStream = require('async-iterator-to-stream');
const api = require('./../helper');
const { sleep, isValidAccountNames, readableStream } = require('./../utils');
/**
 * Scan blockchain for comments
 * @param {?Array=} authors - steem account names for comment author
 * @param {?Array=} parentAuthors - steem account names for post author
 * @returns {Stream.<Object>}
 * @memberof Scan.blockchain
 */
function getComments(authors, parentAuthors) {
  if (authors && isValidAccountNames(authors)) throw new Error('An author account name is not valid or exist.');
  if (parentAuthors && isValidAccountNames(parentAuthors))
    throw new Error('A parent author account name is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await api.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];

        const isUnique = latestCatch !== trx.transaction_id;
        const isComment = txType === 'comment' && txData.parent_author;
        const isParentAuthorExist = (parentAuthors && parentAuthors.includes(txData.parentAuthor)) || !parentAuthors;
        const isAuthorExist = (authors && authors.includes(txData.author)) || !authors;
        if (isUnique && isComment && isParentAuthorExist && isAuthorExist) {
          trx.transaction_id = latestCatch;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };
  return readableStream(iterator());
}

module.exports = getComments;
