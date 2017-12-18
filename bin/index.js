#!/usr/bin/env node
const program = require('commander');
const log = console.log;
var inquirer = require('inquirer');
var opn = require('opn');

var prompt = inquirer.createPromptModule();

var chalk = require('chalk')


program
    .arguments('<action>')
    .option('-e, --email <email>')
    .option('-p, --password <password>')
    .action(function(action) {
        console.log(action);
        if(!action) {
            return help();
        }
        switch(action) {
            case 'nextver':
                require('./nextver');
                break;
            case 'create':
                require('./vue-init');
                break;

            case 'rundev':
                require('./vue-build');
                break;

            case 'release':
                require('./release.js');
                break;

            case 'list':
            case 'help':
                help();
                break;

            case 'monkey':
                log(chalk.yellow(`                      __,__
             .--.  .-"     "-.  .--.
            / .. \\/  .-. .-.  \\/ .. \\
           | |  '|  /   Y   \\  |'  | |
           | \\   \\  \\ 0 | 0 /  /   / |
            \\ '- ,\\.-"\`\` \`\`"-./, -' /
             \`'-' /_   ^ ^   _\\ '-'\`
             .--'|  \\._ _ _./  |'--.
           /\`    \\   \\.-.  /   /    \`\\
          /       '._/  |-' _.'       \\
         /          ;  /--~'   |       \\
        /        .'\\|.-\\--.     \\       \\
       /   .'-. /.-.;\\  |\\|'~'-.|\\       \\
       \\       \`-./\`|_\\_/ \`     \`\\'.      \\
        '.      ;     ___)        '.\`;    /
          '-.,_ ;     ___)          \\/   /
           \\   \`\`'------'\\       \\   \`  /
            '.    \\       '.      |   ;/_
          ___>     '.       \\_ _ _/   ,  '--.
        .'   '.   .-~~~~~-. /     |--'\`~~-.  \\
       // / .---'/  .-~~-._/ / / /---..__.'  /
      ((_(_/    /  /      (_(_(_(---.__    .'
                | |     _              \`~~\`
                | |     \\'.
                 \\ '....' |
                  '.,___.'`))
                break;

            default:
                help();
                break;
        }

    })
  
    .parse(process.argv);


function help() {
    //console.log(program.usage());
    log(chalk.red.bold('Command not found'));

    inquirer.prompt([
        {
            name: "open",
            type: "list",
            message: "Open help in browser?",
            "choices": [
                {
                    "name": "Yes",
                    "value": "yes"
                },
                {
                    "name": "Show me short help here",
                    "value": "text"
                },
                {
                    "name": "Exit",
                    "value": "exit"
                }

            ]

        }], function (answer) {
        switch (answer.open) {
            case 'text':
                log();
                log(chalk.grey('-----------------------------'));
                log(chalk.blue('upoint'), chalk.green('[create|rundev|release]'));
                log();
                log(chalk.green('create'), chalk.grey(' - create a new plugin in current directory'));
                log(chalk.grey('upoint create'));
                log();
                log(chalk.green('rundev'), chalk.grey(' - run developer mode for plugin in current directory'));
                log(chalk.grey('upoint rundev'));

                log();
                log(chalk.green('release'), chalk.grey(' - publish your plugin'));
                log(chalk.grey('upoint release'));
                log(chalk.grey('upoint release --email dev@email.ru --password 123456', chalk.green(' - auto auth without typing your login data')));
                log(chalk.grey('-----------------------------'));

                log();
                break;
            case 'yes':
                opn('http://developer.component17.com/help');
                break;
            case 'exit':
                process.exit();
                break;
        }
    })
}