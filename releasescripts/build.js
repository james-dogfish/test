// Will do the following
// Change server url id in config.json to the Prod one
// as we are generating a prod build all the time from jenkins and hence config.json
// values need to be overridden

var fs = require('fs'),
	configJson = require('../app/config');

configJson.global.serverUrl = 'http://server.iconsolutions.com/alcrm3/';
//configJson.global.headerCol = '#f7f7f7';


if (process.argv[2] === "dte") {
	console.log("change config to dte");
	configJson.global.currentEnv.serverUrl = 'https://icondte.networkrail.co.uk/WebServices/';
	
else if (process.argv[2] === "ppte") {
console.log("change config to ppte");
configJson.global.currentEnv.serverUrl = 'https://iconppte.networkrail.co.uk/WebServices';

} else(process.argv[2] === "fat") {
	console.log("change config to fat");
	configJson.global.currentEnv.serverUrl = 'http://server.iconsolutions.com/alcrm3/';
}


fs.writeFileSync('./app/config.json', JSON.stringify(configJson, null, 4), 'utf8');

console.log('Making prod changes to config.json');



function copyFile(fromFile, toFile) {
	fs.createReadStream(fromFile).pipe(fs.createWriteStream(toFile));
}