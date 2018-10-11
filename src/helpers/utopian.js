const utopian = require('node-utopian-rocks'); // API client for utopian.rocks
const utils = require('./../utils'); // Some utils
const blockchain = require('./blockchain').Blockchain;
const config = require('./../../config.json');
/**
 * Utopian class for streaming
 */
class Utopian extends blockchain {
  /**
   * @param {object} client - scan class object
   */
  constructor(client) {
    super(client);
    this.running = true;
  }

  /**
   * Pause running stream
   */
  pause() {
    this.running = false; // Pause method
  }

  /**
   * Pause resume stream
   */
  resume() {
    this.running = true; // Resume method
  }

  /**
   * Utopian scan for recently added posts
   * @param {string} category - category name
   * @param {function} callback - callback for err or results.
   * @param {number} ms - milliseconds
   */
  posts(category, callback, ms = 200) {
    let lastPost; // Save latest post has been extracted.
    const update = async () => {
      // Pause or Resume
      if (this.running) {
        this.post = await utopian.getPosts(category, 'unreviewed');
        if (Array.isArray(this.post)) {
          this.post = this.post.pop();
          // Check if results is not streamed before.
          if (!lastPost || lastPost !== this.post._id.$oid) {
            lastPost = this.post._id.$oid; // Set latest post
            callback(null, this.post); // Get the last element in array.
          }
        }
      }
      await utils.sleep(ms);
      await update();
    }; // Keep streaming latest post.
    update();
  }

  /**
   * Monitoring Utopian-io Vote
   * @param {function} callback - a callback for votes results
   */
  vote(callback) {
    this.votes(config.dapps[0].account, 0, (err, res) => {
      if (this.running) callback(err, res);
    });
  }

  /**
   * Utopian scan for recently added posts
   * @param {function} callback - callback for err, results.
   * @param {number} ms - milliseconds
   */
  moderatorsReviews(callback, ms = 200) {
    let lastReview; // Save latest post has been extracted.
    const update = async () => {
      // Pause or Resume
      if (this.running) {
        this.review = (await utopian.getPosts(null, 'reviewed'));
        if (Array.isArray(this.review)) {
          this.review = this.review.pop();
          // Check if reviews is not streamed before.
          if (!lastReview || lastReview !== this.review._id.$oid) {
            lastReview = this.review._id.$oid; // Set latest post
            callback(null, this.review); // Get the last element in array.
          }
        }
      }
      await utils.sleep(ms);
      await update();
    }; // Keep streaming latest post.
    update();
  }
}

// Exports Utopian class
exports.Utopian = Utopian;
