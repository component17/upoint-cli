var prompt = require('prompt');
var request = require('request');
var programm = require('commander');
var chalk = require('chalk');
var spinner = require('cli-spinners');
var Ora = require('./spinner.js');
var path = require('path');
var zipFolder = require('zip-folder');
var fs = require('fs');
var opn = require('opn');
var inquirer = require('inquirer');
var log = console.log;
var progress = require('request-progress');
const post = require('./post').post;
const archiver = require('archiver');

const getFiles = function (path, files) {
	fs.readdirSync(path).forEach(function (file) {
		var subpath = path + '/' + file;
		//console.log(file);
		if(['node_modules', '.idea'].indexOf(file) !== -1) {
		
		} else if (fs.lstatSync(subpath).isDirectory()) {
			getFiles(subpath, files);
		} else {
			files.push(path + '/' + file);
		}
	});
}

class Upload {
    constructor(token) {
        this.token = token;
        this.config = {};

    }

    start() {

        var config = require(path.join(process.cwd(), './config.js'));
        this.config = config;
        this.checkVersion(config);
        //this.zip(config);
    }
    
    
    checkDir() {
    	let files = ['config.js', 'install.js', 'src/dist/App.js', 'src/dist/Api.js', 'src/dist/PluginInstall.js'];
    	
	    files.forEach((file) => {
			if(!fs.existsSync(file)) {
				throw new Error(`Required file '${file}' not found in current directory`);
			}
	    });
	    
    	
	    return true;
    }

    release(config, create = false, data = {}) {
	    const s = new Ora({
		    spinner: spinner.dots,
		    text: 'Upload a new plugin to ' + chalk.red('Upoint.Service')
	    });
	    
	    
	    let tmp = path.normalize(process.env.TMP).replace(/\\/g, '\\\\');
        this.zip({
	        dev: `${tmp}\\${config.developer}-${config.name}_dev.zip`,
	        prod: `${tmp}\\${config.developer}-${config.name}_prod.zip`
        }, process.cwd()).then((files) => {
        	//console.log(files);
        	s.start();
	        let zip_dev = files.find(f => f.type === 'dev');
	        let zip_prod = files.find(f => f.type === 'prod');
             

           let r = request.post({
                url: "http://localhost:8088/cli/release",
                json: true,
                strictSSL: false,
            }, (err, res, data) => {
                if(err) {
                    s.fail(err.message);
                    process.exit();
                }
                
                if(res.statusCode !== 200) {
                    s.fail(data.text);
                    process.exit();
                }
                
                if(data) {
                    s.succeed(data.text);
	                inquirer.prompt([
		                {
			                name: "open",
			                type: "list",
			                message: "What next?",
			                "choices": [
				                {
					                "name": "Open plugin page for editing",
					                "value": "edit"
				                },
				                {
					                "name": "Exit",
					                "value": "exit"
				                }
			
			                ]
			
		                }], function (answer) {
		                switch (answer.open) {
			                case 'edit':
				                if (opn('http://developer.component17.com/edit/?upl='+data.upl)) {
					                //process.exit();
					
				                }
				                log(chalk.blue("Work is done. Great! Now you can type"), chalk.red('upoint monkey'), chalk.blue("in your console :-)"))
				                break;
			                case 'exit':
				                log(chalk.blue("Work is done. Great! Now you can type"), chalk.red('upoint monkey'), chalk.blue("in your console :-)"))
				                process.exit();
				                break;
		                }
	                })
                }
            });

            let form = r.form();
	        form.append('token', this.token);
	        form.append('config', JSON.stringify(config));
            form.append('zip_dev', fs.createReadStream(path.normalize(zip_dev.file)), {filename: 'zip_dev'});
            form.append('zip_prod', fs.createReadStream(path.normalize(zip_prod.file)), {filename: 'zip_prod'});
            

        }).catch(function (e) {
        	console.log('Catch error: ', e);
            s.fail(e.message);
        })
    }
    
