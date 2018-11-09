/**
 * Module dependencies.
 */

const blockchain = require('./blockchain');
const utils = require('../utils');
const utopian = require('node-utopian-rocks');
const config = require('../../config.json');

module.exports = class Utopian extends blockchain {
  /**
   * Pause running stream
   */
  pause() {
    this.running = false;
  }

  /**
   * Pause resume stream
   */
  resume() {
    this.running = true;
  }

  /**
   * Utopian scan for recently added posts
   * @param {string} category - category name
   * @param {function} callback - callback for err or results.
   * @param {number} ms - milliseconds
   */
  posts(category, callback, ms = 200) {
    if (typeof callback === 'function') {
      this.running = true;
      let lastPost;
      const update = async() => {
        if (this.running) {
          this.post = await utopian.getPosts(category, 'unreviewed');
          if (Array.isArray(this.post)) {
            this.post = this.post.pop();
            if (!lastPost || lastPost !== this.post._id.$oid) {
              lastPost = this.post._id.$oid;
              callback(null, this.post);
            }
          }
        }
        await utils.sleep(ms);
        await update();
      };
      update();
    } else throw new Error('Callback is not a function');
  }

  /**
   * Scanning for Utopian-io Vote
   * @param {function} callback - a callback for votes results
   */
  vote(callback) {
    if (typeof callback === 'function') {
      this.running = true;
      const username = config.dapps[0].account;
      this.stream
        .on('data', async operation => {
          if (!this.running) this.stream.pause();
          const [txType, txData] = operation.op;
          if (username === txData.author && txType === 'vote') callback(null, txData);
        })
        .on('error', callback);
    } else throw new Error('Callback is not a function');
  }

  /**
   * Utopian scan for recently added posts
   * @param {function} callback - callback for err, results.
   * @param {number} ms - milliseconds
   */
  reviews(callback, ms = 200) {
    if (typeof callback === 'function') {
      this.running = true;
      let lastReview;
      const update = async() => {
        if (this.running) {
          this.review = await utopian.getPosts(null, 'reviewed');
          if (Array.isArray(this.review)) {
            this.review = this.review.pop();
            if (!lastReview || lastReview !== this.review._id.$oid) {
              lastReview = this.review._id.$oid;
              callback(null, this.review);
            }
          }
        }
        await utils.sleep(ms);
        await update();
      };
      update();
    } else throw new Error('Callback is not a function');
  }
};
