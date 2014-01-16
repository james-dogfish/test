var Validator = require('validator/Validator');
var localDataHandler = require('localDataHandler/localDataHandler');

var User = require('core/User');
var userPreferences = User.getPreferences();

var hiddenQuestions = [];
var allSections = [];
var currentAssessmentObject = null;

//questionSelected is used for the move to lastQuestion
//when a question is selected this value is updated
var questionSelected = {name : "",  groupType : ""};

/*
var createNavigationSection = function(){
	var navSection = Titanium.UI.createListSection();
	navSection.setItems([{template : "questionSectionNavigation", backButton : {visible : true}, nextButton : {visible : true}}]);
	return navSection;
};


var setNavigationButtons = function(isBackButtonVisible, isNextButtonVisible){
	var sectionNavigation = navigationSection.getItems()[0];
	sectionNavigation.backButton.visible = isBackButtonVisible;
	sectionNavigation.nextButton.visible = isNextButtonVisible;
	navigationSection.updateItemAt(0, sectionNavigation);
	
	$.backButton.visible =  isBackButtonVisible;
	$.nextButton.visible =  isNextButtonVisible;
};
*/
//var navigationSection = createNavigationSection();

var ALL_SECTIONS =1;
var SINGLE_SECTIONS = 2;

var currentSingleSectionIndex = 0;

var listViewDisplayType = ALL_SECTIONS;

var debugAddQuestionDependency = function(sectionList, parentQuestionName, dependentQuestionName){
	var parentQuestionRef = debugFindQuestions(sectionList, parentQuestionName);
	
	
	if(typeof parentQuestionRef === "undefined"){
		alert("parentQuestion undefined name  = "+parentQuestionName);
		return;
	}
	var parentQuestionDependencyList = parentQuestionRef.question.debugQuestionDependencyList;
	
	for(var i =0; i < parentQuestionDependencyList.length; i++){
		if(parentQuestionDependencyList[i] == dependentQuestionName){
			return;
		}
	}
	parentQuestionDependencyList.push(dependentQuestionName);
	parentQuestionRef.question.debugTitleView = {backgroundColor : "#A1F7B6"};
	parentQuestionRef.section.updateItemAt(parentQuestionRef.questionIndex, parentQuestionRef.question);
	
};

function debugLookUpDependentQuestions(sectionList){
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var itemIndex =0; itemIndex < sectionList[sectionIndex].getItems().length; itemIndex++){
			var itemsList = sectionList[sectionIndex].getItems();
				
			for(var renderIndex =0; renderIndex < itemsList[itemIndex].renderValue.length; renderIndex++){
				debugAddQuestionDependency(sectionList, itemsList[itemIndex].renderValue[renderIndex].name , itemsList[itemIndex].name);
			}
		}
	}
};

var debugFindQuestions= function(sectionList, questionName){
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var itemIndex =0; itemIndex < sectionList[sectionIndex].getItems().length; itemIndex++){
			var itemsList = sectionList[sectionIndex].getItems();
			if(itemsList[itemIndex].name ==questionName){
				return {questionIndex : itemIndex, question : itemsList[itemIndex], section : sectionList[sectionIndex]};
			}
		}
	}
	alert("not found " +questionName);
	return {};
};


//simple test to cheak if the question is effected by the question change
var testIfQuesionIsVisable = function(question, changedQuestionName, changedQuestionValueList){
	if(question.renderValue.length == 0)return true;

	//if true, do a complete check on its render condtions
	var reevaluate = false;
	
	for(var renderValueIndex=0; renderValueIndex < question.renderValue.length; renderValueIndex++){
		//alert("value : "+question.renderValue[i].value );

		if(question.renderValue[renderValueIndex].name == changedQuestionName){
			reevaluate = true;
			break;
		}
	

	}
	
	if(reevaluate == false){
		return question.visable;
	}
	else{
		return reevaluateQuestionIfQuestionIsVisable(question);
	}
};

//a compelete check if the question satisfies its render condtions
var reevaluateQuestionIfQuestionIsVisable = function(question){

	var searchedName = "";
	var searchedValue = "";
	
	for(var i=0; i < question.renderValue.length; i++){
		
		if(question.renderValue[i].name != searchedName){
			searchedName = question.renderValue[i].name;
			searchedValue = findQuestionsValue(question.renderValue[i].name);
		}		

		for(var valueIndex =0; valueIndex < searchedValue.length; valueIndex++){
			if(question.renderValue[i].value == searchedValue[valueIndex]){
				return true;
			}
		}
	}
	
	return false;
};

