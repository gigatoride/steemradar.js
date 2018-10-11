# Documentation

- [Install](#install)
- [New Scan](#new-scan)
- [Scan Blockchain Stream](#scan-blockchain-stream)
- [Scan Blockchain Database Stream](#scan-blockchain-database-stream)
- [Scan Utopian](#scan-utopian)
- [Pause And Resume](#pause-and-resume)

## Install

```cmd
npm install steemradar
```

## New Scan

```js
const SteemRadar = require("steemradar"),
  scan = SteemRadar.Scan({ node: "https://api.steemit.com" }); // Leave it empty for default rpc server
```

- Note: All methods are streams and it will keep scanning for other results.

## Scan Blockchain Stream

This method will keeps tracking transaction flow and will callback results by the matches.

Scan for blacklisted usernames by steem cleaners etc..:

```js
// Scanning for blacklisted usernames in services like Steem Cleaners and some bid bots etc...
scan.blockchain.blacklist((err, res) => {
  if (err === null) console.log(res);
});
```

Scan for votes by usernames, minimum weight:

```js
// Scanning for blacklisted usernames in services like Steem Cleaners and some bid bots etc...
scan.blockchain.votes(usernames, weight, (err, res) => {
  if (err === null) console.log(res);
});
```

Scan for a transfer:

```js
// Senders,targetMemo can be ignored by null and receivers as well.
// Minimum amount string examples "0.001 SBD", "0.001 STEEM", "0.001 SBD|STEEM"
// Target memo should be a string, it can be null too.
scan.blockchain.transfers(
  senders,
  minAmount,
  receivers,
  targetMemo,
  (err, res) => {
    if (err === null) console.log(res);
  }
);
```

Scan for profane words with author:

```js
// Use null as username to detect all blockchain accounts
scan.blockchain.profane(username, (err, res) => {
  if (err === null) console.log(res);
});
```

## Scan Blockchain Database Stream

This method will scan the blockchain database data for any matched results and it will keep streaming the latest updates.

Scan for latest user activity timestamp:

```js
// Username should be string it will callback timestamp
scan.database.accounts(usernames, (err, res) => {
  if (err === null) console.log(res);
});
```

Scan for latest user memo has been received:

```js
// Username should be always string, memo key can be null
scan.database.memo(username, (err, res) => {
  if (err === null) console.log(res);
});
```

### Scan Utopian

Scan for any posts added to utopian:

```js
scan.utopian.posts(category, (err, res) => {
  if (err === null) console.log(res);
});
```

Scan for latest reviews by moderators:

```js
scan.utopian.reviews((err, res) => {
  if (err === null) console.log(res);
});
```

Scan for @utopian-io vote:

```js
scan.utopian.vote((err, res) => {
  if (err === null) console.log(res);
});
```

### Pause And Resume

To pause or resume the scan instance just use pause or resume inside or outside the method callback function.

```js
scan.pause();

scan.resume();
```
