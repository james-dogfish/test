var args = arguments[0] || {};

if(args.notes != ""){
	$.textArea.value = args.notes;
	$.hintText.hide();
}

$.hintText.text = "Enter Notes : ";

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
	args.closeCallBack($.textArea.value);
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	closeWindow();
}

function rightNavButtonClick(e){
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
$.background.animate(animationFadeIn);
$.modalBackgorund.animate(animationOpen);
//$.modalBackgorund.open({transition:Ti.UI.iPhone.AnimationStyle.SLIDE_TO_LEFT});
