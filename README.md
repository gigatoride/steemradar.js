# SteemRadar.js

[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/blob/master/LICENSE)

A JavaScript library for scanning Steem blockchain (beta).

##### Note: this repo still in beta some commands may change and it will be updated in the documentation.

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
scan.blockchain.profanity(username).on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

```js
scan.blockchain.transfers(
  senders,
  min_amount,
  receivers,
  target_memo)
  .on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
```

```js
scan.blockchain.accounts(usernames)
  .on("data", (res) => {
    console.log(res);
}).on("error", (err){
    console.log(err);
});
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
