const api = require('./helper');
const { sleep, readableStream } = require('./utils');
const config = require('./../config.json');
/**
 * Scan for latest utopian.io posts
 * @param {?Object=} query
 * @param {?String} query.category - utopian targeted category
 * @returns {Stream.<object>}
 * @memberof Scan.utopian
 */
function getPosts(query = {}) {
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await api.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];

        const isUnique = trx.transaction_id !== latestCatch;
        const isPost = txType === 'comment' && !txData.parent_author;

        if (isUnique && isPost) {
          const metadata = JSON.parse(txData.json_metadata);

          const isUtopianContribution = metadata.category === 'utopian-io' || metadata.tags[0] === 'utopian-io';
          const isUtopianCategory = metadata.tags.every(tag => {
            config.utopian_tags.includes(tag);
          });

          const isUtopianTargetCategoryMatch = !query.category || metadata.tags.includes(query.category);

          if (isUtopianContribution && isUtopianCategory && isUtopianTargetCategoryMatch) {
            latestCatch = trx.transaction_id;
            yield trx;
          }
        }
        await sleep(ms);
      }
    }
  };

  return readableStream(iterator());
}

module.exports = { getPosts };