    update(config) {
    	
	    const s = new Ora({spinner: spinner.dots, text: 'Upload a new version'});
	    
        this.zip({
	        dev: `${process.env.TMP}/${config.developer}-${config.name}_dev.zip`,
	        prod: `${process.env.TMP}/${config.developer}-${config.name}_prod.zip`
        }, process.cwd()).then((files) => {
        	s.start();
	
	        let zip_dev = `${process.env.TMP}\\${config.developer}-${config.name}_dev.zip`;//files.find(f => f.type === 'dev');
	        let zip_prod = `${process.env.TMP}\\${config.developer}-${config.name}_prod.zip`;//files.find(f => f.type === 'prod');
	
	
	       // console.log(this.token);
	        let r = request.post({
		        url: "http://localhost:8088/cli/update",
		        json: true,
		        strictSSL: false,
	        }, (err, res, data) => {
		        if(err) {
			       console.log('network error', err);
			        s.fail(err.message);
			        process.exit();
			        return;
		        }
		
		        if(res.statusCode !== 200) {
			        //console.log('statusCode: ', res.statusCode);
			        //console.log('Reply: ', data);
			        s.fail('[status code: ' + res.statusCode + '] ' +data.text);
			        process.exit();
		        }
		
		        if(data) {
			        s.succeed(data.text);
			        inquirer.prompt([
				        {
					        name: "open",
					        type: "list",
					        message: "What next?",
					        "choices": [
						        {
							        "name": "Open plugin page for editing",
							        "value": "edit"
						        },
						        {
							        "name": "Exit",
							        "value": "exit"
						        }
					
					        ]
					
				        }], function (answer) {
				        switch (answer.open) {
					        case 'edit':
						        if (opn('http://developer.component17.com/edit/?upl='+data.upl)) {
							        //process.exit();
							
						        }
						        log(chalk.blue("Work is done. Great! Now you can type"), chalk.red('upoint monkey'), chalk.blue("in your console :-)"))
						        break;
					        case 'exit':
						        log(chalk.blue("Work is done. Great! Now you can type"), chalk.red('upoint monkey'), chalk.blue("in your console :-)"))
						        process.exit();
						        break;
				        }
			        })
		        }
	        });
	
	        //console.log(zip_dev, zip_prod);
	        //console.log(fs.createReadStream(zip_dev.replace(/\//g, '\\\\')));
	        let form = r.form();
	        form.append('token', this.token);
	        form.append('config', JSON.stringify(config));
	        form.append('zip_dev', fs.createReadStream(zip_dev.replace(/\//g, '\\\\')), {filename: 'zip_dev'});
	        form.append('zip_prod', fs.createReadStream(zip_prod.replace(/\//g, '\\\\')), {filename: 'zip_prod'});
        })
    }
	
	
	async zip  (archivePath, folderPath)  {
		const s = new Ora({spinner: spinner.dots, text: 'Create zip archive'});
		s.start();
		let promises = [];
		for(let key in archivePath) {
			
			promises.push(new Promise((resolve, reject) => {
				let apath = path.normalize(archivePath[key]);
				let zip = new archiver('zip', {
					zlib: {
						level: 9
					}
				});
				
				//console.log({apath})
				
				let output = fs.createWriteStream(apath);
				if(!output) {
					throw new Error("Can't open " + apath);
				}
				//console.log('Archive path', apath);
				
				output.on('close', () => {
					console.log(zip.pointer() + ' total bytes');
					console.log(key + ' archiver has been finalized and the output file descriptor has closed.');
					s.succeed(`${key} archive has been created: ${zip.pointer()} bytes`);
					resolve({type: key, file: apath});
				});
				
				output.on('end', () => {
					console.log('data has been drained');
					resolve();
				});
				zip.pipe(output);
				zip.on('error', function(err) {
					throw err;
				});
				zip.on('warning', function (err) {
					if (err.code === 'ENOENT') {
						console.log(err);
					} else {
						reject(err);
					}
				});
				
				switch(key) {
					case 'dev':
						let dev_files = [];
						getFiles(folderPath, dev_files);
						dev_files.forEach((f, i) => {
							let file = path.normalize(f).replace(/\\/g, '\\\\');
							zip.file(file, {
								name: f.replace(process.cwd(), '')
							});
						});
						zip.finalize();
						break;
					case 'prod':
						zip.directory(folderPath + '/src/dist/', 'src/dist');
						let files = ['install.js', 'config.js'];
						files.forEach((file) => {
							zip.file(folderPath + '/' + file, {name: file});
						});
						zip.finalize();
						//resolve();
						break;
				}
			}).catch((e) => {
				console.warn("Archive promise error: " + e);
			}));
		}
		
		let files = await Promise.all(promises);
		s.succeed("All archives has been created");
		//console.log(files);
		
		return files;
		
	}

    checkVersion(config) {
    	
	    const s = new Ora({
		    spinner: spinner.dots,
		    text: 'Check plugin version'
	    });
	    s.start();
	
	    try {
		    this.checkDir(process.cwd());
	    } catch (e) {
		    s.fail(e.message);
		    process.exit();
	    }
	    
        post("cli/check", config, this.token).then((data) => {
        	s.succeed(data.release ?  "Create new plugin on service" : "Upload new version");
            if(data.validate) {
                data.release ? this.release(config) : this.update(config);
            }
        }).catch((e) => {
        	s.fail(e.text);
        	process.exit();
        })
        
    }
}



module.exports = function () {
    return new Upload();
}