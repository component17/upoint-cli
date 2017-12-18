const chalk = require('chalk');
const prompt = require('prompt');
const programm = require('commander');
const {writeFile} = require('fs');

let config;
try {
	config = require(process.cwd() +'/config.js');
} catch (e) {
	console.error(e.message);
}

let [major, minor, build, revision] = config.version.split('.').map((v) => parseInt(v));

if(major === undefined) major = 1;
if(minor === undefined) minor = 0;
if(build === undefined) build = 0;
if(revision === undefined) revision = 0;

if(programm.rawArgs.indexOf('--major') !== -1) {
	++major;
	minor = 0; build = 0;revision = 0;
} else if(programm.rawArgs.indexOf('--minor') !== -1) {
	++minor;
	build = 0;revision = 0;
} else if(programm.rawArgs.indexOf('--build') !== -1) {
	++build;
	revsion = 0;
} else if(programm.rawArgs.indexOf('--revision') !== -1) {
	++revision;
}

let version = [0,0,0,0];

if(revision) {
	version[3] = revision;
}

if(build) {
	version[2] = build;
}

if(minor) {
	version[1] = minor;
}

version[0] = major;

if(version[2] === 0 && version[3] === 0) {
	version = version.splice(0, 2);
} else if(version[2] && version[3] === 0) {
	version = version.splice(0, 3);
}



version = version.join('.');

if(programm.rawArgs.indexOf('--alpha') !== -1) {
	version += 'a';
} else if(programm.rawArgs.indexOf('--beta') !== -1) {
	version += 'b';
} else if(programm.rawArgs.indexOf('--rc') !== -1) {
	version += 'rc';
}

new Promise((resolve, reject) => {
	config.version = version;
	writeFile(process.cwd() + '/config.js', "module.exports = "+JSON.stringify(config, true, 2), (err) => {
		if(err) {
			reject(err);
		}
		
		resolve();
	})
}).then(() => {
	console.log('Version updated')
}).catch((error) => {
	console.log("Error", error);
});






