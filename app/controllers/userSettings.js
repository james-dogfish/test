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
		return false;
	}

	if (!Alloy.Globals.Validator.isValidText($.name.value, 50)) {
		Alloy.Globals.Util.slideNotify(0, 'Please enter a name that is less than 50 characters.');
		return false;
	}

	if (!Alloy.Globals.Validator.isNumber($.mobile.value, 15)) {
		Alloy.Globals.Util.slideNotify(0, 'Please enter a valid mobile number.');
		return false;
	}

	// Doing validation checks
	if (!Alloy.Globals.Validator.isEmail($.email.value)) {
		Alloy.Globals.Util.slideNotify(0, 'Please provide a valid email address.');
		return false;
	}

	if (!Alloy.Globals.Validator.isValidText($.email.value, 254)) {
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
		sdkVersion = Ti.version,
		userName = Alloy.Globals.User.getPreferences().name,
		alcrmUsername = Alloy.Globals.User.getLogin().username,
		emailBody = '';

	emailBody += 'Please describe your problem here by providing as much detail as you can - \n\n';
	emailBody += '\n--------------------------------------------------\n';
	emailBody += 'Diagnostic information - Please do not edit!\n';
	emailBody += 'ALCRM Username - ' + alcrmUsername + '\n';
	emailBody += 'App Version - ' + appVersion + '\n';
	emailBody += 'OS Version - ' + osVersion + '\n';
	emailBody += 'Devide Model - ' + deviceType + '\n';
	emailBody += 'Titanium SDK Version - ' + sdkVersion;
	emailBody += '\n--------------------------------------------------\n';

	var zipBlob = Alloy.Globals.Util.zipUpDocumentsFolder();

	Alloy.Globals.Util.sendBugReport({
		userName: userName,
		emailBody: emailBody,
		docsZip: zipBlob
	});
};