var findQuestion = function(questionName){
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var questionIndex =0; questionIndex < sectionList[sectionIndex].getItems().length; questionIndex++){
			var questionList = sectionList[sectionIndex].getItems();
				
			if(questionList[questionIndex].name ==questionName){
				//return questionList[questionIndex].value;
				return {question : questionList[questionIndex], questionIndex : questionIndex, section : sectionList[sectionIndex]};
			}
		}
	}
	return null;
};

var findQuestionsValue = function(questionName){
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var questionIndex =0; questionIndex < sectionList[sectionIndex].getItems().length; questionIndex++){
			var questionList = sectionList[sectionIndex].getItems();
				
			if(questionList[questionIndex].name ==questionName){
				return questionList[questionIndex].value;
			}
		}
	}
	return [""];
};

var removeQuestionFromListSection = function(section, question, questionIndex){
	question.visable = false;
	hiddenQuestions.push(question);
	
	var listViewAnimationProperties = {
		animated : true, 
		animationStyle : Titanium.UI.iPhone.RowAnimationStyle.RIGHT, 
		position : Titanium.UI.iPhone.ListViewScrollPosition.NONE
	};
	section.deleteItemsAt(questionIndex, 1, listViewAnimationProperties);
	
	updateSection(section);
	
	questionValueChange({
		item : question,
		name : question.name,
		value : [""],
		responseObject : null
	});
	/*
	Ti.App.fireEvent("questionValueChange", {
		item : question,
		name : question.name,
		value : [""]
	}); 
	*/
	
	return (questionIndex - 1);
};

function updateSection(section){
	var questionList = section.getItems();
	section.setItems(questionList);
}

var addItemFromHiddenList = function(hiddenListItemIndex){
	var question = hiddenQuestions[hiddenListItemIndex];
	question.visable = true;
	var order = question.order;
	
	var section = null;
	
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		if(sectionList[sectionIndex].groupType == question.groupType){
			section = sectionList[sectionIndex];
		}
	}
	
	if(section == null){
		//alert("no section found to add to");

		question.visable = false;
		return  hiddenListItemIndex;
	}
	
	var listViewAnimationProperties = {
		animated : true, 
		animationStyle : Titanium.UI.iPhone.RowAnimationStyle.LEFT , 
		position : Titanium.UI.iPhone.ListViewScrollPosition.NONE
	};
	
	var sectionItemList = section.getItems();
	for(var i=0; i < sectionItemList.length; i++){
		if(question.order < sectionItemList[i].order){
			section.insertItemsAt(i, [question], listViewAnimationProperties);
			break;
		}
		else if(i == (sectionItemList.length -1)){
			section.insertItemsAt(i, [question], listViewAnimationProperties);
			
			
			break;
		}
	}
	updateSection(section);
	hiddenQuestions.splice(hiddenListItemIndex, 1);
	
	questionValueChange({
		item : question,
		name : question.name,
		itemIndex : 0,
		groupType : null,
		value : [question.value],
		responseObject : null
	});
	
	/*
	Ti.App.fireEvent("questionValueChange", {
		item : question,
		name : question.name,
		itemIndex : 0,
		groupType : null,
		value : [question.value]
	}); 
	*/
	
	return (hiddenListItemIndex - 1);
};

exports.clear = function(){
	allSections = [];
	$.listView.setSections(allSections);
};

var buildQuestionSections = function(JASON_sectionList){
	var newSectionList = [];
	for(var i= 0 ; i <JASON_sectionList.length; i++){
		var newQuestionsSection = Titanium.UI.createListSection();
		
		newQuestionsSection.headerTitle = JASON_sectionList[i].title;
		newQuestionsSection.title = JASON_sectionList[i].title;
		newQuestionsSection.groupType = JASON_sectionList[i].groupType;
		newQuestionsSection.pageName = JASON_sectionList[i].pageName;
		newQuestionsSection.pageType = JASON_sectionList[i].pageType;
		newQuestionsSection.setItems(JASON_sectionList[i].questionList);
		newSectionList.push(newQuestionsSection);
	}
	return newSectionList;
};

