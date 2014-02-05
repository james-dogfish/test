// Will save user details to the app
// Load User library 
//var User = require('core/User'),
	//Validator = require('validator/Validator'),
	//Util = require('core/Util');

var userPreferences = User.getPreferences();

// Set these values to the app now
$.name.value = userPreferences.name;
$.mobile.value = userPreferences.mobile;
$.email.value = userPreferences.email;
$.sectionSwitch.value = userPreferences.singleView;

if (arguments && arguments[0] && arguments[0].message) {
	// Show a message now
	Util.slideNotify($.window, 0, 'Please provide this information before proceeding. Thanks!');
}

var blurAllFields = function() {
	$.name.blur();
	$.mobile.blur();
	$.email.blur();
};

var saveSettings = function() {
	blurAllFields();

	if(!$.name.value) {
		Util.slideNotify($.window, 0, 'Please provide a valid name.');
		//alert('Please provide a valid name.');
		return false;
	}

	if(!Validator.isValidText($.name.value, 50)) {
		Util.slideNotify($.window, 0, 'Please enter a name that is less than 50 characters.');
		//alert('Please enter a name that is less than 50 characters.');
		return false;
	}

	if(!Validator.isNumber($.mobile.value, 15)) {
		//alert('Please enter a valid mobile number.');
		Util.slideNotify($.window, 0, 'Please enter a valid mobile number.');
		return false;
	}

	// Doing validation checks
	if (!Validator.isEmail($.email.value)) {
		//alert('Please provide a valid email address.');
		Util.slideNotify($.window, 0, 'Please provide a valid email address.');
		return false;
	} 

	if(!Validator.isValidText($.email.value, 254)) {
		//alert('Please enter an email address that is less than 254 characters.');
		Util.slideNotify($.window, 0, 'Please enter an email address that is less than 254 characters.');
		return false;
	}

	// Save user details into the app
	var settingsObj = {
		name: $.name.value,
		mobile: $.mobile.value,
		email: $.email.value,
		singleView: $.sectionSwitch.value
	};
	User.setPreferences(settingsObj);
	
	Ti.App.fireEvent("singleViewChange", {
			isSingleView : $.sectionSwitch.value
		}); 

	$.window.close();
	$.destroy();
};

var closeSettings = function() {
	//if(User.hasPreferences())
	//{
			$.window.close();
			$.destroy();
	//}else{
	//	Util.slideNotify($.window, 0, 'Please provide this information before proceeding. Thanks!');
	//}
};

exports.open = function() {
	$.window.open();
};
