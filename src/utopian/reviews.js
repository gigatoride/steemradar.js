const iteratorStream = require('async-iterator-to-stream');
const utopian = require('node-utopian-rocks');
const { sleep } = require('./../utils');

/**
 * Utopian scan for recently added posts
 * @returns {Stream<object>}
 * @memberof Scan.utopian
 */
function reviews() {
  let lastReview;
  const iterator = async function * (ms = 600) {
    while (true) {
      this.review = await utopian.getPosts(null, 'reviewed');
      if (Array.isArray(this.review)) {
        this.review = this.review.pop();
        if (!lastReview || lastReview !== this.review._id.$oid) {
          lastReview = this.review._id.$oid;
          yield this.review;
        }
      }
      await sleep(ms);
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = reviews;
