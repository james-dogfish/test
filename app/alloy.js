Alloy.Globals.Styles = require('styles/styles');Alloy.Globals.isDebugOn = require('alloy').CFG.debug;Alloy.Globals.trainIDs = [];Alloy.Globals.censusIDs = [];Alloy.Globals.censusDates = [];Alloy.Globals.moment = require('alloy/moment');Alloy.Globals.Util = require('core/Util');Alloy.Globals.User = require('core/User');Alloy.Globals.Ui = require('core/Ui');Alloy.Globals.Logger = require('core/Logger');Alloy.Globals.Analytics = require('core/Analytics');Alloy.Globals.dialogWindowOpen = false;Alloy.Globals.animationDuration = 50;Alloy.Globals.Styles.windowTop = Alloy.Globals.Util.isIOS7Plus() ? 20 : 0;Alloy.Globals.localDataHandler = require('localDataHandler/localDataHandler');Alloy.Globals.responseGenerator = require('responseGenerator/responseGenerator');Alloy.Globals.interpreter = require('interpreter/interpreterModule2');Alloy.Globals.localParser = require('parser/localParser');Alloy.Globals.Validator = require('validator/Validator');Alloy.Measurement = require('alloy/measurement');Alloy.Globals.aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');Alloy.Globals.Soap = require('core/Soap');Alloy.Globals.Util.connectivityChecker();// START: APM service code injection  // Require the apm moduleAlloy.Globals.apm = undefined;try {	Alloy.Globals.apm = require("com.appcelerator.apm");} catch (e) {	Ti.API.info("com.appcelerator.apm module is not available");}// Initialize the module if it is definedAlloy.Globals.apm && Alloy.Globals.apm.init();// END: APM code injection// Touchtest params from old projectif (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {	var touchTestModule = undefined;	try {		touchTestModule = require("com.soasta.touchtest");	} catch (tt_exception) {		Ti.API.error("com.soasta.touchest module is required");	}	var cloudTestURL = Ti.App.getArguments().url;	if (cloudTestURL != null) {		// The URL will be null if we don't launch through TouchTest.		touchTestModule && touchTestModule.initTouchTest(cloudTestURL);	}	Ti.App.addEventListener('resumed', function(e) {		// Hook the resumed from background		var cloudTestURL = Ti.App.getArguments().url;		if (cloudTestURL != null) {			touchTestModule && touchTestModule.initTouchTest(cloudTestURL);		}	});}