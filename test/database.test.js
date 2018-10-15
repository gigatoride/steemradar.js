const steemradar = require('../src')

const scan = new steemradar.Scan()

jest.setTimeout(10000)

test('Detect any changes for accounts', done => {
  const usernames = ['utopian-io', 'blocktrades']

  scan.database.accounts(usernames, (err) => {
    expect(err).toBeNull()
    done()
  })
})

test('Detect the database memo has been received by username', done => {
  const username = 'blocktrades'
  scan.database.memo(username, (err) => {
    scan.pause()
    expect(err).toBeNull()
    done()
  })
})
