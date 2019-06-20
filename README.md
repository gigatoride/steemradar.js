# SteemRadar.js

[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/blob/master/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/issues)
![Downloads](https://img.shields.io/npm/dt/steemradar.svg)
![Powered by utopian.io](https://img.shields.io/badge/powered%20by-utopian.io-ff69b4.svg)

A JavaScript library for scanning and streaming Steem blockchain.

## Usage

### Installation

Using npm:

```
npm install steemradar
```

## API

### Usage example

Create a new scan instance

```js
const SteemRadar = require("steemradar"),
  scan = new SteemRadar.Scan({ url: "https://api.steemit.com" });
```

Create a new stream

```js
const stream = scan.blockchain.accountCounter();
stream
  .on("data", count => {
    console.log(count);
  })
  .on("error", err => {
    console.log(err);
  });
```

### Scan Blockchain Aliases

`scan.blockchain.getAccountActivity()`

`scan.blockchain.getAccountCounter()`

`scan.blockchain.getAccountMentions()`

`scan.blockchain.getAccountSecurity()`

`scan.blockchain.getBlacklisted()`

`scan.blockchain.getComments()`

`scan.blockchain.getFeedPublish()`

`scan.blockchain.getFundsTracker()`

`scan.blockchain.getPosts()`

`scan.blockchain.getProfanity()`

`scan.blockchain.getTransfers()`

`scan.blockchain.getVotes()`

### Scan Utopian Aliases

`scan.utopian.getPosts()`

for full [documentation](https://github.com/gigatoride/steemradar.js/tree/master/doc)

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar.js/pulls), And for suggests or feature request please open a [new issue](https://github.com/gigatoride/steemradar.js/issues/new).

## Bugs

Please open a [new issue](https://github.com/gigatoride/steemradar.js.js/issues/new) for any bug.

## License

MIT
