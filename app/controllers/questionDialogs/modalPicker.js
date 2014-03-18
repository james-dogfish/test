var args = arguments[0] || {};

var currentValue = args.currentValue;

var data = [];
for (var i = 0; i < args.valueList.length; i++) {
	var isSelected = false;
	if (args.valueList[i].value == args.currentValue.value) {
		isSelected = true;
	}

	// Creating multirows here
	var row = Ti.UI.createTableViewRow({
		index : i,
		ntitle: args.valueList[i].displayValue,
		value: args.valueList[i].value,
		tintColor: '#008FD5',
		height: Ti.UI.SIZE,
		width: Ti.UI.SIZE,
		hasCheck: isSelected
	});

	var questionLabel = Ti.UI.createLabel({
		height: Ti.UI.SIZE,
		width: Ti.UI.FILL,
		text: args.valueList[i].displayValue,
		font: {
			fontSize: 19
		},
		left: 15,
		top: 5,
		bottom: 5,
		right: 10,
		touchEnabled: false
	});
	row.add(questionLabel);
	data.push(row);
}
$.tableView.setData(data);

var closeWindow = function() {
	//Ti.API.info("currentValue = "+JSON.stringify(currentValue));
	args.closeCallBack(currentValue);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e) {
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	if (args.closeWithNoValueCallBack) {
		args.closeWithNoValueCallBack();
	}
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
}

function rightNavButtonClick(e) {
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	closeWindow();
};

function clearButtonClick(e) {
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	args.closeCallBack({
		title: "",
		value: ""
	});
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function rowClicked(e) {
	
	if (e.row.hasCheck == true) {
		return;
	}
	
	for (var i = 0; i < data.length; i++) {
		data[i].hasCheck = false;
	}
	data[e.row.index].hasCheck = true;
	
	currentValue = {
		displayValue: e.row.ntitle,
		value: e.row.value
	};
	$.tableView.setData(data);
}

$.window.open();