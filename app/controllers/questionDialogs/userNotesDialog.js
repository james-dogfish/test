var args = arguments[0] || {};

if(args.notes != ""){
	$.textArea.value = args.notes;
	$.hintText.hide();
}

if(args.title == ""  || typeof args.title === "undefined"){
	$.appTitle.text = "Notes";
}
else{
	$.appTitle.text = args.title;
}
$.hintText.text = "Enter Notes : ";

var closeWindow = function(){
	
	args.closeCallBack($.textArea.value);
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	closeWindow();
}

function rightNavButtonClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	closeWindow();
};

function onFirstTimeSelect(e){
	$.hintText.hide();
};

var modalBackgorundWidth = $.modalBackgorund.width;
$.modalBackgorund.left = -1*modalBackgorundWidth;

$.window.open();
