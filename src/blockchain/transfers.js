const { sleep, isValidAccountNames, readableStream } = require('../utils');

/**
 * Scan blockchain transfers
 * @param {?Array=} senders - steem account names for senders
 * @param {?Array=} receivers - steem account names for receivers
 * @param {?String=} targetMemo - search by memo
 * @param {!Number} minAmount - minimum amount (SBD|STEEM)
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 */
module.exports = function(senders, receivers, minAmount, targetMemo) {
  if (receivers && isValidAccountNames(receivers)) throw new Error('Receivers are not valid or not an array.');
  if (senders && isValidAccountNames(senders)) throw new Error('Senders are not valid or not an array.');

  const scan = this.scan;

  if (isNaN(parseInt(minAmount)) || !/(SBD|STEEM|\|)/.test(minAmount))
    throw new Error('Target amount is not valid expected 0.000 STEEM|SBD.');

  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const transactions = await scan.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        if (txType === 'transfer') {
          const { from, to, amount, memo } = txData;

          const isUnique = (trx.transaction_id || trx.trx_id) !== latestCatch;
          const isSendersExist = (senders && senders.includes(from)) || !senders;
          const isReceiversExist = (receivers && receivers.includes(to)) || !receivers;
          const isMemoMatch = (targetMemo && memo.includes(targetMemo)) || !targetMemo;

          if (isUnique && isSendersExist && isReceiversExist && isMemoMatch) {
            const [targetAmount, currency] = minAmount.split(/\s/);
            const reAmount = new RegExp(currency);
            if (reAmount.test(amount) && parseFloat(targetAmount) <= parseFloat(amount)) {
              latestCatch = trx.transaction_id;
              yield trx;
            }
          }
        }
      }
      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
