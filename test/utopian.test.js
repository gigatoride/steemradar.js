const steemradar = require('../src');

const scan = new steemradar.Scan();

jest.setTimeout(40000);

test('Detect any contributions to utopian.io', (done) => {
  scan.utopian.posts(null, (err, res) => {
    expect(err).toBeNull();
    done();
  });
});

test('Detect any reviews by moderators', (done) => {
  scan.utopian.reviews((err, res) => {
    scan.pause(); // Stop streaming after getting a result.
    expect(err).toBeNull();
    done();
  });
});
