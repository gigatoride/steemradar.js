const { sleep } = require('./../utils');
const Transport = require('./transport');

class SteemAPI {
  constructor(options = {}) {
    if (typeof options !== 'object')
      throw new Error('InvalidArgument: options should be a valid `object`');
    this.transport = new Transport(options);
  }

  /**
   * Call api method by params using condenser api
   * @param {String} method
   * @param {Array} params
   */
  async call(method, params = []) {
    return this.transport.call('condenser_api', method, params);
  }

  /**
   * Get dynamic global properties for Blockchain
   * @returns {Promise} - resolves properties
   */
  getDynamicGlobalProperties() {
    return this.call('get_dynamic_global_properties');
  }

  /**
   * Get block
   * @param {Number} blockNum
   * @returns {Promise} - resolves after getting block by number
   */
  getBlock(blockNum) {
    return this.call('get_block', [blockNum]);
  }

  /**
   * Get block header
   * @param {Number} blockNum
   * @returns {Promise} - resolves after getting block header
   */
  getBlockHeader(blockNum) {
    return this.call('get_block_header', [blockNum]);
  }

  /**
   * Get block operations
   * @param {Number} blockNum
   * @returns {Promise} - resolves after getting operations in block
   */
  getBlockOperations(blockNum, onlyVirtual = false) {
    return this.call('get_ops_in_block', [blockNum, onlyVirtual]);
  }

  /**
   * Get blockchain account count
   * @returns {Promise} - resolves after getting account count
   */
  getAccountCount() {
    return this.call('get_account_count');
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNum() {
    const properties = await this.getDynamicGlobalProperties();
    return properties.last_irreversible_block_num;
  }

  /**
   * Get sequent block number
   */
  async * getSequentBlockNum(ts = 2) {
    let current = await this.getCurrentBlockNum();
    let id = current;
    while (true) {
      while (current > id) yield id++;
      await sleep(ts * 1000);
      current = await this.getCurrentBlockNum();
    }
  }

  /**
   * Get all operations by block number
   */
  async * getOperations() {
    for await (const num of this.getSequentBlockNum()) {
      const operations = await this.getBlockOperations(num);
      for (const op of operations) yield op;
    }
  }
}

module.exports = SteemAPI;
