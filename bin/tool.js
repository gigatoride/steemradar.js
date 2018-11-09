#!/usr/bin/env node
const SteemRadar = require('./../src'); // The core file for everything here.
const scan = new SteemRadar.Scan();
const inquirer = require('inquirer'); // For command line questions
const dateFormat = require('dateformat'); // To parse timestamp strings or reformat an exist date.
const chalk = require('chalk'); // For colored log.
const log = console.log; // For shorter code.

// The following is the part of terminal/cmd with statements,validations and filters
const questions = [
  {
    type: 'list', // Make a list for the user to choice from
    name: 'method',
    message: 'What do you want to detect?',
    choices: ['Transfers', 'Profane', 'Last time user was active', 'Memos received'],
    filter: val => val.toLowerCase() // Convert values to lowercase
  },
  {
    type: 'confirm', // Ask a question for true or false
    name: 'blockchain',
    message: 'Ok... Do you want to monitor all blockchain?',
    when: answers => answers.method === 'profane' // If user choice profane
  },
  {
    type: 'input', // Make an input for the user
    name: 'username',
    message: 'What is your username?',
    // If blockchain answer is false and the choice is profane, last time user was active, memos receives.
    when: answers =>
      (!answers.blockchain && answers.method === 'profane') ||
      answers.method === 'last time user was active' ||
      answers.method === 'memos received',
    validate: name => /[\w---.]{3,}/.test(name) // If blockchain == false and memos received as choice
  },
  {
    type: 'confirm', // Ask a question for true or false
    name: 'send',
    message: 'Do you want to enter senders?',
    default: true, // Default value for confirm  by enter
    when: answers => answers.method === 'transfers' // If choice is transfers
  },
  {
    type: 'input', // Make an input for the user
    name: 'senders',
    message: 'Please enter senders usernames (user1,user2):',
    when: answers => answers.send,
    validate: names => /[\w--,-.]{3,}/.test(names), // Is valid username(s) not less than 3 letters and numbers, alphabet, dash, comma
    filter: usernames => usernames.split(',') // Convert usernames input to an array
  },
  {
    type: 'confirm', // Ask a question for true or false
    name: 'receive',
    message: 'Do you want to enter receivers?',
    default: true, // Default value for confirm  by enter
    when: answers => answers.method === 'transfers' // If choice is transfers
  },
  {
    type: 'input', // Make an input for the user
    name: 'receivers',
    message: 'Please enter receivers (user1,user2)',
    when: answers => answers.receive, // In case of receive is true
    validate: names => /[\w--,-.]{3,}/.test(names), // Is valid username(s) not less than 3 letters and numbers, alphabet, dash, comma
    filter: usernames => usernames.split(',') // Convert usernames input to an array
  },
  {
    type: 'list', // Make a list for the user to choice from
    name: 'coin',
    message: 'Choose SBD, STEEM or Both:',
    choices: ['SBD', 'STEEM', 'Both'],
    filter: coin => {
      if (coin === 'Both') return 'SBD|STEEM'; // Return string for both currency names to match with transfer amount
    },
    when: answers => answers.method === 'transfers' // If choice is transfers
  },
  {
    type: 'input', // Make an input for the user
    name: 'amount',
    message: 'Minimum amount to detect (0.001)',
    default: '1000',
    when: answers => answers.method === 'transfers', // If choice is transfers
    validate: amount => {
      // Make sure it is a valid number
      if (typeof parseFloat(amount) === 'number') return true;
      // Return true
      else return 'Please enter a valid amount'; // If amount is not valid
    },
    filter: amount => parseFloat(amount).toFixed(3) // Make sure there is at least three decimal numbers.
  },
  {
    type: 'confirm', // Ask a question for true or false
    name: 'isMemo',
    message: 'Do you want to catch a memo?',
    default: true,
    when: answers => answers.method === 'transfers' // If choice is transfers
  },
  {
    type: 'input', // Make an input for the user
    name: 'memo',
    message: 'Well. Please enter a memo:',
    when: answers => answers.isMemo // If isMemo is true
  }
];

// How everything gonna works
inquirer.prompt(questions).then(answers => {
  JSON.stringify(answers, null, '  '); // JSON stringify to object
  switch (
    answers.method // Switch statement for the user choice
  ) {
    case 'transfers': // In case of `transfers`
      scan.blockchain.transfers(
        answers.send ? answers.senders : null,
        answers.amount + ' ' + answers.coin,
        answers.receive ? answers.receivers : null,
        !answers.isMemo ? null : answers.memo,
        transfer => {
          // Start monitoring blockchain by user inputs
          let op = transfer.operations[0][1]; // Operations object and the information about the transfer
          let {
            from, // Sender
            to, // Receivers
            amount, // Amount of crypto
            memo // Memo
          } = op; // Convert to local variables
          // If memo is empty
          if (memo === '') {
            log(`Transfer from
                ${chalk.cyanBright(from)}
                to 
                ${chalk.cyan(to)}
                with an amount of 
                ${chalk.yellowBright(amount)}`);
          } else {
            log(
              `Transfer from  ${chalk.cyanBright(from)} to ${chalk.cyan(
                to
              )}  with an amount of ${chalk.yellowBright(amount)} memo: ${chalk.magentaBright(
                memo
              )}`
            );
          } // Log it
        }
      );
      break;
    case 'profane': // In case of `profane`
      let username; // Variable for username
      // If blockchain is true
      if (answers.blockchain === true) username = null;
      // Scan in all blockchain
      else username = answers.username; // Scan by username
      scan.blockchain.profane(username, (_err, detected) => {
        // Start monitoring blockchain by user inputs
        let [word, author] = detected; // Convert object into local variables.
        log(`A profane has been detected: ${chalk.red(word)} Said: ${chalk.cyanBright(author)}`);
      });
      break;
    case 'last time user was active': // In case of transfers
      scan.database.accounts([answers.username], (_err, res) => {
        // Start monitoring blockchain by user inputs
        log(
          `@${chalk.cyanBright(answers.username)} last activity: ${chalk.yellowBright(
            dateFormat(res[0].last_bandwidth_update, 'dddd, mmmm dS, yyyy, h:MM:ss TT')
          )}`
        ); // Log it
      });
      break;
    case 'memos received': // In case of `memos received`
      scan.database.memo(answers.username, (_err, msg) => {
        // Start monitoring blockchain by user inputs
        if (Array.isArray(msg)) {
          let [from, amount, memo] = msg; // Convert object into local variables.
          if (amount.includes('0.001')) {
            // Amount of transaction 0.001 sbd or detector
            log(`${chalk.cyanBright(from)} sent you a memo: ${chalk.magentaBright(memo)}`); // Log it & dont view that tiny amount
          } else {
            log(`${chalk.cyanBright(from)} sent you a memo: ${chalk.magentaBright(
              memo
            )} with an amount of ${chalk.yellowBright(amount)}
            `); // Log it
          }
        }
      });
      break;
    default:
      log('You did not make any right choice'); // If use didn't choice anything
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      break;
  }
});
