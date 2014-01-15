var pageList = [];

var gotoDisplayViewWidth = Alloy.Measurement.dpToPX(200);

$.container.width = gotoDisplayViewWidth;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0dp";
animationOpen.duration = 700;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = -gotoDisplayViewWidth;
animationClose.duration = 700;



var addSectionToPageList= function(section){
	
	for(var pageIndex = 0; pageIndex < pageList.length; pageIndex++){
		if(pageList[pageIndex].name == section.pageName){
			pageList[pageIndex].sectionList.push(section);
			return;
		}
	}
	
	var newPage = {
		name : section.pageName,
		title : {text : section.pageName}, 
		sectionList : [],  
		pageType : section.pageType
	};
	
	if(section.pageType == "riskAssessment"){
		newPage.template = "riskAssessmentPageRowTemplate";
	}
	else if(section.pageType == "census"){
		newPage.template = "riskAssessmentPageRowTemplate";
	}
	else if(section.pageType == "trainInfo"){
		newPage.template = "riskAssessmentPageRowTemplate";
	}
	
	newPage.sectionList.push(section);
	pageList.push(newPage);
	return;
};

exports.setContentsDetails = function(questionSectionContentsDetails){
	//sectionClick
	var sectionList = questionSectionContentsDetails;
	
	pageList = [];
	
	for(var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++){	
		addSectionToPageList(sectionList[sectionListIndex]);
	}
	$.section.setItems(pageList);
};

exports.MoveToOpen = function(isAnimated){
	if(isAnimated == true){
		$.container.animate(animationOpen);
	}
	else{
		$.container.left = "0%";
	}
};

exports.MoveToClose = function(isAnimated){
	if(isAnimated == true){
		$.container.animate(animationClose);
	}
	else{
		$.container.left = -gotoDisplayViewWidth;
	}
};


