const steemradar = require('../src');

const scan = new steemradar.Scan();

jest.setTimeout(9000);

test('Detect any contributions to utopian.io', (done) => {
  scan.utopian.latestPost((err, res) => {
    scan.pause(); // Stop streaming after getting a result.
    expect(res).toBeTruthy();
    done();
  });
});
