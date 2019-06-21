const steemradar = require('../src');
const scan = new steemradar.Scan({ testMode: true });

const utopian = scan.utopian;

test('Detect any utopian contribution post', done => {
  const stream = utopian.getPosts();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});
