var Styles = require('styles/styles');var isDebugOn = require('alloy').CFG.debug;var XMLTools = require("tools/XMLTools");var moment = require('alloy/moment');var Util = require('core/Util');var User = require('core/User');var Ui = require('core/Ui');var localDataHandler = require('localDataHandler/localDataHandler');var responseGenerator = require('responseGenerator/responseGenerator');var interpreter = require('interpreter/interpreterModule2');var localParser = require('parser/localParser');var Validator = require('validator/Validator');Alloy.Measurement = require('alloy/measurement');Alloy.Globals.aIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');Alloy.Globals.Soap = require('core/Soap');// START: APM service code injection// Require the apm moduleAlloy.Globals.apm = undefined;try {Alloy.Globals.apm = require("com.appcelerator.apm");}catch (e) {Ti.API.info("com.appcelerator.apm module is not available");}// var User = require('core/User');// var Util = require('core/Util');// Initialize the module if it is definedAlloy.Globals.apm && Alloy.Globals.apm.init();// END: APM code injection
// START: APM service code injection
// Require the apm modulevar User = require('core/User');
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
// Touchtest params from old projectif (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {	var touchTestModule = undefined;	try {		touchTestModule = require("com.soasta.touchtest");	} catch (tt_exception) {		Ti.API.error("com.soasta.touchest module is required");	}	var cloudTestURL = Ti.App.getArguments().url;	if (cloudTestURL != null) {		// The URL will be null if we don't launch through TouchTest.		touchTestModule && touchTestModule.initTouchTest(cloudTestURL);	}	Ti.App.addEventListener('resumed', function(e) {		// Hook the resumed from background		var cloudTestURL = Ti.App.getArguments().url;		if (cloudTestURL != null) {			touchTestModule && touchTestModule.initTouchTest(cloudTestURL);		}	});}