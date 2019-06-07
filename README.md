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
stream.on("data", console.log).on("error", console.log);
```

for full [documentation](https://github.com/gigatoride/steemradar.js/tree/master/doc)

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar.js/pulls), and for suggests or feature request please open a [new issue](https://github.com/gigatoride/steemradar.js/issues/new).

## Bugs

Please open a [new issue](https://github.com/gigatoride/steemradar.js.js/issues/new) for any bug.

## Donations

Send a memo with any suggestion that you would like to see in next version.

## License

MIT
