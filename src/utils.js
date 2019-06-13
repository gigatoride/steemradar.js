const http = require('http');
const profanities = require('profanities');
const { validateAccountName } = require('steem').utils;
const config = require('./../config.json');
const { Readable } = require('stream');

/** @private */
module.exports = {
  /**
   * Sleep for milliseconds
   * @param {Number} ms - milliseconds
   * @returns {Promise} - timeout for milliseconds
   */
  sleep: ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  /**
   * Calculate percentage
   */
  percentage: (partial, total) => {
    return (100 * partial) / total;
  },
  /**
   * Calculate Average
   */
  average: arr => {
    return arr.reduce((p, c) => p + c, 0) / arr.length;
  },
  /**
   * Match profane word in broadcast content
   * @param {String} broadcast - Steem broadcast content
   */
  isProfane: body => {
    return body.split(/\s/gm).every(word => {
      return profanities.includes(word);
    });
  },

  /**
   * Match global blacklisted names
   * @param {String} name - Steem account name
   * @return {Object} - blacklisted names
   */
  isBlacklisted: name => {
    return new Promise((resolve, reject) => {
      http.get(
        {
          hostname: config.global_blacklist_api,
          port: 80,
          path: `/user/${name}`,
          agent: false // create a new agent just for this one request
        },
        res => {
          res.on('data', resolve);
          res.on('error', reject);
        }
      );
    });
  },
  /**
   * Account names validator
   * @param {Array} accountNames
   */
  isValidAccountNames: accountNames => {
    return Array.isArray(accountNames) ? !accountNames.every(name => validateAccountName(name) === null) : false;
  },
  /**
   * Creates a readable stream
   */
  readableStream: (iterable, opts) => {
    let iterator;
    if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();
    else throw new Error(iterable);

    const readable = new Readable({
      objectMode: true,
      ...opts
    });
    // Reading boolean to protect against _read
    // being called before last iteration completion.
    let reading = false;
    readable._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    async function next() {
      try {
        const { value, done } = await iterator.next();
        if (done) readable.push(null);
        else if (readable.push(await value)) next();
        else reading = false;
      } catch (err) {
        readable.destroy(err);
      }
    }
    return readable;
  }
};