exports.setAssessment = function(JASON_sectionList, assessmentObject){
	currentAssessmentObject = assessmentObject;
	
	sectionList = buildQuestionSections(JASON_sectionList);
	
	if(Alloy.Globals.isDebugOn == true){
		//debugLookUpDependentQuestions(sectionList);
	}
	
	allSections = sectionList;
	try{
		removeAnyRenderOptionQuestion(sectionList);
	}catch(e){
		
	}
	//removeAnyRenderOptionQuestion(data);
	$.listView.setSections(sectionList);
	
	setListViewDisplayTypeToSingleSections(userPreferences.singleView);
	
	
	//setup questionSelected to be the first question
	if(sectionList.length > 0){
		questionSelected.groupType = sectionList[0].groupType;
		var questionList = sectionList[0].getItems();
		if(questionList > 0){
			questionSelected.name = questionList[0].name;
		}
	}
};

exports.appendSectionsToAssessment = function(JASON_sectionList){
	//allSections = sectionList;
	appendSectionList = buildQuestionSections(JASON_sectionList);
	
	removeAnyRenderOptionQuestion(appendSectionList);
	allSections = allSections.concat(appendSectionList);
	$.listView.setSections(allSections);	
};

exports.moveToQuestion = function(groupType, questionIndex){

	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){	

		if(sectionList[sectionIndex].groupType == groupType){
			
			if(listViewDisplayType == ALL_SECTIONS){
				$.listView.scrollToItem(sectionIndex, questionIndex);
			}
			else if(listViewDisplayType == SINGLE_SECTIONS){
				setSelectedSectionForSingleSections(sectionIndex);
				$.listView.scrollToItem(sectionIndex, questionIndex);
			}
			return;
		}
	}
};

var getQuestionIndexFromSection = function(questionName, section){
	
	var questionList = section.getItems();
	
	for(var questionIndex =0; questionIndex < questionList.length; questionIndex++){
		if(questionList[questionIndex].name == questionName){
			return questionIndex;
		}
	}
	return null;
};


var moveToQuestionByName = function(questionName, groupType){
	
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){	

		if(sectionList[sectionIndex].groupType == groupType){
			
			var questionIndex = getQuestionIndexFromSection(questionName, sectionList[sectionIndex]);
			if(questionIndex == null)return;
			
			else if(listViewDisplayType == ALL_SECTIONS){
				$.listView.scrollToItem(sectionIndex, questionIndex);
			}
			else if(listViewDisplayType == SINGLE_SECTIONS){
				setSelectedSectionForSingleSections(sectionIndex);
				$.listView.scrollToItem(sectionIndex, questionIndex);
			}
			return;
		}
	}
};

exports.goToFirstUnanswered = function(){
	//alert("goToFirstUnanswered");
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){	
		var questionList = sectionList[sectionIndex].getItems();
		for(var questionIndex =0; questionIndex < questionList.length; questionIndex++ ){
			if(questionList[questionIndex].value[0] == ""){
				
				alert("unanswered question name = "+questionList[questionIndex].name);
				
				if(listViewDisplayType == ALL_SECTIONS){
					$.listView.scrollToItem(sectionIndex, questionIndex);
				}
				else if(listViewDisplayType == SINGLE_SECTIONS){
					setSelectedSectionForSingleSections(sectionIndex);
					$.listView.scrollToItem(sectionIndex, questionIndex);
				}
				return;
			}
		}
	}

};

exports.goToLastPositiond = function(){
	//alert("goToLastPositiond, name : "+questionSelected.name+", groupType : "+questionSelected.groupType) ;
	moveToQuestionByName(questionSelected.name, questionSelected.groupType);
};

exports.getGoToContentsDetails = function(){
	var sectionContentsDetailsList = [];
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		var newSectionContents= {
			questionList : [], 
			title : sectionList[sectionIndex].groupType.substring(1),
			pageName :  sectionList[sectionIndex].pageName,
			pageType : sectionList[sectionIndex].pageType,
			sectionIndex : sectionIndex, 
			groupType : sectionList[sectionIndex].groupType
		};
		if(sectionList[sectionIndex].getItems().length != 0){
			sectionContentsDetailsList.push(newSectionContents);
		}
		
		var questionsList = sectionList[sectionIndex].getItems();
		for(var questionIndex =0; questionIndex < questionsList.length; questionIndex++){
			
			var newQuestionDetails = {
				title : questionsList[questionIndex].title.text, 
				questionIndex : questionIndex 
				};
			
			newSectionContents.questionList.push (newQuestionDetails);
		}
		
	}
	return sectionContentsDetailsList;
};

var questionValueChange = function(item, name, value){
	//alert("value = "+value);
};

