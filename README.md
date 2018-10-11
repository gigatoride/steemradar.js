# SteemRadar

[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/SteemRadar.svg)](https://github.com/gigatoride/SteemRadar/blob/master/LICENSE)

![nfinal.png](https://cdn.steemitimages.com/DQmZj221JXHxdyVAy53dizf29BExu4K9c1CH12MTBsCzUYZ/nfinal.png)

A radar that will never miss a bit in Steem blockchain.

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
const SteemRadar = require("SteemRadar"),
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
  if (err === null) console.log(res);
});
```

for full [documentation](https://github.com/gigatoride/steemradar/tree/master/doc)

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/SteemRadar/pulls).

## Bugs

Bugs is taken seriously as we consider this repository as dependency for other projects. Please open a [new issue](https://github.com/gigatoride/SteemRadar/issues/new) for any bug.

## Donations

That project is going further to achieve the most complex algorithms and strategies for detecting all types of activities like tracking stolen funds and more, You can donate by sending at least 1 SBD/STEEM with memo has a wish with what you would like to see in the next versions.

## License

MIT
