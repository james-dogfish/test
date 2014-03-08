// Will save user details to the app
var userPreferences = Alloy.Globals.User.getPreferences();

// Set these values to the app now
$.name.value = userPreferences.name;
$.mobile.value = userPreferences.mobile;
$.email.value = userPreferences.email;
$.sectionSwitch.value = userPreferences.singleView;

if (arguments && arguments[0] && arguments[0].message) {
	// Show a message now
	Alloy.Globals.Util.slideNotify(0, 'Please provide this information before proceeding. Thanks!');
}

var blurAllFields = function() {
	$.name.blur();
	$.mobile.blur();
	$.email.blur();
};

var saveSettings = function() {
	blurAllFields();

	if (!$.name.value) {
		Alloy.Globals.Util.slideNotify(0, 'Please provide a valid name.');
		//alert('Please provide a valid name.');
		return false;
	}

	if (!Alloy.Globals.Validator.isValidText($.name.value, 50)) {
		Alloy.Globals.Util.slideNotify(0, 'Please enter a name that is less than 50 characters.');
		//alert('Please enter a name that is less than 50 characters.');
		return false;
	}

	if (!Alloy.Globals.Validator.isNumber($.mobile.value, 15)) {
		//alert('Please enter a valid mobile number.');
		Alloy.Globals.Util.slideNotify(0, 'Please enter a valid mobile number.');
		return false;
	}

	// Doing validation checks
	if (!Alloy.Globals.Validator.isEmail($.email.value)) {
		//alert('Please provide a valid email address.');
		Alloy.Globals.Util.slideNotify(0, 'Please provide a valid email address.');
		return false;
	}

	if (!Alloy.Globals.Validator.isValidText($.email.value, 254)) {
		//alert('Please enter an email address that is less than 254 characters.');
		Alloy.Globals.Util.slideNotify(0, 'Please enter an email address that is less than 254 characters.');
		return false;
	}

	// Save user details into the app
	var settingsObj = {
		name: $.name.value,
		mobile: $.mobile.value,
		email: $.email.value,
		singleView: $.sectionSwitch.value
	};
	Alloy.Globals.User.setPreferences(settingsObj);

	Alloy.Globals.Util.slideNotify(0, '', true); // hide any open settings errors

	Ti.App.fireEvent("singleViewChange", {
		isSingleView: $.sectionSwitch.value
	});

	$.window.close();
	$.destroy();
};

var closeSettings = function() {
	$.window.close();
	$.destroy();
};

exports.open = function() {
	$.window.open();
};

function focusMobile() {
	$.mobile.focus();
}

function focusEmail() {
	$.email.focus();
}

function sendBugReport() {

	var appVersion = Ti.App.version,
		osVersion = Ti.Platform.osname + " " + Ti.Platform.version,
		deviceType = Ti.Platform.model,
		sdkVersion = Ti.version;

	var emailBody = 'App Version - ' + appVersion + '\n';
	emailBody += 'OS Version - ' + osVersion + '\n';
	emailBody += 'Devide Model - ' + deviceType + '\n';
	emailBody += 'Titanium SDK Version - ' + sdkVersion;

	var zipBlob = Alloy.Globals.Util.zipUpDocumentsFolder();

	Alloy.Globals.Util.sendBugReport({
		emailBody: emailBody,
		docsZip: zipBlob
	});
};