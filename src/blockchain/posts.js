const api = require('./../helper');
const { sleep, isValidAccountNames, readableStream } = require('./../utils');
/**
 * Scan blockchain for posts
 * @param {?Array=} authors - steem account names for post author
 * @returns {Stream.<Object>}
 * @memberof Scan.blockchain
 */
function getPosts(authors) {
  if (authors && isValidAccountNames(authors)) throw new Error('An author account name is not valid or exist.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await api.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];

        const isUnique = latestCatch !== trx.transaction_id;
        const isPost = txType === 'comment' && !txData.parent_author;
        const isAuthorExist = (authors && authors.includes(txData.author)) || !authors;

        if (isUnique && isPost && isAuthorExist) {
          trx.transaction_id = latestCatch;
          yield trx;
        }
      }
      await sleep(ms);
    }
  };
  return readableStream(iterator());
}

module.exports = getPosts;
