var args = arguments[0] || {};

var currentValue = {m : "00", h : "00"};

	var duration =
	{
		hoursLowBound : 0,
		hoursHighBound : 12,
		hoursIncrement : 1,
		
		minutesLowBound : 0,
		minutesHighBound : 60,
		minutesIncrement : 15,
	};



for(var hours =duration.hoursLowBound;hours<=duration.hoursHighBound;hours+= duration.hoursIncrement){
	$.hoursColumn.addRow(Ti.UI.createPickerRow(
		{
			title:  (hours < 10 )? '0'+hours : ""+hours, 
			value : (hours < 10 )? '0'+hours : ""+hours
		}
	));
}

for(var minutes =duration.minutesLowBound;minutes<=duration.minutesHighBound;minutes+= duration.minutesIncrement){
	$.minutesColumn.addRow(Ti.UI.createPickerRow(
		{
			title:  (minutes < 10 )? '0'+minutes : ""+minutes, 
			value : (minutes < 10 )? '0'+minutes : ""+minutes
		}
	));
}


$.pickerView.selectionIndicator = true;
$.pickerView.setSelectedRow(0, 0, true);
$.pickerView.setSelectedRow(1, 0, true);


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
	var stringValue = ""+currentValue.h+":"+currentValue.m;
	args.closeCallBack({
		displayValue : stringValue,
		value : parseInt(currentValue.h)*60 + parseInt(currentValue.m)
	});
	Alloy.Globals.Logger.log("minuteHourTimeTemplate minutes = "+parseInt(currentValue.h)*60 + parseInt(currentValue.m),"info");
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	args.closeWithNoValueCallBack();
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
	
	if(e.columnIndex == 0){
		currentValue.h = e.row.value;
	}
	else{
		currentValue.m = e.row.value;
	}
}

var modalBackgorundWidth = $.modalBackgorund.width;
$.modalBackgorund.left = -1*modalBackgorundWidth;

//$.window.animate({view: $.modalBackgorund,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
//{transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT}
$.window.open();
$.background.animate(animationFadeIn);
$.modalBackgorund.animate(animationOpen);
//$.modalBackgorund.open({transition:Ti.UI.iPhone.AnimationStyle.SLIDE_TO_LEFT});