var removeAnyRenderOptionQuestion = function(data){
	var sectionList = data;
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var itemIndex =0; itemIndex < sectionList[sectionIndex].getItems().length; itemIndex++){
			var itemsList = sectionList[sectionIndex].getItems();
				
			if(itemsList[itemIndex].renderValue.length != 0){
				//alert("itemsList.length "+itemsList.length);
				itemIndex = removeQuestionFromListSection(sectionList[sectionIndex],itemsList[itemIndex], itemIndex);

			}
		}
	}
};

var testIfQuestionsNeedToBeRemoved = function(data){
	var sectionList = getAllQuestionSections();
	
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		
		for(var questionIndex =0; questionIndex < sectionList[sectionIndex].getItems().length; questionIndex++){
			var questionList = sectionList[sectionIndex].getItems();
			
			if(testIfQuesionIsVisable(questionList[questionIndex], data.name, data.value) == false){ 
				//alert("itemsList.length "+itemsList.length);
				questionIndex = removeQuestionFromListSection(sectionList[sectionIndex],questionList[questionIndex], questionIndex);
			}
		}
	}
};

var getAllQuestionSections = function(){
	return allSections;
};

//takes a section from the allSections list and sets it to be the single visable section
var setSelectedSectionForSingleSections = function(sectionsIndex){
	currentSingleSectionIndex = sectionsIndex;
	var newSectionList = [];
	newSectionList[0] = allSections[sectionsIndex];
	//newSectionList[1] = navigationSection;
	
	/*
	var isBackButtonVisible = (sectionsIndex >0);
	var isNextButtonVisible = (sectionsIndex < (allSections.length - 1));
	setNavigationButtons(isBackButtonVisible , isNextButtonVisible);
	*/
	
	$.backButton.visible =  (sectionsIndex >0);
	$.nextButton.visible =  (sectionsIndex < (allSections.length - 1));
	
	
	
	$.listView.setSections(newSectionList);
};

//toogles the listViewDisplayType tp be SINGLE_SECTIONS or ALL_SECTIONS
var setListViewDisplayTypeToSingleSections= function(onSingleSection){
	
	if(onSingleSection == true){
		listViewDisplayType = SINGLE_SECTIONS;
		if(allSections.length == 0)return;
		
		currentSingleSectionIndex = 0;
		setSelectedSectionForSingleSections(currentSingleSectionIndex);
		
		$.singleSectionsNavView.height = "80dp";
		$.allSectionsNavView.height = 0;
		$.allSectionsNavView.top = 0;
	}
	else{
		listViewDisplayType = ALL_SECTIONS;
		$.listView.setSections(allSections);
		
		$.singleSectionsNavView.height = 0;
		$.allSectionsNavView.height = "80dp";
		
	}
};

var testIfQuestionsNeedToBeAdded = function(data){
	
	for(var i=0; i < hiddenQuestions.length; i++){
		if(testIfQuesionIsVisable(hiddenQuestions[i], data.name, data.value ) == true){
			i = addItemFromHiddenList(i);
		}
	}
};

var getQuestionSection = function(groupType){
	var sectionList = getAllQuestionSections();
	for(var sectionIndex=0; sectionIndex < sectionList.length; sectionIndex++){
		if(sectionList[sectionIndex].groupType == groupType){
			return sectionList[sectionIndex];
		}
	}
	return null;
};

