var prompt = require('prompt');
var request = require('request');
var chalk = require('chalk');
var spinner = require('cli-spinners');
var Ora = require('./spinner.js');
var Upload = require('./upload.js');
var inquirer = require('inquirer');
var opn = require('opn');
var optimist = require('optimist');
var firebase = require('firebase');

var fs = require('fs');
var path = require('path');
var log = console.log;
var http = require('http');
var querystring = require('querystring');
prompt.override = optimist.argv;

const post = require('./post.js').post;

firebase.initializeApp({
	databaseURL: "https://ustore-2d4e9.firebaseio.com",
	apiKey: "AIzaSyCwwc2vMvkd5RN9M5G87_cdnIUOa0Ab5lY",
	authDomain: "ustore-2d4e9.firebaseapp.com",
});


var login = {
    properties: {
        email: {
            description: chalk.blue('E-mail'),
            pattern: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
            message: 'Invalid email',
            required: true
        },
        password: {
            description: chalk.blue('Password'),
            pattern: /.*/,
            message: 'Password can\'t be empty',
            required: true,
            hidden: true,
            replace: '*'
        }
    }
};
var u = Upload();
try {
    fs.lstatSync(path.join(process.cwd(), './src')).isDirectory();

} catch (error) {
    log();
    log(chalk.red('------------------------------'));
    log(chalk.red(error));
    log(chalk.red('------------------------------'));

    process.exit();

}


var loginFunc = function (err, result) {

    const s = new Ora({spinner: spinner.dots, text: 'Check login, please wait'});
    s.start();
    
    firebase.auth().signInWithEmailAndPassword(result.email, result.password.toString()).then(() => {
    	firebase.auth().currentUser.getIdToken().then((_token) => {
    		//console.log(token);
		    token = _token;
		    const postData = {
			   token
		    };
		
		    request.post(
			    'http://localhost:8088/cli/login',
			    { json: postData },
			    function (error, response, body) {
				    if (!error && response.statusCode == 200) {
					    s.succeed("OK");
					    s.succeed("Check plugin data");
					    let options;
					    try {
					    	options =  require(path.join(process.cwd(), './config.js'));
						    //console.log(options);
						    options = Object.assign({}, options, {token});
						    u.token = token;
						    u.start();
					    } catch (e) {
					    	s.fail(e.message);
					    }
				    } else {
				    	if(error && error.code === 'ECONNREFUSED') {
				    		s.fail("Can\'t connect to server");
				    		process.exit();
					    } else {
				    		switch(body.code) {
							    case 400: //verify email
								    s.fail(body.text);
								    s.stop();
								    inquirer.prompt([
									    {
										    name: "open",
										    type: "list",
										    message: "What next?",
										    "choices": [
											    {
												
												    "name": chalk.green("Send activation mail"),
												    "value": "sendmail"
											    },
											    {
												    "name": chalk.red("Exit"),
												    "value": "exit"
											    }
										    ]
										
									    }], function (answer) {
										    switch (answer.open) {
											    case 'sendmail':
												    let user = firebase.auth().currentUser;
												    user.sendEmailVerification();
												    console.log(chalk.green("Check your mailbox"));
												    process.exit();
												
												    break;
											    case 'exit':
												    process.exit();
												    break;
										    }});
								    break;
								    
							    default:
								    s.fail(body.text);
								    s.stop();
								    break;
						    }
					    }
				    }
			    }
		    );
	    });
    }).catch((err) => {
    	s.fail(err.message);
    })
    
	
   /* firebase.auth().signInWithEmailAndPassword(result.email, result.password).then((auth) => {
        s.succeed("Login succeed");
        
        
        
    }).catch((err) => {
        s.fail(err.message);
    })*/

    /*request.post({
        url: "https://rest.component17.com/jwt/login",
        form: {
            email: result.email,
            password: result.password
        }
    }, function (err, http, body) {
        if (err) {
            s.stop();
            return;
        }
        //console.log(http);
        token = JSON.parse(body);
        token = token.token;
        s.stop();

        if (token) {
            u.token = token;
            s.succeed("Login succeed");
            u.start();
        } else {
            s.stop();
            s.fail("Invalid login or password");
            //prompt.stop();

            inquirer.prompt([
                {
                    name: "open",
                    type: "list",
                    message: "What next?",
                    "choices": [
                        {

                            "name": "Try again",
                            "value": "login"
                        },
                        {
                            "name": chalk.green("Restore password"),
                            "value": "restore"
                        },
                        {
                            "name": chalk.blue("Create a new account"),
                            "value": "create"
                        },{
                            "name": chalk.red("Exit"),
                            "value": "exit"
                        }
                    ]

                }], function (answer) {
                switch (answer.open) {
                    case 'restore':
                        opn('http://developer.component17.com/password/restore');
                        break;
                    case 'create':
                        opn('http://developer.component17.com/account/create');
                        break;
                    case 'login':
                        prompt.override.email = '';
                        prompt.override.password = '';
                        prompt.get(login, loginFunc);
                        break;
                    case 'exit':
                        process.exit();
                        break;
                }
            })
            /!* log();
             log(chalk.blue("[*] Restore password: http://developer.component17.com/password/restore"));
             log(chalk.blue("[*] Create a new account: http://developer.component17.com/account/create"));
             log();*!/
        }
    })*/
};
console.log('')
console.log(chalk.green('____________________________________'));
log();
console.log(chalk.blue('    🌍'), chalk.green.bold("UPOINT PLUGIN RELEASE"), chalk.blue('🌍'));
console.log(chalk.green('____________________________________'));
log();

prompt.start();
prompt.get(login, loginFunc);






