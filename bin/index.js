#!/usr/bin/env node
const SteemRadar = require('../src');
const scan = new SteemRadar.Scan();
const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;

const questions = [
  {
    type: 'list',
    name: 'method',
    message: 'What do you want to detect?',
    choices: ['Transfers', 'Profane', 'Last time user was active'],
    filter: val => val.toLowerCase()
  },
  {
    type: 'confirm',
    name: 'blockchain',
    message: 'Ok... Do you want to monitor all blockchain?',
    when: answers => answers.method === 'profane'
  },
  {
    type: 'input',
    name: 'accountName',
    message: 'What is your accountName?',
    when: answers =>
      (!answers.blockchain && answers.method === 'profane') || answers.method === 'last time user was active',
    validate: name => /[\w---.]{3,}/.test(name)
  },
  {
    type: 'confirm',
    name: 'send',
    message: 'Do you want to enter senders?',
    default: true,
    when: answers => answers.method === 'transfers'
  },
  {
    type: 'input',
    name: 'senders',
    message: 'Please enter senders accountNames (user1,user2):',
    when: answers => answers.send,
    validate: names => /[\w--,-.]{3,}/.test(names),
    filter: accountNames => accountNames.split(',')
  },
  {
    type: 'confirm',
    name: 'receive',
    message: 'Do you want to enter receivers?',
    default: true,
    when: answers => answers.method === 'transfers'
  },
  {
    type: 'input',
    name: 'receivers',
    message: 'Please enter receivers (user1,user2)',
    when: answers => answers.receive,
    validate: names => /[\w--,-.]{3,}/.test(names),
    filter: accountNames => accountNames.split(',')
  },
  {
    type: 'list',
    name: 'coin',
    message: 'Choose SBD, STEEM or Both:',
    choices: ['SBD', 'STEEM', 'Both'],
    filter: coin => {
      if (coin === 'Both') return 'SBD|STEEM';
      else return coin;
    },
    when: answers => answers.method === 'transfers'
  },
  {
    type: 'input',
    name: 'amount',
    message: 'Minimum amount to detect (0.001)',
    default: '1000',
    when: answers => answers.method === 'transfers',
    validate: amount => {
      if (typeof parseFloat(amount) === 'number') return true;
      else return 'Please enter a valid amount';
    },
    filter: amount => parseFloat(amount).toFixed(3)
  },
  {
    type: 'confirm',
    name: 'isMemo',
    message: 'Do you want to catch a memo?',
    default: true,
    when: answers => answers.method === 'transfers'
  },
  {
    type: 'input',
    name: 'memo',
    message: 'Well. Please enter a memo:',
    when: answers => answers.isMemo
  }
];

inquirer.prompt(questions).then(answers => {
  JSON.stringify(answers, null, '  ');
  switch (answers.method) {
    case 'transfers':
      console.log(answers.amount + ' ' + answers.coin);
      scan.blockchain
        .transfers(
          answers.send ? answers.senders : null,
          answers.receive ? answers.receivers : null,
          !answers.isMemo ? null : answers.memo,
          { minAmount: answers.amount + ' ' + answers.coin }
        )
        .on('data', transfer => {
          let op = transfer.operations[0][1];
          let { from, to, amount, memo } = op;
          if (memo === '')
            log(
              `Transfer from ${chalk.cyanBright(from)} to ${chalk.cyan(to)} with an amount of ${chalk.yellowBright(
                amount
              )}`
            );
          else
            log(
              `Transfer from  ${chalk.cyanBright(from)} to ${chalk.cyan(to)}  with an amount of ${chalk.yellowBright(
                amount
              )} memo: ${chalk.magentaBright(memo)}`
            );
        });
      break;

    case 'profane':
      let accountName;
      if (answers.blockchain === true) accountName = null;
      else accountName = answers.accountName;
      scan.blockchain.profanity(accountName).on('data', data => {
        let [word, author] = data;
        log(`A profane has been detected: ${chalk.red(word)} Said: ${chalk.cyanBright(author)}`);
      });
      break;

    case 'last time user was active':
      scan.blockchain.accountActivity([answers.accountName]).on('data', res => {
        log(
          `@${chalk.cyanBright(answers.accountName)} last activity: ${chalk.yellowBright(res[0].last_bandwidth_update)}`
        );
      });
      break;

    default:
      log('You did not make any right choice');
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      break;
  }
});
