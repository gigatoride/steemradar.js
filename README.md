# SteemRadar.js

[![Build Status](https://travis-ci.org/gigatoride/steemradar.js.svg?branch=master)](https://travis-ci.org/gigatoride/steemradar.js)
[![NPM version](https://img.shields.io/npm/v/steemradar.svg)](https://www.npmjs.com/package/steemradar) [![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.js.svg)](https://github.com/gigatoride/steemradar.js/blob/master/LICENSE)
![Downloads](https://img.shields.io/npm/dt/steemradar.svg)
![Powered by utopian.io](https://img.shields.io/badge/powered%20by-utopian.io-ff69b4.svg)

An event-driven lightweight library for streaming Steem blockchain.

## Installation

Using npm:

```
npm install steemradar
```

## RPC Servers

[wss://anyx.io](wss://anyx.io) By Default

[wss://appbasetest.timcliff.com](wss://appbasetest.timcliff.com)

- Note: this library currently supports web sockets only

## API

### Usage

#### Create a new instance

```js
const { Client } = require("steemradar"),
  client = new Client({ nodeURL: "wss://anyx.io" });
```

### Settings

The following command will set transaction by operation property:

```js
client.blockchain.setStreamOperations(true); // default false
```

The following command will set custom comment options:

```js
client.blockchain.setCommentOptions({
  authors: ["steem"]
});
```

The following command will set custom transfer options:

```js
client.blockchain.setTransferOptions({
  senders: ["steem"],
  receivers: ["steem"]
});
```

The following command will set custom funds track options:

```js
client.blockchain.setFundsTrackOptions({
  parentSender: "steem"
});
```

- Note: All these commands you can call them more than once like using them in multiple cases for more flexibility, And all events will be reset by your latest options.

Reset all settings example:

```js
client.blockchain.settings.clear();
```

### Flexible events

`Event: transaction`

`Event: transaction:<transactionType>`

`Event: transaction:<transactionType>:<customParent>`

`Event: transaction:<transactionType>:<customParent>:<customChild>`

### Error handling

`Event: error`

### Custom events parent/child types

|             | Type     | Custom Parent | Custom Child |
| ----------- | -------- | ------------- | ------------ |
| account     | count    |               |              |
| transaction | transfer | funds         | track        |
| transaction | transfer | memo          | profane      |
| transaction | comment  | parent        |              |
| transaction | comment  | child         |              |
| transaction | comment  | body          | mention      |
| transaction | comment  | body          | profane      |
| transaction | comment  | author        | blacklisted  |
| transaction | vote     | positive      |              |
| transaction | vote     | negative      |              |

- Note: the table above is just the built-in custom parents/child moreover you can use any operation type property

### Examples

```js
client.blockchain.on("transaction", trx => {
  console.log(trx);
});
```

```js
client.blockchain.removeAllListeners("transaction");
```

```js
client.blockchain.once("transaction:vote:positive", trx => {
  console.log(trx);
});
```

```js
client.blockchain.once("transaction:feed_publish", trx => {
  console.log(trx);
});
```

```js
client.blockchain.on("error", err => {
  console.error(err);
});
```

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar.js/pulls), And for suggests or feature request please open a [new issue](https://github.com/gigatoride/steemradar.js/issues/new).

## Bugs

Please open a [new issue](https://github.com/gigatoride/steemradar.js.js/issues/new) for any bug.

## License

MIT
