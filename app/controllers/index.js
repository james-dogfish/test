// Touchtest params from old project
if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
	var touchTestModule = undefined;
	try {
		touchTestModule = require("com.soasta.touchtest");
	} catch (tt_exception) {
		Ti.API.error("com.soasta.touchest module is required");
	}

	var cloudTestURL = Ti.App.getArguments().url;
	if (cloudTestURL != null) {
		// The URL will be null if we don't launch through TouchTest.
		touchTestModule && touchTestModule.initTouchTest(cloudTestURL);
	}

	Ti.App.addEventListener('resumed', function(e) {
		// Hook the resumed from background
		var cloudTestURL = Ti.App.getArguments().url;
		if (cloudTestURL != null) {
			touchTestModule && touchTestModule.initTouchTest(cloudTestURL);
		}
	});
}

Alloy.Globals.User = require('core/User');
var User = Alloy.Globals.User;

var Util = require('core/Util');
Alloy.Measurement = require('alloy/measurement');
var localParser = require('parser/localParser');
localParser = new localParser();

//GLOBALS
Alloy.Globals.Soap = require('core/Soap');
Alloy.Globals.isDebugOn = true;
Alloy.Globals.aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
Alloy.Globals.localParser = localParser;

var getValidator = function() {
	var Validator = require('validator/Validator');
	Alloy.Globals.validator = Validator;
};

var startup = function() {
	//only downloads if not already downloaded before.
	Util.downloadAppHelp();

	//only downloads if not already downloaded before.
	Util.downloadCheatSheet();

	Util.showDebugAlert("DEBUG ALERTS IS ON");
	Alloy.Globals.aIndicator.show('Starting up...');
	getValidator();

	Alloy.Globals.aIndicator.hide();
	var mainView = Alloy.createController('main').getView();
	mainView.open();

	// Check whether settings are filled
	if (!Alloy.Globals.User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
		//return false;
	}

};
Ti.App.addEventListener('fireStartup', startup);

if (Alloy.Globals.User.isLoggedIn() && !Alloy.Globals.User.isLoginExpired()) {
	if (User.howLongLeft() >= 10) {
		//Alloy.Globals.Util.showAlert("You need to synchronise the RA App with the NR portal, please Login to the RA App whilst connected to Wifi");
	}
	Ti.App.fireEvent('fireStartup');
} else {
	//show login screen
	Alloy.createController('startup').getView().open();
}
//alert(L('test'));
/*RUN our Unit Tests Here*/
// require('tests_runner').run();
