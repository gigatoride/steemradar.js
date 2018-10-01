const profane = require('bad-words'), // Filter profane words.
  badWord = new profane();

module.exports = {
  profaneWord: comment => {
    const bad_word = badWord.isProfane(comment);
    return !bad_word ? false : bad_word;
  }
};
