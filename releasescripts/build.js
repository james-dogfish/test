// Will do the following 
// Change google analytics id in config.json to the production one
// as we are generating a prod build all the time from jenkins and hence config.json
// values need to be overridden

var fs = require('fs'),
	configJson = require('../app/config'),
	//tiapp = require('tiapp.xml').load('./tiapp.xml');


configJson.global.currentEnv = '$BUILD_ENV';

fs.writeFileSync('./app/config.json', JSON.stringify(configJson, null, 4), 'utf8');

