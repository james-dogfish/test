var args = arguments[0] || {};

var closeing = false;
var sectionToGoToGroupType = "";
var questionToGoToIndex = 0;

var currentAssessmentObject = null;

var gotoDisplayViewWidth = Alloy.Measurement.dpToPX(400);
$.gotoDisplayView.width = gotoDisplayViewWidth;
$.gotoDisplayView.left = -gotoDisplayViewWidth;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0dp";
animationOpen.duration = 700;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = -gotoDisplayViewWidth;
animationClose.duration = 700;
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
	$.gotoDisplayView.animate(animationOpen);
};

var hide = function(){
	if(closeing == false){
		closeing= true;
		$.gotoDisplayView.animate(animationClose);
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
	$.masterView.on();
	/*
	var sectionList = questionSectionContentsDetails;
	var ListViewSectionList = [];
	
	for(var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++){
		var newListViewSection = Alloy.createController('gotoQuestionSectionWindow/goToQuestionSection');
		newListViewSection.setdata(sectionList[sectionListIndex]);
		ListViewSectionList.push(newListViewSection.getView());
	}
	$.listView.setSections(ListViewSectionList);
	*/
};

Ti.App.addEventListener("goToQuestionEvent", function(data){
	$.trigger('goToQuestion', {groupType : data.groupType, questionIndex : data.questionIndex});
	hide();
});

Ti.App.addEventListener("pageSelected", function(data){
	alert("row Clicked, sectionList.length = "+e.sectionList.length);
});
