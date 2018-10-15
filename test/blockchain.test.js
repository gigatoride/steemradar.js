const steemradar = require('../src')

const scan = new steemradar.Scan()

jest.setTimeout(200000)

test('Detect a transfer that has an amount greater than or equal 0.001 SBD/STEEM', done => {
  let senders = null
  let receivers = null
  let minAmount = '0.001 SBD|STEEM'
  let targetMemo = null

  scan.blockchain.transfers(
    senders,
    minAmount,
    receivers,
    targetMemo,
    (err, res) => {
      expect(parseFloat(res.amount)).toBeGreaterThanOrEqual(0.001)
      done()
    }
  )
})

test('Detect public profane word', done => {
  scan.blockchain.profane(null, (err, res) => {
    expect(Array.isArray(res)).toBeTruthy()
    done()
  })
})

test('Detect global blacklisted username', done => {
  scan.blockchain.blacklist((err, res) => {
    expect(res.blacklisted.length).toBeTruthy()
    done()
  })
})

test('Detect latest blockchain votes', done => {
  scan.blockchain.votes(null, 0, (err, res) => {
    scan.pause()
    expect(err).toBeNull()
    done()
  })
})
