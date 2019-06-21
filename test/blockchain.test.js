const steemradar = require('../src');
const scan = new steemradar.Scan({ testMode: true });

const blockchain = scan.blockchain;

test('Detect any post', done => {
  const stream = blockchain.getPosts();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any comment', done => {
  const stream = blockchain.getComments();
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

  const stream = blockchain.getTransfers(senders, receivers, minAmount, targetMemo);

  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest blockchain votes', done => {
  const stream = blockchain.getVotes(null, 0);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect latest account count', done => {
  const stream = blockchain.getAccountCounter();
  stream.on('data', count => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect global blacklisted accounts', done => {
  const stream = blockchain.getBlacklisted();
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

  const stream = blockchain.getAccountActivity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect any mention for any account', done => {
  const accounts = null;

  const stream = blockchain.getAccountMentions(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect accounts security changes', done => {
  const accounts = ['utopian-io', 'blocktrades', 'steemmonsters', 'binance-hot', 'ned', 'dtube', 'steemcleaners'];

  const stream = blockchain.getAccountSecurity(accounts);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect feed publish prices', done => {
  const stream = blockchain.getFeedPublish();
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect public profane word', done => {
  const stream = blockchain.getProfanity();

  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});

test('Detect funds movement on blockchain', done => {
  const username = 'gigatoride';
  const stream = blockchain.getFundsTracker(username);
  stream.on('data', trx => {
    stream.pause();
    stream.destroy();
    done();
  });
});
