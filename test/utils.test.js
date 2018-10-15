const utils = require('../src/utils')

test('Account name validator', async () => {
  expect(await utils.valid.accountName('steem')).toBeTruthy()
})
