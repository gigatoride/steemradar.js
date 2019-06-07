const iteratorStream = require('async-iterator-to-stream');
const utopian = require('node-utopian-rocks');
const { sleep } = require('./../utils');

/**
 * Utopian scan for recently added posts
 * @param {String} category - category name
 * @returns {Stream<object>}
 * @memberof Scan.utopian
 */
function posts(category) {
  let lastPost;
  const iterator = async function * (ms = 600) {
    while (true) {
      this.post = await utopian.getPosts(category, 'unreviewed');
      if (Array.isArray(this.post)) {
        this.post = this.post.pop();
        if (!lastPost || lastPost !== this.post._id.$oid) {
          lastPost = this.post._id.$oid;
          yield this.post;
        }
        await sleep(ms);
      }
    }
  };

  return iteratorStream.obj(iterator());
}

module.exports = posts;
