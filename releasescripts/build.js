var fs = require('fs'),
	configJson = require('../app/config');

configJson.global.currentEnv = '$BUILD_ENV';
fs.writeFileSync('./app/config.json', JSON.stringify(configJson, null, 4), 'utf8');

console.log('Making uat changes to config.json');