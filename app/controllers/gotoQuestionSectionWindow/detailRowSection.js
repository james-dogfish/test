var areQuestionsvisible = false;

var questionRowList = [];
var headerRow = null;
var sectionDataObject = null;
var groupType = null;

function showQuestions(){
	if(questionRowList.length == 0){
		
		questionRowList.push(headerRow);
		
		var questionList = sectionDataObject.questionList;
		for(var questionIndex =0; questionIndex< questionList.length; questionIndex++){
			
			//mandatory firstValue
			var colouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];

			if(questionList[questionIndex].mandatory == true){
				if(questionList[questionIndex].firstValue == ""){
					colouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_mandatory"];
				}
				else{
					colouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
				}
			} else {
				if(questionList[questionIndex].firstValue == "") {
					colouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_non_mandatory"];
				}
				else{
					colouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
				}
			}

			if(sectionDataObject.pageType==='coreQuestion') {
				colouredBox = Alloy.Globals.Styles["goToMandatoryColouredBox_n_a"];
			}
			
			questionRowList.push({
				template : "detailRowQuestionTemplate", 
				groupType : groupType,
				questionTitle : {text : questionList[questionIndex].title}, 
				questionIndex : questionList[questionIndex].questionIndex,
				colouredBox : colouredBox
			});
		}
	}
	$.section.setItems(questionRowList);
};

function hideQuestions(){
	$.section.setItems([headerRow]);
};


var toggleQuestionVisable = function(e){
	if(areQuestionsvisible == false){
		areQuestionsvisible = true;
		showQuestions();
	}
	else{
		areQuestionsvisible = false;
		hideQuestions();
	}
};

exports.setdata = function(passedSectionDataObject){
	sectionDataObject = passedSectionDataObject;

	var sectionHeaderColouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
	if (passedSectionDataObject.pageType === 'coreQuestion') {
		sectionHeaderColouredBox = Alloy.Globals.Styles["goToMandatoryColouredBox_n_a"];
	} else {
		if (passedSectionDataObject.mandatoryQuestions == true) {
			sectionHeaderColouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
			if (passedSectionDataObject.allMandatoryQuestionsAnswered == false) {
				sectionHeaderColouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_mandatory"];
			}
		} else {
			sectionHeaderColouredBox = Alloy.Globals.Styles["goToColouredBox_answered"];
			if (passedSectionDataObject.allQuestionsAnswered == false) {
				sectionHeaderColouredBox = Alloy.Globals.Styles["goToColouredBox_unanswered_non_mandatory"];
			}
		}
	}

	
	groupType = sectionDataObject.groupType;
	
	headerRow = {template : "detailRowHeaderTemplate", headerTitle : {
		text : sectionDataObject.title}, 
		groupType : sectionDataObject.groupType,
		colouredBox : sectionHeaderColouredBox
	};
	$.section.setItems([headerRow]);
};

Ti.App.addEventListener("goToHeaderClicked", function(data){
	if(data.groupType != groupType)return;
	
	toggleQuestionVisable();
});