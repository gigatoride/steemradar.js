const iteratorStream = require('async-iterator-to-stream');
const api = require('../helper');
const { sleep } = require('../utils');

/**
 * Stream account counter
 * @returns {Stream.<Number>} - account number
 * @memberof Scan.blockchain
 */
function accountCounter() {
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const count = await api.getAccountCount();
      if (count && latestCatch !== count) {
        latestCatch = count;
        yield count;
      }

      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = accountCounter;
