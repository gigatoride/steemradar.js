const Blockchain = require('./helpers/blockchain');
const Utopian = require('./helpers/utopian');
const defaultConfig = require('./../config.json');

class Scan {
  constructor(options = {}) {
    const modeTypes = ['default', 'transaction', 'operation'];
    this.options =
      Object.keys(options).length === 0 && options.constructor === Object
        ? defaultConfig
        : options;

    this.node = this.options.node;
    this.mode = this.options.mode;
    if (
      typeof this.options.mode === 'undefined' ||
      this.mode.includes(modeTypes)
    ) {
      this.blockchain = new Blockchain(this);
      this.utopian = new Utopian(this);
    } else {
      throw new Error(`Wrong mode type, please use ${modeTypes.join(' , ')}`);
    }
  }

  /**
   * Pause instance
   */
  pause() {
    this.blockchain.pause();
    this.utopian.pause();
  }

  /**
   * Resume instance
   */
  resume() {
    this.blockchain.resume();
    this.utopian.resume();
  }
}

// Exports class
exports.Scan = Scan;
