# SteemRadar
[![GitHub license](https://img.shields.io/github/license/gigatoride/steemradar.svg)](https://github.com/gigatoride/steemradar/blob/master/LICENSE)

![nfinal.png](https://cdn.steemitimages.com/DQmZj221JXHxdyVAy53dizf29BExu4K9c1CH12MTBsCzUYZ/nfinal.png)

A radar that will never miss a bit in Steem blockchain.

## Usage

### Installation

Command-line usage:

```
npm install steemradar -g
```

As dependency for your project:

```
npm install steemradar
```

### Command-line usage

After installing steemradar globally just call it from command-line/terminal:

```
$ steemradar
```

![commandline.png](https://cdn.steemitimages.com/DQmZTdZwPSjfqqrCJap4izYbjajnrFAcovQDZyoAgfc36qp/commandline.png)

After that you should interact with the questions then you will get some results and dont worry it will never miss a bit because it had been heavily tested.

## API

### Streaming method aliases

``transfer.detect()``

``profane.detect()``

``activity.detect()``

``memo.detect()``

### Streaming Usage Examples

Stream example for detecting a transfer:

```js
    // Senders,target_memo can be ignored by null and receivers as well.
    // Minimum amount string examples "0.001 SBS", "0.001 STEEM", "0.001 SBD|STEEM"
    // Target memo should be a string
    steemradar.transfer.detect(senders, min_amount, receivers, target_memo, (res) => {
        // It will callback an object for all transfer details.
        if(something) {
        steemradar.transfer.stop(); // Stop streaming after getting a result.
        } else {
            // Do Something
        }
    });

```

Stream example for latest user activity timestamp:

```js
    // Username should be string it will callback timestamp
    steemradar.activity.detect(username, (timestamp) => {
        if(something) {
            steemradar.activity.stop(); // Stop streaming after getting a result.
        } else {
            // Do Something
        }
    });
```

Stream example for detecting profane words with author:

```js
    // Use null as username to detect all blockchain accounts
    steemradar.profane.detect(username, (res) => {
        let [word, author] = res; // Convert to local variables.
        if(something) {
        steemradar.profane.stop(); // Stop streaming after getting a result.
        } else {
            // Do Something
        }
    });
```

Stream example for latest user memo has been received:

```js
    // Username should be always string, memo key can be null
    steemradar.memo.detect(memoKey, username, (res) => {
        let [from, amount, memo] = res; // Convert to local variables.
        if(something) {
        steemradar.memo.stop(); // Stop streaming after getting a result.
        } else {
            // Do Something
        }
    });
```

## Contribute

All contributions are welcome by opening a [new pull request](https://github.com/gigatoride/steemradar/pulls).

## Bugs

Bugs is taken seriously as we consider this repository as dependency for other projects. Please open a [new issue](https://github.com/gigatoride/steemradar/issues/new) for any bug.

## Donations

That project is going further to achieve the most complex algorithms and strategies for detecting all types of activities like tracking stolen funds and more, You can donate by sending at least 1 SBD/STEEM with memo has a wish with what you would like to see in the next versions.