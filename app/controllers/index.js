/**************************************************************
 * getValidator: returns an instance of Validator
 **************************************************************/
var getValidator = function() {
	Alloy.Globals.validator = Alloy.Globals.Validator;
};

/*************************************************************
 * startup: - Downloads app help
 * 			- Initialises the validator by calling getValidator
 * 			- Creates the mainView.
 * 			- Checks if user has prefs and shows settings view
 * 			  if not.
 * 
 *************************************************************/
var startup = function() {
	Alloy.Globals.Logger.log("startup is fired", "info");
	
	//only downloads if not already downloaded before.
	Alloy.Globals.Util.downloadConfig();

	Alloy.Globals.Util.showDebugAlert("DEBUG ALERTS IS ON");
	
	getValidator();

	var mainView = Alloy.createController('main').getView();
	mainView.open();
	mainView = null;
	
	// Check whether settings are filled
	if (!Alloy.Globals.User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
	}
	
};

Alloy.Globals.Index = {};
Alloy.Globals.Index.Startup = startup;

if (Alloy.Globals.User.isLoggedIn()) {
	if (Alloy.Globals.User.howLongLeft() >= 14) {
		Alloy.createController('startup').getView().open();
		alert("You need to synchronise the RA App with the NR portal, please Login to the RA App whilst connected to Wifi");
	}else{
		startup();
	}
} else {
	//show login screen
	Alloy.createController('startup').getView().open();
}

exports.startup = startup;
/*RUN our Unit Tests Here*/
//require('tests_runner').run();
