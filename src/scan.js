const dsteem = require('dsteem')
const blockchain = require('./helpers/blockchain')
const database = require('./helpers/database')
const utopian = require('./helpers/utopian')
const config = require('./../config.json')

class Scan {
  constructor (options = {}) {
    this.options = options.node ? options : config
    this.client = new dsteem.Client(this.options.node)
    this.blockchain = new blockchain.Blockchain(this)
    this.database = new database.Database(this)
    this.utopian = new utopian.Utopian(this)
  }

  /**
   * Pause all instances
   */
  pause () {
    this.blockchain.pause()
    this.database.pause()
    this.utopian.pause()
  }

  /**
   * Resume all instances
   */
  resume () {
    this.blockchain.resume()
    this.database.resume()
    this.utopian.resume()
  }
}

// Exports class
exports.Scan = Scan
