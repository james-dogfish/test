var args = arguments[0] || {};

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

function sortByNestedTitle(a, b) {
    var x = a.title.toLowerCase();
    var y = b.title.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

exports.show = function(routeList,callbackfunction){
	doneCallbackfunction = callbackfunction;

	routeList.sort(sortByNestedTitle); //sorts alphabetically and descending
	
	var data = [];
	for(var i=0;i<routeList.length;i++){
		data.push(Ti.UI.createPickerRow({title: routeList[i].title, touchTestId: routeList[i].title }));
	}
	
	data.sort(sortByNestedTitle);
	
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
