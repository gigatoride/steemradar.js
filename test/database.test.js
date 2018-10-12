const steemradar = require('../src');

const scan = new steemradar.Scan();

jest.setTimeout(10000);

test('Detect any changes for accounts', (done) => {
  const usernames = ['utopian-io', 'blocktrades'];

  scan.database.accounts(usernames, (err, res) => {
    expect(Array.isArray(res)).toBeTruthy();
    done();
  });
});

test('Detect the database memo has been received by username', (done) => {
  const username = 'blocktrades';
  scan.database.memo(username, (err, res) => {
    scan.pause();
    expect(Array.isArray(res)).toBeTruthy();
    done();
  });
});
