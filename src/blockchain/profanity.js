const iteratorStream = require('async-iterator-to-stream');
const { validateAccountName } = require('steem').utils;
const blockchain = require('./../helper');
const { sleep } = require('./../utils');
const { isProfane } = require('../utils');

/**
 * Scan blockchain comments/posts/replies that includes profane
 * @param {String} account - scanned account account
 * @returns {Stream.<Object>} - transaction
 * @memberof Scan.blockchain
 * @access private
 */
function profanity(account) {
  if (account && !validateAccountName(account)) throw new Error('account is not valid or exist.');

  const iterator = async function * (ms = 700) {
    let latestCatch;
    while (true) {
      const transactions = await blockchain.getTransactions();
      for (const trx of transactions) {
        const [txType, txData] = trx.operations[0];
        switch (txType) {
          case 'comment':
            if (!account || txData.author === account) {
              const word = isProfane(txData.body);
              if (typeof word === 'string' && trx.transaction_id !== latestCatch) yield trx;
            }
            break;
          case 'transfer':
            if (!account || txData.from === account) {
              const word = isProfane(txData.memo);
              if (typeof word === 'string' && trx.transaction_id !== latestCatch) yield trx;
            }
            break;
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = profanity;
