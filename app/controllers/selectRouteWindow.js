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

if(Ti.App.deployType === 'test'){
	$.textFieldTestingOnly.height = "40dp";
	$.textFieldTestingOnly.top = "10dp";
	$.textFieldTestingOnly.bottom = "10dp";
}
else{
	$.textFieldTestingOnly.height = 0;
	$.textFieldTestingOnly.top = 0;
	
}

function sortByNestedTitle(a, b) {
    var x = a.toLowerCase();
    var y = b.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

exports.show = function(routeList,callbackfunction){
	doneCallbackfunction = callbackfunction;
	routeList.sort();
	var data = [];
	for(var i=0;i<routeList.length;i++){
		
		data.push(Ti.UI.createPickerRow({title: routeList[i], touchTestId: routeList[i] }));
	}
	data.sort();
	$.pickerView.add(data);
	$.pickerView.selectionIndicator = true;
	$.pickerView.setSelectedRow(0, 0, true);
	currentValue = routeList[0];
	
	$.win.open();
};

function pickerChange(e){
	currentValue = {
		title : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).title
	};
};

function doneButtonClick(e){
	//$.win.close();
	//
	Ti.App.Properties.setString('SelectedRoute', currentValue.title);
	
	if($.textFieldTestingOnly.value != ""){
		doneCallbackfunction({title : $.textFieldTestingOnly.value, value : $.textFieldTestingOnly.value});	
	}
	else{
		doneCallbackfunction(currentValue);	
	}
	$.win.hide();
	
	//$.destroy();
};
