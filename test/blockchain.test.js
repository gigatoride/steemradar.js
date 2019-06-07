const steemradar = require('../src');

const scan = new steemradar.Scan();

jest.setTimeout(90000);

test('Detect any transfer SBD or STEEM', done => {
  let senders = null;
  let receivers = null;
  let minAmount = '0.001 SBD|STEEM';
  let targetMemo = null;

  const stream = scan.blockchain.transfers(senders, receivers, targetMemo, {
    minAmount
  });

  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest blockchain votes', done => {
  const stream = scan.blockchain.votes(null, 0);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest account count', done => {
  const stream = scan.blockchain.accountCounter();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect global blacklisted accounts', done => {
  const stream = scan.blockchain.blacklist();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any changes for accounts', done => {
  const accounts = [
    'utopian-io',
    'blocktrades',
    'steemmonsters',
    'deepcrypto8',
    'ned',
    'dtube',
    'steemcleaners',
    'binance-hot'
  ];

  const stream = scan.blockchain.accountActivity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any mention for any account', done => {
  const accounts = null;

  const stream = scan.blockchain.accountMentions(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect accounts security changes', done => {
  const accounts = ['utopian-io', 'blocktrades', 'steemmonsters', 'binance-hot', 'ned', 'dtube', 'steemcleaners'];

  const stream = scan.blockchain.accountSecurity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect feed publish prices', done => {
  const stream = scan.blockchain.feedPublish();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect public profane word', done => {
  const stream = scan.blockchain.profanity();

  stream.on('data', res => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect funds movement on blockchain', done => {
  const username = 'gigatoride';
  const stream = scan.blockchain.fundsTracker(username);
  stream.on('data', res => {
    expect(res).toBeDefined;
    done();
  });
});
