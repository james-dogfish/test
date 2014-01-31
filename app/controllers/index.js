//GLOBALS
//User = require('core/User');
//var User = User;
//var Util = require('core/Util');
//Alloy.Measurement = require('alloy/measurement');

//var localParser = require('parser/localParser');
//localParser = new localParser();
//Alloy.Globals.localParser = localParser;

//Alloy.Globals.aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
//Alloy.Globals.Soap = require('core/Soap');
//END OF GLOBALS

/**************************************************************
 * getValidator: returns an instance of Validator
 **************************************************************/
var getValidator = function() {
	//var Validator = require('validator/Validator');
	Alloy.Globals.validator = Validator;
};

/*************************************************************
 * startup: - Downloads app help + cheatsheet.
 * 			- Initialises the validator by calling getValidator
 * 			- Creates the mainView.
 * 			- Checks if user has prefs and shows settings view
 * 			  if not.
 * 
 *************************************************************/
var startup = function() {
	//only downloads if not already downloaded before.
	Util.downloadConfig();

	//only downloads if not already downloaded before.
	Util.downloadCheatSheet();

	Util.showDebugAlert("DEBUG ALERTS IS ON");
	Alloy.Globals.aIndicator.show('Starting up...');
	getValidator();

	Alloy.Globals.aIndicator.hide();
	var mainView = Alloy.createController('main').getView();
	mainView.open();

	// Check whether settings are filled
	if (!User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
		//return false;
	}
};


Ti.App.addEventListener('fireStartup', startup);

if (User.isLoggedIn() && !User.isLoginExpired()) {
	if (User.howLongLeft() >= 10) {
		alert("You need to synchronise the RA App with the NR portal, please Login to the RA App whilst connected to Wifi");
	}
	Ti.App.fireEvent('fireStartup');
} else {
	//show login screen
	Alloy.createController('startup').getView().open();
}

/*RUN our Unit Tests Here*/
//require('tests_runner').run();
