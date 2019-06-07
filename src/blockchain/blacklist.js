const iteratorStream = require('async-iterator-to-stream');
const blockchain = require('./../helper');
const { sleep } = require('./../utils');
const { isBlacklisted } = require('../utils');

/**
 * Scan for any blacklisted user on blockchain latest blocks.
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function blacklist() {
  const iterator = async function * (ms = 700) {
    let latestCatch;
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
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
        if (account && trx.transaction_id !== latestCatch) {
          const res = await isBlacklisted(account);
          if (res.blacklisted.length) yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = blacklist;
