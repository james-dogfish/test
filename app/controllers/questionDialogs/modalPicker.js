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

var animationDuration = 700;

var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "25%";
animationOpen.duration = animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-50%";
animationClose.duration = animationDuration;
animationClose.addEventListener("complete", function(e){
	$.window.close();
});

var closeWindow = function(){
	args.closeCallBack(currentValue);
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	closeWindow();
}

function rightNavButtonClick(e){
	closeWindow();
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