//to be called by validateEntireQuestion
var validateSingleQuestionValue = function(value, questionObject){
	var returnObject = {isValid : true, outPutMessage : ""};
	
	var validation = Alloy.Globals.localParser.getValidation(questionObject.jsonObject);
	var dataType = questionObject.type;
	
	if(typeof validation !== "undefined"){
		var mandatory = validation.mandatory;
		if(typeof mandatory !== "undefined"){
			if(mandatory["#text"] == "true"){
				if(value == ""){
					
					returnObject.isValid = false;
					returnObject.outPutMessage = "This question is mandatory";
					return returnObject;
				}
			}
			else if(value == ""){
				returnObject.isValid = true;
				return returnObject;
				
			}
		}
		else if(value == ""){
			returnObject.isValid = true;
			return returnObject;
		}
	}
	
	
	var conditionalMandatory = Alloy.Globals.localParser.getConditionalMandatory(validation);
	if(conditionalMandatory.length != 0 && value == ""){
		
		for(var i = 0; i< conditionalMandatory.length; i++){
			var testValue = findQuestionsValue(conditionalMandatory.name);
			if(testValue.length == 0)continue;
			
			for(var testValueIndex =0; testValueIndex < testValue.length; testValueIndex++){
				if(conditionalMandatory[i].value == testValue[testValueIndex]){
					returnObject.isValid = false;
					returnObject.outPutMessage = "This question is mandatory";
					return returnObject;
				}
			}
		}
	}
	
	
	if(dataType == "numeric" || dataType == "numericRange"){
		var test = Validator.isNumber(value, false);
		if(test == false){
			returnObject.isValid = false;
			returnObject.outPutMessage = "Most be a numeric Value eg 4";
			return returnObject;
		}
	}
	else if(dataType == "decimal" || dataType == "decimalRange"){
		var test = Validator.isDecimal(value);
		if(test == false){
			returnObject.isValid = false;
			returnObject.outPutMessage = "Most be a decimal Value eg 1.0";
			return returnObject;
		}
	}
	
	if(typeof validation === "undefined"){
		returnObject.isValid = true;
		return returnObject;
	}
	
	var min = validation.min;
	if(typeof min !== "undefined"){
		if(parseInt(value) < parseInt(min["#text"])){
			returnObject.isValid = false;
			returnObject.outPutMessage = "value most be greater than "+min["#text"];
			return returnObject;
		}
	}
	
	var max = validation.max;
	if(typeof max !== "undefined"){
		if(parseInt(value) > parseInt(max["#text"])){
			returnObject.isValid = false;
			returnObject.outPutMessage = "value most be less than "+max["#text"];
			return returnObject;
		}
	}
	
	var minLength = validation.minLenght;
	if(typeof minLength !== "undefined"){
		if(value.length < parseInt(minLength["#text"])){
			returnObject.isValid = false;
			returnObject.outPutMessage = "value cannot have less than "+minLength["#text"] + " characters";
			return returnObject;
		}
	}
	
	var maxLength = validation.maxLenght;
	if(typeof maxLenght !== "undefined"){
		if(value.length > parseInt(maxLenght["#text"])){
			returnObject.isValid = false;
			returnObject.outPutMessage = "value cannot have more than "+maxLenght["#text"] + " characters";
			return returnObject;
		}
	}
	
	var format = validation.format;
	if(typeof format !== "undefined"){
		if(Validator.isValidFormat(value) == false){
			returnObject.isValid = false;
			returnObject.outPutMessage = "value most be in the format "+format["#text"];
			return returnObject;
		}
	}
	
	returnObject.isValid = true;
	return returnObject;
};

var setQuestionError = function(isValid, message, questionRefObject){
	if(isValid == false){
		
		questionRefObject.question.errorMessageVisable = true;
		//questionRefObject.question.properties.height = "145dp";
		questionRefObject.question.questionErrorMessageView =  {height : "30dp", top : "5dp"};
		questionRefObject.question.questionErrorMessage = {text : message};
	}
	else{
		questionRefObject.question.errorMessageVisable = false;
		//questionRefObject.question.properties.height = "110dp";
		questionRefObject.question.questionErrorMessageView =  {height : "0dp", top : "0dp"};
		questionRefObject.question.questionErrorMessage = {text : ""};
	}
	
	questionRefObject.section.updateItemAt(questionRefObject.questionIndex, questionRefObject.question);
};

var validateEntireQuestion = function(valueChangeObject){

	//alert(JSON.stringify(questionObject));
	
	var questionObject = valueChangeObject.item;
	
	var valueList = valueChangeObject.value;
	validateResponse = {isValid : true, outPutMessage : ""};
	
	for(var valueIndex = 0; valueIndex < valueList.length; valueIndex++){
		validateResponse = validateSingleQuestionValue(valueList[valueIndex], questionObject);
		if(validateResponse.isValid == false){
			//alert(validateResponse.outPutMessage);
			break;
			//return false;
		}
	}
	

	var questionRef = findQuestion(questionObject.name);
	//alert(JSON.stringify(questionRef));
	if(questionRef == null){
		//alert("questionRef == null");
		return false;
	}
	else{
		questionRef.question = questionObject;
		//alert("setQuestionError");
		setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionRef);
	}
	
	questionRef.question = questionObject;
	//alert("setQuestionError");
	setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionRef);
	
	/*
	if(validateResponse.isValid == false){
		questionObject.errorMessageVisable = true;
		questionObject.properties.height = "145dp";
		questionObject.questionErrorMessageView =  {height : "30dp", top : "5dp"};
		questionObject.questionErrorMessage = {text : validateResponse.outPutMessage};
		
	}
	else{
		questionObject.errorMessageVisable = false;
		questionObject.properties.height = "110dp";
		questionObject.questionErrorMessageView =  {height : "0dp", top : "0dp"};
		questionObject.questionErrorMessage = {text : ""};
	}
		
	var section  = getQuestionSection(valueChangeObject.groupType);
	
	if(section != null){
		section.updateItemAt(valueChangeObject.itemIndex, questionObject);
	}
	*/
		
	return validateResponse.isValid;
};

