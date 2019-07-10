const WebSocket = require('rpc-websockets').Client;

class Transport {
  constructor(opts = {}, blockchain) {
    if (opts.transportType !== 'ws')
      throw new Error(`Unsupported transport type.`);

    this.options = opts;
    this.blockchain = blockchain;
  }

  /**
   * Starts the transport by type
   */
  start() {
    if (this._start) return this._start;

    if (this.options.transportType)
      this._start = new Promise((resolve, reject) => {
        this.ws = new WebSocket(this.options.nodeURL, {
          reconnect: true,
          max_reconnects: 0
        });
        this.ws
          .on('open', () => {
            this.isWebSocketReady = true;
            this.ws.addListener('error', this.onError);
            this.ws.addListener('close', this.onClose);
            resolve();
          })
          .on('error', err => {
            this._start = null;
            reject(err);
          });
      });

    return this._start;
  }

  /**
   * Close the transport by type
   */
  async stop() {
    if (this.ws) {
      await this.start();
      this._start = null;
      this.isWebSocketReady = false;
      this.ws.removeListener('error');
      this.ws.removeListener('close');
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Listener for error event
   */
  onError(error) {
    this.blockchain.emit('error', error);
  }

  /**
   * Listener for close event
   */
  onClose() {
    this.blockchain.emit('close', 'Connection was closed. retrying...');
  }

  /**
   * Returns transport for RPC call
   */
  async call(api, method, params) {
    await this.start(); // Check if connection established before any call
    return this.ws.call(`${api}.${method}`, params);
  }
}

module.exports = Transport;
