const Blockchain = require('./helpers/blockchain');
const Database = require('./helpers/database');
const Utopian = require('./helpers/utopian');
const defaultConfig = require('./../config.json');

class Scan {
  constructor(options = {}) {
    this.options =
      Object.keys(options).length === 0 && options.constructor === Object ? defaultConfig : options;

    this.node = this.options.node;

    this.blockchain = new Blockchain(this);
    this.database = new Database(this);
    this.utopian = new Utopian(this);
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