Ti.App.addEventListener("singleViewChange", function(data){
	setListViewDisplayTypeToSingleSections(data.isSingleView);
});

/*
Ti.App.addEventListener("moveSingleSectionCurrentIndex", function(data){
	setSelectedSectionForSingleSections(currentSingleSectionIndex + data.indexMove);
});
*/

function moveSectionBackClick(e){
	setSelectedSectionForSingleSections(currentSingleSectionIndex -1);
};

function moveSectionNextClick(e){
	setSelectedSectionForSingleSections(currentSingleSectionIndex + 1);
};


var questionValueChange = function(valueChangeObject){
	//alert("questionValueChange");
	/*
	if(validateEntireQuestion(valueChangeObject) == false){
		return;
	}	
	*/
	
	testIfQuestionsNeedToBeRemoved(valueChangeObject);
	testIfQuestionsNeedToBeAdded(valueChangeObject);
	
	if(valueChangeObject.responseObject != null){
		localDataHandler.updateQuestionWithUserResponse(
			valueChangeObject.item.associatedFileName,
			valueChangeObject.item
		);
	}

};

function footerTextButtonClick(e){
	Alloy.createController("questionDialogs/userNotesDialog", {notes : currentAssessmentObject.notes, closeCallBack : function(notes){
		currentAssessmentObject.notes  = notes;
		localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);
	}});
};

function footerNotesButtonClick(e){
	/*
	var questionObject = debugFindQuestions(allSections, questionSelected.name);
	
	Alloy.createController("questionDialogs/userNotesDialog", {notes : questionObject.question.notes, closeCallBack : function(notes){
		
		questionObject.question.notes  = notes;
		
		if(notes != ""){
			questionObject.question.notesBackground = {backgroundImage: 'images/questionSelectedNote.png'};
			questionObject.question.notes = notes; 
		}
		else{
			questionObject.question.notesBackground = {backgroundImage: 'images/questionNote.png'};
			questionObject.question.notes = ""; 
		}
		// {questionIndex : itemIndex, question : itemsList[itemIndex], section : sectionList[sectionIndex]};
		questionObject.section.updateItemAt(questionObject.questionIndex, questionObject.question);
		
		Ti.App.fireEvent("notesAdded", {
			item : questionObject.question,
			itemIndex : questionObject.itemIndex,
			groupType : questionObject.question.groupType,
			notes : notes
		});
	}});
	*/
};

function footerHelpButtonClick(e){
	
};

Ti.App.addEventListener("questionValueChange", questionValueChange);

Ti.App.addEventListener("notesAdded", function(notesObject){
	
	localDataHandler.updateQuestionWithUserNotes(
			notesObject.item.associatedFileName,
			notesObject.item
		);
});
Ti.App.addEventListener("startCensesTimer", function(questionValueChange){
	
	
	var questionRef = findQuestion(I_DURATION);
	if(questionRef == null){
		alert("I_DURATION not found");
		return;
	}
	
	var durationInt = 0;
	if(questionRef.question.value.length > 0){
		durationInt = parseInt(questionRef.question.value[0]);
		if(isNaN(intValue)){
			intValue =0;
		}
	}
	else durationInt = 0;
	
	if(durationInt <= 0){
		setQuestionError(false, "enter a Duration Value greater than 0");
	}
	
	
	localDataHandler.updateQuestionWithUserNotes(
			notesObject.item.associatedFileName,
			notesObject.item
		);
});


Ti.App.addEventListener("questionSelected", function(questionObject){
	//alert("questionSelected, name : "+questionObject.name+", groupType : "+questionObject.groupType) ;
	//questionSelected = {name : "",  groupType : ""};
	questionSelected.name = questionObject.name;
	questionSelected.groupType = questionObject.groupType;
	
});

