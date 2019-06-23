const http = require('http');
const profanities = require('profanities');
const { validateAccountName } = require('steem').utils;
const config = require('./../config.json');
const { Readable } = require('stream');
const fs = require('fs');

/** @private */
module.exports = {
  /**
   * Better method for reading json files
   */
  readJson: (path, cb) => {
    fs.readFile(require.resolve(path), (err, data) => {
      if (err) cb(err);
      else cb(null, JSON.parse(data));
    });
  },
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
   * Check for profane words in body
   * @param {String} broadcast - Steem broadcast content
   */
  isProfane: body => {
    return (
      !body ||
      body.split(/\s/gm).some(word => {
        return profanities.includes(word);
      })
    );
  },

  /**
   * Match global blacklisted names
   * @param {String} name - Steem account name
   * @return {Object} - blacklisted names
   */
  isBlacklisted: name => {
    return new Promise((resolve, reject) => {
      http
        .get(`${config.blacklistURL}/user/${name}`, res => {
          const { statusCode } = res;
          const contentType = res.headers['content-type'];

          let error;
          const codes = [200, 301, 302];
          if (!codes.includes(statusCode)) error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
          else if (!/^application\/json/.test(contentType))
            error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
          if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            return;
          }

          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', chunk => {
            rawData += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(rawData);
              resolve(parsedData);
            } catch (e) {
              reject(e.message);
            }
          });
        })
        .on('error', reject);
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
