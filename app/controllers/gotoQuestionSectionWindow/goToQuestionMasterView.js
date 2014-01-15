var pageList = [];



var addSectionToPageList= function(section){
	
	for(var pageIndex = 0; pageIndex < pageList.length; pageIndex++){
		if(pageList[pageIndex].name == section.pageName){
			pageList[pageIndex].sectionList.push(section);
			return;
		}
	}
	
	var newPage = {
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