const iteratorStream = require('async-iterator-to-stream');
const { validateAccountName } = require('steem').utils;
const blockchain = require('./../helper');
const { sleep } = require('./../utils');

/**
 * Scan blockchain transfers
 * @param {Array} senders - steem account names for senders
 * @param {Array} receivers - steem account names for receivers
 * @param {String} targetMemo - search by memo
 * @param {Object} opts - options
 * @param {Number} opts.minAmount - transfers minimum amount
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
function transfers(senders, receivers, targetMemo, opts = {}) {
  const minAmount = opts.minAmount;

  if (receivers) {
    if (!Array.isArray(receivers)) throw new Error('Receivers are not in array.');

    if (!receivers.every(account => validateAccountName(account) === null)) throw new Error('Receivers are not valid.');
  }

  if (senders) {
    if (!Array.isArray(senders)) throw new Error('Senders are not in array.');
    if (!senders.every(account => validateAccountName(account) === null)) throw new Error('Senders are not valid.');
  }

  if (isNaN(parseInt(minAmount)) || !/(SBD|STEEM|\|)/.test(minAmount))
    throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        if (txType === 'transfer') {
          const { from, to, amount, memo } = txData;
          if (
            !senders
              ? true
              : senders.includes(from) && !receivers
                ? true
                : receivers.includes(to) && !targetMemo
                  ? true
                  : memo.includes(targetMemo)
          ) {
            const [targetAmount, currency] = minAmount.split(/\s/);
            const reAmount = new RegExp(currency);
            if (
              reAmount.test(amount) &&
              parseFloat(targetAmount) <= parseFloat(amount) &&
              trx.transaction_id !== latestCatch
            ) {
              latestCatch = trx.transaction_id;
              yield trx;
            }
          }
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = transfers;
