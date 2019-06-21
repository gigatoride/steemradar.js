const { readableStream, sleep } = require('../utils');
const config = require('../../config.json');
/**
 * Tracking funds until it goes out of blockchain by 3rd party exchange
 * @param {!String} name - steem account to be tracked.
 * @param {?String} trxId - transaction Id for the transfer
 * @param {?Object} opts - options
 * @param {Boolean} opts.multi - multi tracking
 * @param {Array} opts.exchanges - targeted steem exchanges
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(name, trxId, opts = {}) {
  const scan = this.scan;
  const exchanges = opts.exchanges || config.exchanges;

  // Returns latest user tansfer or by transfer id
  const findLatestTransfer = transactions => {
    return transactions.reverse().find(trx => {
      let [txType, txData] = trx[1].op;

      const isTransfer = txType === 'transfer';
      return trxId ? isTransfer && trx[1].trx_id === trxId : isTransfer && txData.from === name;
    });
  };

  let latestCatch;
  const iterator = async function * (ms = 700) {
    let out = false;
    const recentTransactions = await scan.getRecentAccountTransactions(name);
    const targetTrx = findLatestTransfer(recentTransactions);
    if (targetTrx) {
      let nextTarget = targetTrx[1];
      nextTarget['operations'] = [...nextTarget.op]; // Rename op to operations to prevent any conflict with block transactions object pattern
      delete nextTarget.op; // Delete the old key

      yield nextTarget;
      const firstAccount = nextTarget.operations[0][1].to;
      let linkedAccounts = [firstAccount];
      if (exchanges.includes(firstAccount)) out = true;
      else
        while (!out) {
          const previousTrxData = nextTarget.operations[0][1];
          const transactions = await scan.getTransactions();
          for (const trx of transactions) {
            const [latestTrxType, latestTrxData] = trx.operations[0];
            const isUnique = latestCatch !== trx.transaction_id;
            if (isUnique && latestTrxType === 'transfer') {
              const isSenderMatch = opts.multi
                ? linkedAccounts.includes(latestTrxData.from)
                : latestTrxData.from === previousTrxData.to;
              if (isSenderMatch) {
                latestCatch = trx.transaction_id;
                nextTarget = trx;
                linkedAccounts.push(latestTrxData.to);
                yield trx;
              }
              if (targetTrx && !exchanges.includes(previousTrxData.to)) out = true;
            }
          }
          await sleep(ms);
        }
    }
  };

  return readableStream(iterator());
};
