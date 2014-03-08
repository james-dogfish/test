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

var closeWindow = function(){
	
	args.closeCallBack($.textArea.value);
	//$.modalBackgorund.animate(animationClose);
	//$.background.animate(animationFadeOut);
	
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

//$.window.animate({view: $.modalBackgorund,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
//{transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT}
$.window.open();
//$.background.animate(animationFadeIn);
//$.modalBackgorund.animate(animationOpen);
//$.modalBackgorund.open({transition:Ti.UI.iPhone.AnimationStyle.SLIDE_TO_LEFT});
