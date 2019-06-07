const iteratorStream = require('async-iterator-to-stream');
const api = require('./../helper');
const { percentage } = require('../utils');
const exchanges = require('../../exchanges.json');
/**
 * Tracking funds until it goes out of blockchain by 3rd party exchange
 * @param {String} username - steem account to be tracked.
 * @param {String} trxId - transaction Id for the transfer
 * @param {Object} opts - options
 * @param {Boolean} opts.multi - multi tracking
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function fundsTracker(username, trxId, opts = {}) {
  const multiTracking = opts.multi;

  const getTransfer = transactions => {
    return transactions.reverse().find(trx => {
      if (trxId) return trx[1].op[0] === 'transfer' && trx[1].trx_id === trxId;
      else return trx[1].op[0] === 'transfer' && trx[1].op[1].from === username;
    });
  };

  let latestCatch;
  const iterator = async function * () {
    let out = false;
    if (!multiTracking) {
      const history = await api.getRecentAccountTransactions(username);
      const follow = getTransfer(history);
      let target = {
        trxId: follow[1].trx_id,
        username: follow[1].op[1].to,
        amount: follow[1].op[1].amount,
        timestamp: follow[1].timestamp,
        percentage: 100
      };
      const fullAmount = target.amount;
      if (exchanges.includes(target.username)) yield target;
      else {
        yield target;
        while (!out) {
          const transactions = api.streamTransactions();
          for (const trx of transactions) {
            const [txType, txData] = trx[0];
            if (txType === 'transfer' && txData.from === target.username && latestCatch !== trx.transaction_id) {
              latestCatch = trx.transaction_id;
              target = {
                trxId: trx.transaction_id,
                username: txData.to,
                amount: txData.amount,
                timestamp: trx.timestamp,
                percentage: percentage(parseFloat(txData.amount), parseFloat(fullAmount))
              };
              yield trx;
              if (target && !exchanges.includes(target.username)) out = true;
            }
          }
        }
      }
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = fundsTracker;
