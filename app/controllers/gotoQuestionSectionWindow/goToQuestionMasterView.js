var pageList = [];

//var gotoDisplayViewWidth = Alloy.Measurement.dpToPX(400);

//$.container.width = gotoDisplayViewWidth;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "-100%";
animationClose.duration = Alloy.Globals.animationDuration;



var addSectionToPageList= function(section){

	for(var pageIndex = 0; pageIndex < pageList.length; pageIndex++){
		if(pageList[pageIndex].name == section.pageName){     
            
			if(section.mandatoryQuestions == true){
				pageList[pageIndex].mandatoryQuestions = true;
				pageList[pageIndex].colouredBox = Styles["goToMandatoryColouredBox_answered"];
				if(section.unAnsweredMandatoryQuestions == true){
					pageList[pageIndex].colouredBox = Styles["goToMandatoryColouredBox_unanswered"];
					pageList[pageIndex].unAnsweredMandatoryQuestions = true;
				}
			}
			pageList[pageIndex].sectionList.push(section);
			return;
		}
	}
	
	var newPage = {
		name : section.pageName,
		title : {text : section.pageName}, 
		sectionList : [],
		colouredBox : Styles["goToMandatoryColouredBox_nonMandatory"],
		mandatoryQuestions : false,
        unAnsweredMandatoryQuestions : false,  
		pageType : section.pageType,
		associatedFileName : section.associatedFileName
	};
	
	if(section.mandatoryQuestions == true){
		newPage.mandatoryQuestions = true;
		newPage.colouredBox = Styles["goToMandatoryColouredBox_answered"];
		if(section.unAnsweredMandatoryQuestions == true){
			newPage.colouredBox = Styles["goToMandatoryColouredBox_unanswered"];
			newPage.unAnsweredMandatoryQuestions = true;
		}
	}
	
	if(section.pageType == "riskAssessment"){
		newPage.template = "masterRowTemplate";
	}
	else if(section.pageType == "census"){
		Ti.API.info("census pageID = "+section.pageID);
		if(section.pageID == "1" || section.pageID == 1){
			newPage.template = "masterRowTemplate";
		}
		else{
			newPage.template = "masterCensusRowTemplate";
		}
	}
	else if(section.pageType == "trainInfo"){
		newPage.template = "masterRowTemplate";
	}
	else if(section.pageType == "coreQuestion"){
		newPage.template = "masterRowTemplate";
		newPage.colouredBox = Styles["goToMandatoryColouredBox_n_a"];
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
		$.container.left = "-100%";
	}
};


