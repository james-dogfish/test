/**************************************************************
 * getValidator: returns an instance of Validator
 **************************************************************/
var getValidator = function() {
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
	Ti.API.info("startup is fired");
	
	//only downloads if not already downloaded before.
	Util.downloadConfig();

	//only downloads if not already downloaded before.
	Util.downloadCheatSheet();

	Util.showDebugAlert("DEBUG ALERTS IS ON");
	
	getValidator();

	var mainView = Alloy.createController('main').getView();
	mainView.open();
	mainView = null;


	//masterSearchTab = null;
	
	// Check whether settings are filled
	if (!User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
		downloadCrossings();
	}else{
		downloadCrossings();
	}
	
	
};

function downloadCrossings() {
	var masterSearchTab = Alloy.createController('searchWindow/masterSearchTab');
	var aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
	Alloy.Globals.aIndicator = aIndicator;
	//CHECK FOR CONNECTIVITY
  	if(Titanium.Network.online){
  		aIndicator.show("Please wait...");
		masterSearchTab.setData(true);
		aIndicator.hide();
	}else{
		aIndicator.show("Please wait...");
		masterSearchTab.setData(false);
		aIndicator.hide();
	}
};
if (User.isLoggedIn() && !User.isLoginExpired()) {
	if (User.howLongLeft() >= 10) {
		alert("You need to synchronise the RA App with the NR portal, please Login to the RA App whilst connected to Wifi");
	}
	startup();
	downloadCrossings();
} else {
	//show login screen
	Alloy.createController('startup').getView().open();
}

exports.startup = startup;
/*RUN our Unit Tests Here*/
//require('tests_runner').run();
