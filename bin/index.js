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
    choices: ['Transfers', 'Profane', 'Last time user was active', 'Memos received'],
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
    name: 'username',
    message: 'What is your username?',
    when: answers =>
      (!answers.blockchain && answers.method === 'profane') ||
      answers.method === 'last time user was active' ||
      answers.method === 'memos received',
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
    message: 'Please enter senders usernames (user1,user2):',
    when: answers => answers.send,
    validate: names => /[\w--,-.]{3,}/.test(names),
    filter: usernames => usernames.split(',')
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
    filter: usernames => usernames.split(',')
  },
  {
    type: 'list',
    name: 'coin',
    message: 'Choose SBD, STEEM or Both:',
    choices: ['SBD', 'STEEM', 'Both'],
    filter: coin => {
      if (coin === 'Both') return 'SBD|STEEM';
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
      scan.blockchain
        .transfers(
          answers.send ? answers.senders : null,
          answers.amount + ' ' + answers.coin,
          answers.receive ? answers.receivers : null,
          !answers.isMemo ? null : answers.memo
        )
        .on('data', transfer => {
          let op = transfer.operations[0][1];
          let { from, to, amount, memo } = op;
          if (memo === '') {
            log(`Transfer from
                ${chalk.cyanBright(from)}
                to 
                ${chalk.cyan(to)}
                with an amount of 
                ${chalk.yellowBright(amount)}`);
          } else {
            log(
              `Transfer from  ${chalk.cyanBright(from)} to ${chalk.cyan(to)}  with an amount of ${chalk.yellowBright(
                amount
              )} memo: ${chalk.magentaBright(memo)}`
            );
          }
        });
      break;
    case 'profane':
      let username;
      if (answers.blockchain === true) username = null;
      else username = answers.username;
      scan.blockchain.profanity(username).on('data', detected => {
        let [word, author] = detected;
        log(`A profane has been detected: ${chalk.red(word)} Said: ${chalk.cyanBright(author)}`);
      });
      break;
    case 'last time user was active':
      scan.blockchain.accounts([answers.username]).on('data', res => {
        log(
          `@${chalk.cyanBright(answers.username)} last activity: ${chalk.yellowBright(res[0].last_bandwidth_update)}`
        );
      });
      break;
    case 'memos received':
      scan.blockchain.memo(answers.username).on('data', msg => {
        if (Array.isArray(msg)) {
          let [from, amount, memo] = msg;
          if (amount.includes('0.001')) {
            log(`${chalk.cyanBright(from)} sent you a memo: ${chalk.magentaBright(memo)}`);
          } else {
            log(`${chalk.cyanBright(from)} sent you a memo: ${chalk.magentaBright(
              memo
            )} with an amount of ${chalk.yellowBright(amount)}
            `);
          }
        }
      });
      break;
    default:
      log('You did not make any right choice');
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      break;
  }
});
