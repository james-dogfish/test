var args = arguments[0] || {};

var data = [];
for (var i = 0; i < args.valueList.length; i++) {
	var isSelected = false;
	for (var valuesSelectedIndex = 0; valuesSelectedIndex < args.valuesSelected.length; valuesSelectedIndex++) {
		if (args.valueList[i].value == args.valuesSelected[valuesSelectedIndex]) {
			isSelected = true;
		}
	}

	// Creating multirows here
	var row = Ti.UI.createTableViewRow({
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

	var returnValue = {
		displayNameList: [],
		valueList: [],
		singleStringValue: ""
	};


	for (var i = 0; i < data.length; i++) {
		if (data[i].hasCheck == true) {

			returnValue.displayNameList.push(data[i].ntitle);
			returnValue.valueList.push(data[i].value);

			if (returnValue.singleStringValue == "") {
				returnValue.singleStringValue = data[i].ntitle;
			} else {
				returnValue.singleStringValue = returnValue.singleStringValue + ", " + data[i].ntitle;
			}
		}
	}
	args.closeCallBack(returnValue);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e) {
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	args.closeWithNoValueCallBack();
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
	var returnValue = {
		displayNameList: [],
		valueList: [],
		singleStringValue: ""
	};

	args.closeCallBack(returnValue);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function rowClicked(e) {
	if (e.row.hasCheck == true) {
		e.row.hasCheck = false;
	} else {
		e.row.hasCheck = true;
	}
}

$.window.open();