/**
 * Module dependencies.
 */

const { PassThrough } = require('stream');
const blockchain = require('./blockchain');
const utils = require('../utils');
const utopian = require('node-utopian-rocks');
const config = require('../../config.json');

module.exports = class Utopian extends blockchain {
  /**
   * Utopian scan for recently added posts
   * @param {string} category - category name
   * @param {number} ms - milliseconds
   */
  posts(category, ms = 200) {
    const stream = new PassThrough({ objectMode: true });

    let lastPost;
    const update = async() => {
      if (!this.pause) {
        try {
          this.post = await utopian.getPosts(category, 'unreviewed');
          if (Array.isArray(this.post)) {
            this.post = this.post.pop();
            if (!lastPost || lastPost !== this.post._id.$oid) {
              lastPost = this.post._id.$oid;
              stream.write(this.post);
            }
          }
        } catch (err) {
          stream.emit('error', err);
        }
      }
      await utils.sleep(ms);
      await update();
    };
    update();
    return stream;
  }

  /**
   * Scanning for Utopian-io Vote
   */
  vote() {
    const stream = new PassThrough({ objectMode: true });

    const username = config.dapps[0].account;
    this.operations
      .on('data', async operation => {
        if (!this.pause) this.operations.pause();
        const [txType, txData] = operation.op;
        if (username === txData.author && txType === 'vote') {
          stream.write(txData);
        }
      })
      .on('error', err => {
        stream.emit('error', err);
      });
    return stream;
  }

  /**
   * Utopian scan for recently added posts
   * @param {number} ms - milliseconds
   */
  reviews(ms = 200) {
    const stream = new PassThrough({ objectMode: true });

    let lastReview;
    const update = async() => {
      if (!this.pause) {
        try {
          this.review = await utopian.getPosts(null, 'reviewed');
          if (Array.isArray(this.review)) {
            this.review = this.review.pop();
            if (!lastReview || lastReview !== this.review._id.$oid) {
              lastReview = this.review._id.$oid;
              stream.write(this.review);
            }
          }
        } catch (err) {
          stream.emit('error', err);
        }
      }
      await utils.sleep(ms);
      await update();
    };
    update();
    return stream;
  }
};
