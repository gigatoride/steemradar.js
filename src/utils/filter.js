const axios = require('axios');
const Profane = require('bad-words');
// Filter profane words.

const badWord = new Profane(); // Create new profane instance

module.exports = {
  profaneWord: (broadcast) => {
    const word = badWord.isProfane(broadcast); // Check that broadcast has profane or not
    return !word ? false : word; // Check if falsy value or not.
  },
  inBlackList: async (username) => {
    let result;
    await axios // Get request by username from blockchain flow.
        .get('http://blacklist.usesteem.com' + '/user/' + username)
        .then((res) => {
          result = {username: res.data.user, blacklisted: res.data.blacklisted}; // Return the blacklisted user if exist.
        })
        .catch(result); // Catch error and return it.
    return result; // Return an object
  },
};
