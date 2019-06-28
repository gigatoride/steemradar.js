const { Client } = require('./../src');
const client = new Client();

jest.setTimeout(30000);

const settings = client.blockchain.settings;

test('Set stream operations to false', () => {
  expect(client.blockchain.setStreamOperations(true)).toBeUndefined();
  expect(settings.get('streamOperation')).toBeTruthy();
});

test('Set funds track options by parent sender', () => {
  expect(client.blockchain.setFundsTrackOptions({ parentSender: 'steem' })).toBeUndefined();
  expect(settings.funds.track.has('parentSender')).toBeTruthy();
});

test('Set author name for comment options', () => {
  expect(client.blockchain.setCommentOptions({ authors: ['steem'] })).toBeUndefined();
  expect(settings.comment.has('authors')).toBeTruthy();
});

test('Set senders and receivers for transfer options', () => {
  expect(client.blockchain.setTransferOptions({ senders: ['steem'], receivers: ['steem'] })).toBeUndefined();
  expect(settings.transfer.has('senders')).toBeTruthy();
  expect(settings.transfer.has('receivers')).toBeTruthy();
});

test('Clear all blockchain settings', () => {
  expect(settings.clear()).toBeUndefined();
  expect(settings.get('streamOperation')).toBeFalsy();
});

test('Listen once for event account count', done => {
  client.blockchain.once('account:count', count => {
    expect(count).toBeGreaterThan(1200000);
    done();
  });
});

test('Listen once for event transaction once', done => {
  client.blockchain.once('transaction', trx => {
    expect(trx).toHaveProperty('block');
    done();
  });
});

test('Listen once for event operation once', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction', (type, data) => {
    expect(type).toBeDefined();
    done();
  });
});

test('Listen once for any vote by operation type', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction:vote', (type, data) => {
    expect(type).toBe('vote');
    done();
  });
});

test('Listen once for any positive vote', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction:vote:positive', (type, data) => {
    expect(data.weight).toBeGreaterThan(0);
    done();
  });
});

test('Listen once for a child comment event', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction:comment:child', (type, data) => {
    expect(data.parent_author).toBeTruthy();
    done();
  });
});

test('Listen once for a parent comment event', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction:comment:parent', (type, data) => {
    expect(data.parent_author).toBeFalsy();
    done();
  });
});

test('Listen once for a blacklisted author comment event', done => {
  client.blockchain.setStreamOperations(true);
  client.blockchain.once('transaction:comment:author:blacklisted', (type, data) => {
    expect(type).toBe('comment');
    done();
  });
});
