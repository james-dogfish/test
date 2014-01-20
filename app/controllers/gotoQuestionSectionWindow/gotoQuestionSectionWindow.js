var args = arguments[0] || {};

var closeing = false;
var sectionToGoToGroupType = "";
var questionToGoToIndex = 0;

var currentAssessmentObject = null;



var gotoDisplayViewWidth = "50%";
var leftPostionClosed = "-50%";

$.gotoDisplayView.width = gotoDisplayViewWidth;
$.gotoDisplayView.left = leftPostionClosed;

var animationDuration = 700;

var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0dp";
animationOpen.duration = animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = leftPostionClosed;
animationClose.duration = animationDuration;
var closeAnimationHandler = function() {
	closeing= false;
	$.win.close();
};
animationClose.addEventListener('complete',closeAnimationHandler);

function closeWindowCallBack(e){
	hide();
};

exports.show = function(message){
	$.win.open();
	$.background.animate(animationFadeIn);
	$.gotoDisplayView.animate(animationOpen);
};

var hide = function(){
	if(closeing == false){
		closeing= true;
		$.gotoDisplayView.animate(animationClose);
		$.background.animate(animationFadeOut);
	}
	
};

function firstUnansweredClick(e){
	$.trigger('goToFirstUnanswered');
	
};

function resumeLastPositionClick(e){
	$.trigger('goToLastPositiond');
};

function createCensusClick(e){
	$.trigger('createCensus');
};


var sectionClick = function(sectionDetails){
	sectionToGoToGroupType = sectionDetails.groupType;
	hide();
	
	//$.trigger('sectionClick', sectionDetails.groupType);
};
exports.setAssessmentObject = function(assessmentObject){
	currentAssessmentObject = assessmentObject;
};

exports.setContentsDetails = function(questionSectionContentsDetails){
	//sectionClick
	$.masterView.setContentsDetails(questionSectionContentsDetails);
	
	$.masterView.MoveToOpen(false);
	$.detailView.MoveToClose(false);
};

Ti.App.addEventListener("goToQuestionEvent", function(data){
	$.trigger('goToQuestion', {groupType : data.groupType, questionIndex : data.questionIndex});
	hide();
});

Ti.App.addEventListener("pageSelected", function(e){
	//alert("row Clicked, sectionList.length = "+e.sectionList.length);
	$.masterView.MoveToClose(true);
	$.detailView.MoveToOpen(true);
	$.detailView.setContentsDetails(e.pageName, e.sectionList);
	
});

Ti.App.addEventListener("deletePage", function(e){
	//alert("associatedFileName = "+ JSON.stringify(e.associatedFileName));
	$.trigger('deletePage', {associatedFileName : e.associatedFileName});
});

$.detailView.on("moveToMaster", function(){
	$.masterView.MoveToOpen(true);
	$.detailView.MoveToClose(true);
});
