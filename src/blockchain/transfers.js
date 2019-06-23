const { isValidAccountNames, readableStream } = require('../utils');

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

  const iterator = async function * () {
    for await (const trx of scan.getTransactions()) {
      const [txType, txData] = trx.operations[0];
      if (txType === 'transfer') {
        const { from, to, amount, memo } = txData;

        const isSendersExist = (senders && senders.includes(from)) || !senders;
        const isReceiversExist = (receivers && receivers.includes(to)) || !receivers;
        const isMemoMatch = (targetMemo && memo.includes(targetMemo)) || !targetMemo;

        if (isSendersExist && isReceiversExist && isMemoMatch) {
          const [targetAmount, currency] = minAmount.split(/\s/);
          const reAmount = new RegExp(currency);
          if (reAmount.test(amount) && parseFloat(targetAmount) <= parseFloat(amount)) yield trx;
        }
      }
    }
  };

  return readableStream(iterator());
};
