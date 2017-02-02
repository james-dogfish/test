// Will do the following
// Change server url id in config.json to the dev one
// as we are generating a prod build all the time from jenkins and hence config.json
// values need to be overridden

var fs = require('fs'),
	configJson = require('../app/config');

if (process.argv[2] === "fat") {
	console.log("change config to fat");
	configJson.global.currentEnv = 'fat';
	configJson.global.serverUrl = 'http://server.iconsolutions.com/alcrm3/';
} 

else if (process.argv[2] === "ppte") {
	console.log("change config to ppte");
	configJson.global.currentEnv = 'ppte';
	configJson.global.serverUrl = 'https://iconppte.networkrail.co.uk/WebServices/';
} 

else if (process.argv[2] === "dte") {
	console.log("change config to dte");
	configJson.global.currentEnv = 'dte';
	configJson.global.serverUrl = 'https://icondte.networkrail.co.uk/WebServices/';
	
}

else {
	console.log("change config to prod");
	configJson.global.currentEnv = 'prod';
	configJson.global.serverUrl = 'https://iconprod.networkrail.co.uk/WebServices/';

}


fs.writeFileSync('./app/config.json', JSON.stringify(configJson, null, 4), 'utf8');

console.log('Making DEV changes to config.json');



function copyFile(fromFile, toFile) {
	fs.createReadStream(fromFile).pipe(fs.createWriteStream(toFile));
}
