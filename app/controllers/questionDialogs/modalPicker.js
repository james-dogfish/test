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

/*var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = Alloy.Globals.animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = Alloy.Globals.animationDuration;*/

/*var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "25%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-50%";
animationClose.duration = Alloy.Globals.animationDuration;
animationClose.addEventListener("complete", function(e) {
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
});*/

var closeWindow = function() {
	//Ti.API.info("currentValue = "+JSON.stringify(currentValue));
	args.closeCallBack(currentValue);
//	$.modalBackgorund.animate(animationClose);
//	$.background.animate(animationFadeOut);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e) {
	if (args.closeWithNoValueCallBack) {
		args.closeWithNoValueCallBack();
	}
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
//	$.modalBackgorund.animate(animationClose);
//	$.background.animate(animationFadeOut);
}

function rightNavButtonClick(e) {
	closeWindow();
};

function clearButtonClick(e) {
	args.closeCallBack({
		title: "",
		value: ""
	});
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
	//$.modalBackgorund.animate(animationClose);
	//$.background.animate(animationFadeOut);
};

/*
function pickerChange(e) {
	currentValue = {
		displayValue: $.pickerView.getSelectedRow(null).title,
		value: $.pickerView.getSelectedRow(null).value
	};
}
*/


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

//var modalBackgorundWidth = $.modalBackgorund.width;
//$.modalBackgorund.left = -1 * modalBackgorundWidth;

//$.window.animate({view: $.modalBackgorund,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
//{transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT}
$.window.open();
//$.background.animate(animationFadeIn);
//$.modalBackgorund.animate(animationOpen);
//$.modalBackgorund.open({transition:Ti.UI.iPhone.AnimationStyle.SLIDE_TO_LEFT});