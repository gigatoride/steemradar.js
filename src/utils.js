const axios = require('axios');
const Profane = require('bad-words');

const badWord = new Profane();

module.exports = {
  /**
   * Sleep for miliseconds
   * @param {number} ms - milliseconds
   * @param {Promise} - timeout for miliseconds
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
   * Match profane word in broadcast content
   * @param {string} broadcast - Steem broadcast content
   */
  profaneWord: broadcast => {
    const word = badWord.isProfane(broadcast);
    return !word ? false : word;
  },

  /**
   * Match global blacklisted usernames
   * @param {string} username - Steem username
   * @return {object} - blacklisted usernames
   */
  inBlackList: username => {
    return axios
      .get('http://blacklist.usesteem.com' + '/user/' + username)
      .then(res => {
        return { username: res.data.user, blacklisted: res.data.blacklisted };
      })
      .catch(err => {
        return err;
      });
  },

  /**
   * Steem account username validation
   * @param {array} users - usernames
   * @return {boolean}
   */
  validAccountName: users => {
    if (!users) return false;
    else if (!Array.isArray(users)) users = [users]; // Create an array if single username
    return !users.some(user => {
      /**
       * Regular Expression:
       *  Alphabet, Numbers, Dash, Dot with different Capturing groups and Non-Capturing group.
       *  Each segment must begin with a letter (a-z, English alphabet) and end with a letter or a number (0-9)
       *  Hyphens (-) must be accompanied side by side by letters or numbers
       *  no double hyphens. Hyphens can't be at the beginning or end of a segment either because of rule 3
       */
      const re = new RegExp(
        [
          '^[a-z](-[a-z0-9](-[a-z0-9])*)?',
          '(-[a-z0-9]|[a-z0-9])*',
          '(?:.[a-z](-[a-z0-9](-[a-z0-9])*)?',
          '(-[a-z0-9]|[a-z0-9])*)*$'
        ].join('')
      );
      return (
        user.length < 3 || // Username is less than 3
        user.length > 16 || // Username is more  than 16
        !re.test(user)
      );
    });
  }
};
