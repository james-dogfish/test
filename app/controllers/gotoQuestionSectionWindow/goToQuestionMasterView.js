var pageList = [];

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "-100%";
animationClose.duration = Alloy.Globals.animationDuration;



var addSectionToPageList= function(section){

	for(var pageIndex = 0; pageIndex < pageList.length; pageIndex++){
		if(pageList[pageIndex].name == section.pageName){     
            
            if(section.allMandatoryQuestionsAnswered == false){
            	pageList[pageIndex].allMandatoryQuestionsAnswered = false;
            }
            if(section.allQuestionsAnswered == false){
            	pageList[pageIndex].allQuestionsAnswered = false;
            }
			if(section.mandatoryQuestions == true){
				pageList[pageIndex].mandatoryQuestions = true;
			}
			
			if(section.error == true){
				pageList[pageIndex].error = true;
			}
			
			pageList[pageIndex].sectionList.push(section);
			return;
		}
	}
	
	var newPage = {
		template : "masterRowTemplate",
		name : section.pageName,
		title : {text : section.pageName}, 
		sectionList : [],
		colouredBox : Alloy.Globals.Styles["goToMandatoryColouredBox_nonMandatory"],
		
		mandatoryQuestions : false,
        allQuestionsAnswered : true,  
        allMandatoryQuestionsAnswered : true,
        coreQuestionType : false,
        error : false,
        
		pageType : section.pageType,
		associatedFileName : section.associatedFileName
	};
	
	if(section.error == true){
		newPage.error = true;
	}
	
	if(section.allMandatoryQuestionsAnswered == false){
            	newPage.allMandatoryQuestionsAnswered = false;
            }
            if(section.allQuestionsAnswered == false){
            	newPage.allQuestionsAnswered = false;
            }
			if(section.mandatoryQuestions == true){
				newPage.mandatoryQuestions = true;
			}
	
	if(section.pageType == "riskAssessment"){
		newPage.template = "masterRowTemplate";
	}
	else if(section.pageType == "census"){
		Alloy.Globals.Logger.log("census pageID = "+section.pageID, "info");
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
		coreQuestionType = true;
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
	
	for(var pageIndex = 0; pageIndex < pageList.length; pageIndex++){	
		
		if(pageList[pageIndex].coreQuestionType == true){
			pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToMandatoryColouredBox_n_a"];
		}
		else if(pageList[pageIndex].mandatoryQuestions == true){
			if(pageList[pageIndex].allMandatoryQuestionsAnswered == true){
				pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
			}
			else{
				pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_mandatory"];
			}
		}
		else if(pageList[pageIndex].allQuestionsAnswered == true){
			pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
		}
		else{
			pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_non_mandatory"];
		}
		
		if(pageList[pageIndex].error == true){
			pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_mandatory"];
		}
		
		if(pageList[pageIndex].pageType ==='coreQuestion'){
			pageList[pageIndex].colouredBox = Alloy.Globals.Styles["goToMandatoryColouredBox_n_a"];
		}
	}
	
	
	var assessmentObject= Alloy.Globals.questionRenderer.getCurrentAssessmentObject();
	if(assessmentObject.censusDesktopComplete === true){
		pageList.push({
			template : "masterCensusDesktopCompleteTemplate",
			title : {text : L('censusDesktopComplete')}, 
			colouredBox : {}
		});
	}
	
	
	$.section.setItems(pageList);
};

var addCensusDesktopCompleteRow = function(){
	pageList.push({
		template : "masterCensusDesktopCompleteTemplate",
		colouredBox : {}
	});
	$.section.setItems(pageList);
};
exports.addCensusDesktopCompleteRow = addCensusDesktopCompleteRow;

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


