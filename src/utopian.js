const { readableStream } = require('./utils');
const config = require('./../config.json');

class Utopian {
  constructor(scan) {
    this.scan = scan;
  }

  /**
   * Scan for latest utopian.io posts
   * @param {?Object=} query
   * @param {?String} query.category - utopian targeted category
   * @returns {Stream.<object>}
   * @memberof Scan.utopian
   */
  getPosts(query = {}) {
    const scan = this.scan;
    const iterator = async function * () {
      for await (const trx of scan.getTransactions()) {
        const [txType, txData] = trx.operations[0];

        const isPost = txType === 'comment' && !txData.parent_author;

        if (isPost) {
          const metadata = JSON.parse(txData.json_metadata);

          const isUtopianContribution = metadata.category === 'utopian-io' || metadata.tags[0] === 'utopian-io';
          const isUtopianCategory = metadata.tags.some(tag => {
            return config.utopian_tags.includes(tag);
          });

          const isUtopianTargetCategoryMatch = !query.category || metadata.tags.includes(query.category);

          if (isUtopianContribution && isUtopianCategory && isUtopianTargetCategoryMatch) yield trx;
        }
      }
    };

    return readableStream(iterator());
  }
}

module.exports = Utopian;
