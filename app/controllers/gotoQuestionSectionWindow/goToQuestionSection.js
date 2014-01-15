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
			questionRowList.push({
				template : "questionRow", 
				groupType : groupType,
				questionTitle : {text : questionList[questionIndex].title}, 
				questionIndex : questionList[questionIndex].questionIndex
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
	
	groupType = sectionDataObject.groupType;
	
	headerRow = {template : "headerRow", headerTitle : {text : sectionDataObject.title}, groupType : sectionDataObject.groupType};
	$.section.setItems([headerRow]);
};

Ti.App.addEventListener("goToHeaderClicked", function(data){
	if(data.groupType != groupType)return;
	
	toggleQuestionVisable();
});