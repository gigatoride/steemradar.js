# SteemRadar.js

[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/blob/master/LICENSE)

A JavaScript library for scanning and streaming Steem blockchain.

## Usage

### Installation

Command-line usage (install it globally):

```
npm install steemradar -g
```

For the module:

```
npm install steemradar
```

Then

```js
const SteemRadar = require("steemradar"),
  scan = new SteemRadar.Scan({ url: "https://api.steemit.com" });
```

### Command-line usage

After installing SteemRadar globally just call it from command-line/terminal:

```
steemradar
```

## API

### Usage example

```js
const stream = scan.blockchain.accountCounter();
stream
  .on("data", trx => {
    console.log(trx);
  })
  .on("error", err => {
    console.log(err);
  });
```

### Scan Blockchain Aliases

``scan.blockchain.getAccountActivity()``

``scan.blockchain.getAccountCounter()``

``scan.blockchain.getAccountMentions()``

``scan.blockchain.getAccountSecurity()``

``scan.blockchain.getBlacklisted()``

``scan.blockchain.getComments()``

``scan.blockchain.getFeedPublish()``

``scan.blockchain.getFundsTracker()``

``scan.blockchain.getPosts()``

``scan.blockchain.getProfanity()``

``scan.blockchain.getTransfers()``

``scan.blockchain.getVotes()``

### Scan Utopian Aliases

``scan.utopian.getPosts()``

for full [documentation](https://github.com/gigatoride/steemradar.js/tree/master/doc)

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar.js/pulls), And for suggests or feature request please open a [new issue](https://github.com/gigatoride/steemradar.js/issues/new).

## Bugs

Please open a [new issue](https://github.com/gigatoride/steemradar.js.js/issues/new) for any bug.

## License

MIT
