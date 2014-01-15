// START: APM service code injection
// Require the apm module
Alloy.Globals.apm = undefined;
try {
Alloy.Globals.apm = require("com.appcelerator.apm");
}
catch (e) {
Ti.API.info("com.appcelerator.apm module is not available");
}

// Initialize the module if it is defined
Alloy.Globals.apm && Alloy.Globals.apm.init();
// END: APM code injection

// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};			
var User = require('core/User');
var Util = require('core/Util');
Alloy.Measurement = require('alloy/measurement');
var localParser = require('parser/localParser');
localParser = new localParser();

//GLOBALS
Alloy.Globals.Soap = require('core/Soap');
Alloy.Globals.isDebugOn  = true;
Alloy.Globals.aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
Alloy.Globals.localParser = localParser;

var getValidator = function()
{
		var Validator = require('validator/Validator');
		Alloy.Globals.validator =  Validator;
};


var startup = function(){
		Alloy.Globals.aIndicator.show('Starting up...');
		getValidator();
		
		Alloy.Globals.aIndicator.hide();
		var mainView = Alloy.createController('main').getView();
        mainView.open();
        
		// Check whether settings are filled 
		if (!User.hasPreferences()) {
				// Open setting screen
				var userSettings = Alloy.createController('userSettings', {
					message: true
				}).getView();
				userSettings.open();
				//return false;
		}
		
};
Ti.App.addEventListener('fireStartup',startup);

if (User.isLoggedIn() && !User.isLoginExpired()) {
	if (User.howLongLeft() >= 10) {
		//Alloy.Globals.Util.showAlert("You need to synchronise the RA App with the NR portal, please Login to the RA App whilst connected to Wifi");
	}
	Ti.App.fireEvent('fireStartup');
} else {
	//show login screen
	Alloy.createController('index').getView().open();
}

/*RUN our Unit Tests Here*/
// require('tests_runner').run();