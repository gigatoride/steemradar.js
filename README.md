# SteemRadar.js

[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/blob/master/LICENSE)

A JavaScript library for scanning Steem blockchain.

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
  scan = new SteemRadar.Scan({ node: "https://api.steemit.com" });
```

### Command-line usage

After installing SteemRadar globally just call it from command-line/terminal:

```
steemradar
```

After that you should interact with the questions then you will get some results and dont worry it will never miss a bit because it had been heavily tested.

### Usage Examples

```js
scan.blockchain.profane(username, (err, res) => {
  console.log(err, res);
});
```

```js
scan.blockchain.transfers(
  senders,
  min_amount,
  receivers,
  target_memo,
  (err, res) => {
    console.log(err, res);
  }
);
```

```js
scan.database.accounts(usernames, (err, res) => {
  console.log(err, res);
});
```

for full [documentation](https://github.com/gigatoride/steemradar.js/tree/master/doc)

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar.js/pulls), and for suggests or feature request please open a [new issue](https://github.com/gigatoride/steemradar.js/issues/new).

## Bugs

Bugs is taken seriously as we consider this repository as dependency for other projects. Please open a [new issue](https://github.com/gigatoride/steemradar.js.js/issues/new) for any bug.

## Donations

That project is going further to achieve the most complex algorithms and strategies for detecting all types of activities like tracking stolen funds and more, You can donate by sending at least 1 SBD/STEEM with memo has a wish with what you would like to see in the next versions.

## License

MIT
