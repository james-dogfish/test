var args = arguments[0] || {};

var date = new Date();

//var Alloy.Globals.moment = require('alloy/Alloy.Globals.moment');



/*var animationFadeIn = Titanium.UI.createAnimation();
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
});*/

var dateToString = function(date){
    var day = date.getDate();
    day = (day < 10 )? '0'+day : day;
    
    var month = date.getMonth()+1;
    month = (month < 10 )? '0'+month : month;
    
    var year = date.getFullYear();
   // alert(year + "-" + month + "-" + day);
    return year + "-" + month + "-" + day;
   // return Alloy.Globals.Util.convertDate(date).dateformat2;
};


if(typeof args.timeLimit !== "undefined"){
	if(args.timeLimit == true){
		
		$.datePicker.setMinDate(Alloy.Globals.moment().subtract('days', 30).toDate());
		$.datePicker.setMaxDate(new Date());
	}
}

var closeWindow = function(){
	args.closeCallBack(dateToString(date));
	//$.modalBackgorund.animate(animationClose);
	//$.background.animate(animationFadeOut);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	args.closeWithNoValueCallBack();
	//$.modalBackgorund.animate(animationClose);
	//$.background.animate(animationFadeOut);
	
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
	
	args.closeCallBack("");
	//$.modalBackgorund.animate(animationClose);
	//$.background.animate(animationFadeOut);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};


function pickerChange(e){
	date = e.value;
}

$.window.open();
  		
//$.background.animate(animationFadeIn);
//$.modalBackgorund.animate(animationOpen);