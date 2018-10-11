const dsteem = require('dsteem');
const blockchain = require('./helpers/blockchain');
const database = require('./helpers/database');
const utopian = require('./helpers/utopian');
const config = require('./../config.json');

/**
 * Scan Class
 */
class Scan {
  /**
   *
   * @param {object} options
   */
  constructor(options = {}) {
    // If node is not defined use the default config instead.
    this.options = options.node ? options : config;
    this.client = new dsteem.Client(this.options.node);
    // The following will use the Scan constructor config
    this.blockchain = new blockchain.Blockchain(this); // New instance for Blockchain class
    this.database = new database.Database(this); // New instance for Database class
    this.utopian = new utopian.Utopian(this); // New instance for Utopian class
  }

  /**
   * Pause all instances
   */
  pause() {
    this.blockchain.pause();
    this.database.pause();
    this.utopian.pause();
  }

  /**
   * Resume all instances
   */
  resume() {
    this.blockchain.resume();
    this.database.resume();
    this.utopian.resume();
  }
}

// Exports class
exports.Scan = Scan;
