const api = require('../helper');
const { sleep, readableStream } = require('../utils');

/**
 * Stream account counter
 * @returns {Stream.<Int>} - account number
 * @memberof Scan.blockchain
 */
function getAccountCounter() {
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

  return readableStream(iterator());
}

module.exports = getAccountCounter;
