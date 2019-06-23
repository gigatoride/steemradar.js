const { sleep, readableStream } = require('../utils');

/**
 * Stream account counter
 * @returns {Stream.<Int>} - account number
 * @memberof Scan.blockchain
 */
module.exports = function() {
  const scan = this.scan;
  const iterator = async function * (ms = 700) {
    let current;
    while (true) {
      const count = await scan.getAccountCount();
      if (count && current !== count) {
        current = count;
        yield count;
      }

      await sleep(ms);
    }
  };

  return readableStream(iterator());
};
