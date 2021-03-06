var args = arguments[0] || {};

var closeing = false;
var sectionToGoToGroupType = "";
var questionToGoToIndex = 0;

var currentAssessmentObject = null;

var closeCallBack = null;

var gotoDisplayViewWidth = "50%";
var leftPostionClosed = "-50%";

$.gotoDisplayView.width = gotoDisplayViewWidth;
$.gotoDisplayView.left = leftPostionClosed;



var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = Alloy.Globals.animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = Alloy.Globals.animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0dp";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = leftPostionClosed;
animationClose.duration = Alloy.Globals.animationDuration;
var closeAnimationHandler = function() {
	closeing= false;
	$.win.close();
	animationClose.removeEventListener('complete',closeAnimationHandler);
	Ti.App.removeEventListener("goToQuestionEvent", goToQuestionCallBack);
	Ti.App.removeEventListener("pageSelected", pageSelectedCallBack);
	
	if(closeCallBack != null){
		closeCallBack();
		closeCallBack = null;
	}
	
	
	$.destroy();
};
animationClose.addEventListener('complete',closeAnimationHandler);

function closeWindowCallBack(e){
	hide();
};

exports.show = function(message){
	$.win.open();
	//$.background.animate(animationFadeIn);
	$.gotoDisplayView.animate(animationOpen);
};

var hide = function(){
	if(closeing == false){
		closeing= true;
		$.gotoDisplayView.animate(animationClose);
		//$.background.animate(animationFadeOut);
		//$.selectCensusView.hide();
		//$.addCensusView.hide();
	}
	
};
exports.hide = hide;

function firstUnansweredClick(e){
	hide();
	Ti.App.fireEvent("goToFirstUnanswered", {});
};

function resumeLastPositionClick(e){
	hide();
	Ti.App.fireEvent("goToLastPositiond", {});
};

function createCensusClick(e){
	$.selectCensusView.show();
};



$.selectCensusView.on("createCensus", function(){
	Alloy.Globals.Logger.log("selectCensusView : createCensus", "info");
	//Ti.App.fireEvent("createCensus", {});
	
	Alloy.Globals.questionRendererTab.createCensus();
	
	$.selectCensusView.hide();
});
$.selectCensusView.on("addCensus", function(){
	$.addCensusView.show(currentAssessmentObject);
});
$.selectCensusView.on("censusDesktopComplete", function(){
	
	if(currentAssessmentObject == null) return;
	if(currentAssessmentObject.censusDesktopComplete == true) return;
	
	
	var alertYesNo = Titanium.UI.createAlertDialog({
        message: L('censusDesktopComplete_alertYesNo'),
        buttonNames: ['Yes', 'No']
    });

    alertYesNo.addEventListener('click', function(e) {
        if (e.index == 0) {
			$.masterView.addCensusDesktopCompleteRow();
			currentAssessmentObject.censusDesktopComplete = true;
			$.selectCensusView.hide();
			Ti.App.fireEvent("censusDesktopComplete", {});
        } 
        else if (e.index == 1) {
			$.selectCensusView.hide();
        }
    });
    
    alertYesNo.show();
});
$.addCensusView.on("addPastCensus", function(e){
	Ti.App.fireEvent("addPastCensus", e);
	$.selectCensusView.hide();
	$.addCensusView.hide();
});

var sectionClick = function(sectionDetails){
	sectionToGoToGroupType = sectionDetails.groupType;
	hide();
};
exports.setAssessmentObject = function(assessmentObject){
	currentAssessmentObject = assessmentObject;
};

exports.setContentsDetails = function(questionSectionContentsDetails){
	try{
	$.masterView.setContentsDetails(questionSectionContentsDetails);
	$.masterView.MoveToOpen(false);
	$.detailView.MoveToClose(false);
	}catch(e){
		Alloy.Globals.Logger.logException(e);
		Alloy.Globals.aIndicator.hide();
	}
};

exports.setCloseCallBack= function(NewCloseCallBack){
	closeCallBack = NewCloseCallBack;
};


var goToQuestionCallBack = function(data){
	Ti.App.fireEvent('goToQuestion', {groupType : data.groupType, questionIndex : data.questionIndex});
	hide();
};
Ti.App.addEventListener("goToQuestionEvent", goToQuestionCallBack);

var pageSelectedCallBack = function(e){
	$.masterView.MoveToClose(true);
	$.detailView.MoveToOpen(true);
	$.detailView.setContentsDetails(e.pageName, e.sectionList);
	
};
Ti.App.addEventListener("pageSelected", pageSelectedCallBack);


$.detailView.on("moveToMaster", function(){
	$.masterView.MoveToOpen(true);
	$.detailView.MoveToClose(true);
});

// IOS 7 styling
if(Alloy.Globals.Util.isIOS7Plus()) {
	$.gotoDisplayView.top = "65";
} else {
	$.gotoDisplayView.top = "45";
}
