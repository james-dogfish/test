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
			var colouredBox = Styles["goToMandatoryColouredBox_nonMandatory"];
			if(questionList[questionIndex].mandatory == true){
				if(questionList[questionIndex].firstValue == ""){
					colouredBox = Styles["goToMandatoryColouredBox_unanswered"];
				}
				else{
					colouredBox = Styles["goToMandatoryColouredBox_answered"];
				}
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
	
	var sectionHeaderColouredBox = Styles["goToMandatoryColouredBox_nonMandatory"];
	if(passedSectionDataObject.mandatoryQuestions == true){
		sectionHeaderColouredBox = Styles["goToMandatoryColouredBox_answered"];
		if(passedSectionDataObject.unAnsweredMandatoryQuestions == true){
			sectionHeaderColouredBox = Styles["goToMandatoryColouredBox_unanswered"];
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