const api = require('./../helper');
const { percentage, readableStream } = require('../utils');
const config = require('../../config.json');
/**
 * Tracking funds until it goes out of blockchain by 3rd party exchange
 * @param {!String} name - steem account to be tracked.
 * @param {?String} trxId - transaction Id for the transfer
 * @param {?Object} opts - options
 * @param {!Boolean} opts.multi - multi tracking
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function getFundsTracker(name, trxId, opts = {}) {
  const multiTracking = opts.multi;
  const exchanges = opts.exchanges || config.exchanges;

  const getTransfer = transactions => {
    return transactions.reverse().find(trx => {
      if (trxId) return trx[1].op[0] === 'transfer' && trx[1].trx_id === trxId;
      else return trx[1].op[0] === 'transfer' && trx[1].op[1].from === name;
    });
  };

  let latestCatch;
  const iterator = async function * () {
    let out = false;
    if (!multiTracking) {
      const history = await api.getRecentAccountTransactions(name);
      const follow = getTransfer(history);
      let target = {
        trxId: follow[1].trx_id,
        name: follow[1].op[1].to,
        amount: follow[1].op[1].amount,
        timestamp: follow[1].timestamp,
        percentage: 100
      };
      const fullAmount = target.amount;
      if (exchanges.includes(target.name)) yield target;
      else {
        yield target;
        while (!out) {
          const transactions = api.streamTransactions();
          for (const trx of transactions) {
            const [txType, txData] = trx[0];
            if (txType === 'transfer' && txData.from === target.name && latestCatch !== trx.transaction_id) {
              latestCatch = trx.transaction_id;
              target = {
                trxId: trx.transaction_id,
                name: txData.to,
                amount: txData.amount,
                timestamp: trx.timestamp,
                percentage: percentage(parseFloat(txData.amount), parseFloat(fullAmount))
              };
              yield trx;
              if (target && !exchanges.includes(target.name)) out = true;
            }
          }
        }
      }
    }
  };

  return readableStream(iterator());
}

module.exports = getFundsTracker;
