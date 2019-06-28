const http = require('http');
const profanities = require('profanities');
const config = require('./../config.json');

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
   * All possible names of operations property
   */
  setOperation: trx => {
    return trx.operation || trx.op || trx.operations[0];
  },
  /**
   * Checks if any mention exist in body
   */
  isMention: body => {
    const mentions = body.match(/\B@[a-z0-9-.]+/g);
    return mentions ? mentions.length : false;
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
          if (statusCode !== 200) error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
          else if (!/^application\/json/.test(contentType))
            error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
          if (error) {
            reject(error.message);
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
   * Check for any profane in body
   */
  isProfanity: body => {
    return (
      !body ||
      body.split(/\s/gm).some(word => {
        return profanities.includes(word);
      })
    );
  },
  /**
   * Get comment type parent or child
   */
  getCommentType: data => {
    return data.parent_author ? 'child' : 'parent';
  }
};
