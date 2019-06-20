const blockchain = require('../helper');
const { isBlacklisted, readableStream, sleep } = require('../utils');

/**
 * Scan for any blacklisted user on blockchain latest blocks.
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getBlacklisted() {
  const iterator = async function * (ms = 800) {
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
          latestCatch = trx.transaction_id;
          const res = await isBlacklisted(account);
          if (res.blacklisted && res.blacklisted.length) yield trx;
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
}

module.exports = getBlacklisted;
