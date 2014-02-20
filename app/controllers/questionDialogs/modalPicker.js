var args = arguments[0] || {};



var currentValue = args.valueList[0];

	
var data = [];
for(var i=0;i<args.valueList.length;i++){
	data.push(Ti.UI.createPickerRow({title: args.valueList[i].displayValue, value : args.valueList[i].value }
	));
}

$.pickerView.add(data);
$.pickerView.selectionIndicator = true;
$.pickerView.setSelectedRow(0, 0, true);

if(args.currentValue != "" || typeof args.currentValue === "undefined"){
	for(var i=0;i<args.valueList.length;i++){
		if(args.valueList[i].value == args.currentValue){
			$.pickerView.setSelectedRow(0, i, true);
			currentValue = args.valueList[i];
			break;
		}
	}
}




var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = Alloy.Globals.animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = Alloy.Globals.animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "25%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-50%";
animationClose.duration = Alloy.Globals.animationDuration;
animationClose.addEventListener("complete", function(e){
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
});

var closeWindow = function(){
	args.closeCallBack(currentValue);
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	if(args.closeWithNoValueCallBack) {
		args.closeWithNoValueCallBack();	
	}
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
}

function rightNavButtonClick(e){
	closeWindow();
};

function clearButtonClick(e){
	args.closeCallBack({title: "", value : ""});
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function pickerChange(e){
	currentValue = {
		displayValue : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).value
	};
}

var modalBackgorundWidth = $.modalBackgorund.width;
$.modalBackgorund.left = -1*modalBackgorundWidth;

//$.window.animate({view: $.modalBackgorund,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
//{transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT}
$.window.open();
$.background.animate(animationFadeIn);
$.modalBackgorund.animate(animationOpen);
//$.modalBackgorund.open({transition:Ti.UI.iPhone.AnimationStyle.SLIDE_TO_LEFT});
