const axios = require('axios');
const Profane = require('bad-words');
const badWord = new Profane();

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
  isProfane: broadcast => {
    const word = badWord.isProfane(broadcast);
    return !word ? false : word;
  },

  /**
   * Match global blacklisted usernames
   * @param {String} username - Steem username
   * @return {Object} - blacklisted usernames
   */
  isBlacklisted: username => {
    return axios
      .get('http://blacklist.usesteem.com' + '/user/' + username)
      .then(res => {
        return { username: res.data.user, blacklisted: res.data.blacklisted };
      })
      .catch(err => {
        return err;
      });
  }
};
