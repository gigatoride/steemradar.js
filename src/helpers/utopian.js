const utopian = require('node-utopian-rocks');

// API client for utopian.rocks
const utils = require('./../utils'); // Some utils

/**
 * Utopian class for streaming
 */
class Utopian {
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
   * Utopian latest posts stream
   * @param {function} callback - callback for err or results.
   * @param {number} ms - milliseconds
   */
  posts(callback, ms = 200) {
    let lastResult; // Save latest post has been extracted.
    const update = async () => {
      // Pause or Resume
      if (this.running) {
        this.post = await utopian.getPosts(null, 'unreviewed');
        // Check if results is not streamed before.
        if (!Object.is(lastResult, this.post)) {
          lastResult = this.post; // Set latest post
          callback(null, this.post.pop()); // Get the last element in array.
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
