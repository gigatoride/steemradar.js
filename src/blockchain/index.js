class Blockchain {
  constructor(scan) {
    this.scan = scan;
  }
}

Blockchain.prototype.getAccountActivity = require('./accountActivity');
Blockchain.prototype.getAccountCounter = require('./accountCounter');
Blockchain.prototype.getAccountMentions = require('./accountMentions');
Blockchain.prototype.getAccountSecurity = require('./accountSecurity');
Blockchain.prototype.getBlacklisted = require('./blacklisted');
Blockchain.prototype.getComments = require('./comments');
Blockchain.prototype.getFeedPublish = require('./feedPublish');
Blockchain.prototype.getFundsTracker = require('./fundsTracker');
Blockchain.prototype.getPosts = require('./posts');
Blockchain.prototype.getProfanity = require('./profanity');
Blockchain.prototype.getTransfers = require('./transfers');
Blockchain.prototype.getVotes = require('./votes');

module.exports = Blockchain;
