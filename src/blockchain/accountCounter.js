const { sleep, readableStream } = require('../utils');

/**
 * Stream account counter
 * @returns {Stream.<Int>} - account number
 * @memberof Scan.blockchain
 */
module.exports = function() {
  const scan = this.scan;
  let latestCatch;
  const iterator = async function * (ms = 700) {
    while (true) {
      const count = await scan.getAccountCount();
      if (count && latestCatch !== count) {
        latestCatch = count;
        yield count;
      }

      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
