# Documentation

- [Install](#install)
- [New Scan](#new-scan)
- [Scan Blockchain Stream](#scan-blockchain-stream)
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
scan.blockchain.blacklist().on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for votes by usernames, minimum weight:

```js
// Scanning for blacklisted usernames in services like Steem Cleaners and some bid bots etc...
scan.blockchain.votes(usernames, weight)
    .on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
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
  targetMemo).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for profane words with author:

```js
// Use null as username to detect all blockchain accounts
scan.blockchain.profanity(username)
.on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for latest user activity timestamp:

```js
// Username should be string it will callback timestamp
scan.blockchain.accounts(usernames).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for latest user memo has been received:

```js
// Username should be always string, memo key can be null
scan.blockchain.memo(username).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for funds tracking:
```js
scan.blockchain.fundsTracker(username, trxId).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for security changes or funds more than 50% in a transfer:

```js
scan.blockchain.security(username).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

### Scan Utopian

Scan for any posts added to utopian:

```js
scan.utopian.posts(category).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for latest reviews by moderators:

```js
scan.utopian.reviews().on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

Scan for @utopian-io vote:

```js
scan.utopian.vote().on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

### Pause And Resume

To pause or resume the scan instance just use pause or resume inside or outside the method callback function.

```js
scan.pause();

scan.resume();
```
