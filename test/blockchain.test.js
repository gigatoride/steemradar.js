const steemradar = require('../src');

const scan = new steemradar.Scan();

jest.setTimeout(90000);

test('Detect a transfer that has an amount greater than or equal 0.001 SBD/STEEM', done => {
  let senders = null;
  let receivers = null;
  let minAmount = '0.001 SBD|STEEM';
  let targetMemo = null;

  scan.blockchain
    .transfers(senders, minAmount, receivers, targetMemo)
    .on('data', res => {
      expect(parseFloat(res.amount)).toBeGreaterThanOrEqual(0.001);
      done();
    });
});

// test('Detect public profane word', done => {
//   scan.blockchain.profane(null).on('data', res => {
//     expect(Array.isArray(res)).toBeTruthy();
//     done();
//   });
// });

test('Detect global blacklisted username', done => {
  scan.blockchain.blacklist().on('data', res => {
    expect(res.blacklisted.length).toBeTruthy();
    done();
  });
});

test('Detect latest blockchain votes', done => {
  scan.blockchain.votes(null, 0).on('data', res => {
    expect(res).toBeDefined;
    done();
  });
});

test('Detect any changes for accounts', done => {
  const usernames = ['utopian-io', 'blocktrades', 'steemmonsters'];

  scan.blockchain.accounts(usernames).on('data', res => {
    expect(res).toBeDefined;
    done();
  });
});

test('Detect the database memo has been received by username', done => {
  const username = 'steemmonsters';
  scan.blockchain.memo(username).on('data', res => {
    expect(res).toBeDefined;
    done();
  });
});

test('Tracking funds by a username', done => {
  const username = 'gigatoride';
  scan.blockchain.fundsTracker(username).on('data', res => {
    expect(res).toBeDefined;
    done();
  });
});
