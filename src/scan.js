const defaultConfig = require('./../config.json');
const steem = require('steem');

/**
 * @class
 */
class Scan {
  /**
   * @constructor
   * @desc Creates a scan instance
   * @param {object} options
   * @param {String} options.url node url
   */
  constructor(options = {}) {
    this.options = Object.keys(options).length === 0 && options.constructor === Object ? defaultConfig : options;
    this.url = this.options.url;
    steem.api.setOptions({ url: this.url });
  }
}

/**
 * @memberof Scan
 */
Scan.prototype.blockchain = require('./blockchain');

/**
 * @memberof Scan
 */
Scan.prototype.utopian = require('./utopian');

exports.Scan = Scan;
