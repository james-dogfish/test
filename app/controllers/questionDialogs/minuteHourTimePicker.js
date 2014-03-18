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
	
	if(typeof args.duration !== "undefined"){
		duration = args.duration;
	}

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

var closeWindow = function(){
	var stringValue = ""+currentValue.h+":"+currentValue.m;
	args.closeCallBack({
		displayValue : stringValue,
		value : parseInt(currentValue.h)*60 + parseInt(currentValue.m)
	});
	Alloy.Globals.Logger.log("minuteHourTimeTemplate minutes = "+parseInt(currentValue.h)*60 + parseInt(currentValue.m),"info");
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	args.closeWithNoValueCallBack();
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
}

function rightNavButtonClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;

	closeWindow();
};

function clearButtonClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	args.closeCallBack({title: "", value : ""});
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
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

$.window.open();
