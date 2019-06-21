const steemradar = require('../src');
const scan = new steemradar.Scan({ testMode: true });

test('Detect any post', done => {
  const stream = scan.blockchain.getPosts();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any comment', done => {
  const stream = scan.blockchain.getComments();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any transfer SBD or STEEM', done => {
  let senders = null;
  let receivers = null;
  let minAmount = '0.001 SBD|STEEM';
  let targetMemo = null;

  const stream = scan.blockchain.getTransfers(senders, receivers, minAmount, targetMemo);

  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest blockchain votes', done => {
  const stream = scan.blockchain.getVotes(null, 0);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest account count', done => {
  const stream = scan.blockchain.getAccountCounter();
  stream.on('data', count => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect global blacklisted accounts', done => {
  const stream = scan.blockchain.getBlacklisted();
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
    'binance-hot',
    'therising'
  ];

  const stream = scan.blockchain.getAccountActivity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any mention for any account', done => {
  const accounts = null;

  const stream = scan.blockchain.getAccountMentions(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect accounts security changes', done => {
  const accounts = ['utopian-io', 'blocktrades', 'steemmonsters', 'binance-hot', 'ned', 'dtube', 'steemcleaners'];

  const stream = scan.blockchain.getAccountSecurity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect feed publish prices', done => {
  const stream = scan.blockchain.getFeedPublish();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect public profane word', done => {
  const stream = scan.blockchain.getProfanity();

  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect funds movement on blockchain', done => {
  const username = 'gigatoride';
  const stream = scan.blockchain.getFundsTracker(username);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});
