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
			fontSize: 17
		},
		left: 15,
		top: 5,
		bottom: 5,
		right: 10,
		touchEnabled: false
	});
	row.add(questionLabel);
	data.push(row);

	// data.push(Ti.UI.createTableViewRow({
	// 	title: args.valueList[i].displayValue, 
	// 	value : args.valueList[i].value, 
	// 	tintColor:'#008FD5',
	// 	height: Ti.UI.SIZE,
	// 	width: Ti.UI.SIZE,
	// 	hasCheck : isSelected}));
}

$.tableView.setData(data);
//$.tableView.selectionIndicator = true;


var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = Alloy.Globals.animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = Alloy.Globals.animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "12%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-76%";
animationClose.duration = Alloy.Globals.animationDuration;
animationClose.addEventListener("complete", function(e) {
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	//$.destory();
});

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
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e) {
	args.closeWithNoValueCallBack();
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
}

function rightNavButtonClick(e) {
	closeWindow();
};

function clearButtonClick(e) {
	var returnValue = {
		displayNameList: [],
		valueList: [],
		singleStringValue: ""
	};

	args.closeCallBack(returnValue);
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function rowClicked(e) {
	if (e.row.hasCheck == true) {
		e.row.hasCheck = false;
	} else {
		e.row.hasCheck = true;
	}
}

$.window.open();
$.background.animate(animationFadeIn);
$.modalBackgorund.animate(animationOpen);