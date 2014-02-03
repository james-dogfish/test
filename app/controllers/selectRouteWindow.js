var args = arguments[0] || {};
//var User = require('core/User');

var doneCallbackfunction = null;

var currentValue = null;

var pWidth = Ti.Platform.displayCaps.platformWidth,
	pHeight = Ti.Platform.displayCaps.platformHeight;

if (pWidth > pHeight) {
	// landscape
	$.background.backgroundImage = 'images/bg/landscape.jpg';
} else {
	// portrait
	$.background.backgroundImage = 'images/bg/portrait.jpg';
}

exports.show = function(routeList,callbackfunction){
	doneCallbackfunction = callbackfunction;

	var data = [];
	for(var i=0;i<routeList.length;i++){
		data.push(Ti.UI.createPickerRow({title: routeList[i].title}));
	}
	
	$.pickerView.add(data);
	$.pickerView.selectionIndicator = true;
	$.pickerView.setSelectedRow(0, 0, true);
	currentValue = routeList[0];
	
	$.win.open();
};

function pickerChange(e){
	currentValue = {
		title : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).value
	};
};

function doneButtonClick(e){
	$.win.close();
	//loginWin.closeLoginWin();
	var loginWin = Alloy.createController('startup');
	loginWin.closeLoginWin();
	
	Ti.App.Properties.setString('SelectedRoute', currentValue.title);
	
	doneCallbackfunction(currentValue);	
	$.win.hide();
	
	$.destroy();
};
