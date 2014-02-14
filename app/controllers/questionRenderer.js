
//`Alloy.Globals.currentlyFocusedTF` stores the currently focused textfield
Alloy.Globals.currentlyFocusedTF = null; 

//`hiddenQuestions` is a list of all questions that are not currently visible
var hiddenQuestions = [];

//`allSections` is a list of all possible (Titanium.UI.ListSection) in a assessment
var allSections = [];

//`currentAssessmentObject` defines the assessmentObject the the question renderer is displaying
var currentAssessmentObject = null;

//`questionSelected` is used for the move to lastQuestion
//when a question is selected this value is updated
var questionSelected = null;


// `ALL_SECTIONS` and `SINGLE_SECTIONS` are just names for set values
var ALL_SECTIONS = 1;
var SINGLE_SECTIONS = 2;

//`listViewDisplayType` defines what mode the question renderer is in and can be set to `ALL_SECTIONS` or `SINGLE_SECTIONS`
var listViewDisplayType = ALL_SECTIONS;


//`currentSingleSectionIndex` is the index of the section curently selected section,
//when `listViewDisplayType` is set to `SINGLE_SECTIONS`
var currentSingleSectionIndex = 0;


/**
`findQuestionsRef` searches sectionList for a question that 
matches the questionName and groupType and returns references to the found question.

@param questionName  (string) Name to search against
@param groupType  (string) groupType to search against

@return - success :  Object { (int)questionIndex, questionObject, (Titanium.UI.ListSection) sectionObject}
@return - fail : null
*/
 
var findQuestionsRef = function (sectionList, questionName, groupType) {
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
		
		if(sectionList[sectionIndex].groupType == groupType){
			var itemsList = sectionList[sectionIndex].getItems();
	        for (var itemIndex = 0; itemIndex < itemsList.length; itemIndex++) {
	            if (itemsList[itemIndex].name == questionName) {
	                return {
	                    questionIndex: itemIndex,
	                    question: itemsList[itemIndex],
	                    section: sectionList[sectionIndex]
	                };
	            }
	        }
       }
    }
    return null;
};



/**
`newTestIfMandatory` the questionObject passed in will be tested if it is mandatory.
A question can be strictly  mandatory or can be mandatory depending on the
value of anther question.

@param questionObject : questionObject to test
 
@return :  true or false
*/
var newTestIfMandatory = function (questionObject) {

    if (questionObject.validation.mandatory == true) {
        return true;
    } else if (questionObject.validation.conditionalMandatory.length == 0) {
        return false;
    }

    var conditionalMandatory = questionObject.validation.conditionalMandatory;
    for (var conditionalIndex = 0; conditionalIndex < conditionalMandatory.length; conditionalIndex++) {
        var parentQuestion = newFindQuestionObject(conditionalMandatory[conditionalIndex].question.name, conditionalMandatory[conditionalIndex].question.groupType);
        if (parentQuestion == null) continue;
        if (conditionalMandatory[conditionalIndex].value == null) return true;

        for (var valueIndex = 0; valueIndex < parentQuestion.value.length; valueIndex++) {
            if (conditionalMandatory[conditionalIndex].value == parentQuestion.value[valueIndex]) {
                return true;
            }
        }
    }
    return false;
};


/**
`setQuestionToMandatory` the question passed in will have its title changed to
have a '*' at its end if it is mandatory or removed if it is not

@param questionObject : questionObject to be changed 

@return :  questionObject
*/
var setQuestionToMandatory = function (questionObject) {
    if (questionObject.mandatory == true) {
        if (questionObject.title.text.slice(-1) != "*") {
            questionObject.title.text = questionObject.title.text + "*";
        }
    } else {
        if (questionObject.title.text.slice(-1) == "*") {
            questionObject.title.text = questionObject.title.text.substring(0, questionObject.title.text.length - 1);
        }
    }

    return questionObject;
};



/**
`newTestIfVisable` questionObject passed in will be tested if it should be Visible
to the user or hidden

@param questionObject : questionObject to test

@return :  true or false
*/
var newTestIfVisable = function (questionObject) {

    for (var renderValueIndex = 0; renderValueIndex < questionObject.renderValue.length; renderValueIndex++) {
        var parentQuestion = newFindQuestionObject(questionObject.renderValue[renderValueIndex].question.name, questionObject.renderValue[renderValueIndex].question.groupType);
        if (parentQuestion == null) continue;
        if (questionObject.renderValue[renderValueIndex].value == null) return true;

        for (var valueIndex = 0; valueIndex < parentQuestion.value.length; valueIndex++) {
            if (questionObject.renderValue[renderValueIndex].value == parentQuestion.value[valueIndex]) {
                return true;
            }
        }
    }
    return false;
};



/**
`newFindQuestionObject` this function searches all sections for a question that 
matches the questionName and groupType and return the question Object or null 
if not found

@param questionName : (string) Name to search against
@param groupType : (string) groupType to search against

@return - success :  questionObject
@return - fail : null
*/

var newFindQuestionObject = function (questionName, groupType) {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType == groupType) {
            var questionList = sectionList[sectionIndex].getItems();
            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name == questionName) {
                    return questionList[questionIndex];
                }
            }
        }
    }
    return null;
};



/**
`newTestDependentQuestions` tests all questions that are dependent on the passed
questionObject if they are visable or mandatory. question are hiden or made Visible
depending on the results of the tests

@param questionObject : questionObject to test

@return :  n/a
*/
var newTestDependentQuestions = function (questionObject) {
	
	
	//`addToSectionMap`is a map of section using groupType as a key to a list of questions to add to that section
    var addToSectionMap = [];
    for (var questionIndex = 0; questionIndex < hiddenQuestions.length; questionIndex++) {
        for (var childQuestionIndex = 0; childQuestionIndex < questionObject.renderDependencyList.length; childQuestionIndex++) {
			if(typeof hiddenQuestions[questionIndex].name === "undefined")
			{
				continue;
			}
            if (hiddenQuestions[questionIndex].name == questionObject.renderDependencyList[childQuestionIndex].name) {
            	
                if (newTestIfVisable(hiddenQuestions[questionIndex]) == true) {
                	
                    if (!(hiddenQuestions[questionIndex].groupType in addToSectionMap)) {
                    	
                        addToSectionMap[hiddenQuestions[questionIndex].groupType] = [];
                    }
                    addToSectionMap[hiddenQuestions[questionIndex].groupType].push(hiddenQuestions[questionIndex]);
                    hiddenQuestions.splice(questionIndex, 1);
                    questionIndex--;
                }
            }
        }
    }
	//`removeFromSectionMap` is a map of section with groupType being the key. each element in the map is a second map of question names.
	//using this `if(questionName in removeFromSectionMap[groupType]` will tell you if the question needs to be removed
    var removeFromSectionMap = [];
    for (var questionIndex = 0; questionIndex < questionObject.renderDependencyList.length; questionIndex++) {
        var childQuestion = newFindQuestionObject(questionObject.renderDependencyList[questionIndex].name, questionObject.renderDependencyList[questionIndex].groupType);
        if (childQuestion == null) continue;

        if (newTestIfVisable(childQuestion) == false) {
            if (!(childQuestion.groupType in removeFromSectionMap)) {
                removeFromSectionMap[childQuestion.groupType] = [];
            }
            removeFromSectionMap[childQuestion.groupType][childQuestion.name] = true;
        }
    }

    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        var questionList = sectionList[sectionIndex].getItems();
        var sectionGroupType = sectionList[sectionIndex].groupType;

		//`if (sectionGroupType in removeFromSectionMap)` tests if there are any question that need to be removed 
        if (sectionGroupType in removeFromSectionMap) {
            Alloy.Globals.Logger.log("remove from section : " + sectionGroupType,"info");

            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name in removeFromSectionMap[sectionGroupType]) {
                    Alloy.Globals.Logger.log("remove : " + questionList[questionIndex].title.text,"info");
                    questionList[questionIndex].visable = false;

                    questionList[questionIndex].mandatory = newTestIfMandatory(questionList[questionIndex]);
                    questionList[questionIndex] = setQuestionToMandatory(questionList[questionIndex]);

                    Alloy.Globals.localDataHandler.updateQuestion(questionList[questionIndex]);
                    hiddenQuestions.push(questionList[questionIndex]);
                    questionList.splice(questionIndex, 1);

                    questionIndex--;
                }
            }
        }
		//`if (sectionGroupType in addToSectionMap) ` tests if there are any question that need to be added 
        if (sectionGroupType in addToSectionMap) {
            Alloy.Globals.Logger.log("add from section : " + sectionGroupType,"info");

            for (var addQuestionIndex = 0; addQuestionIndex < addToSectionMap[sectionGroupType].length; addQuestionIndex++) {

				//will now add the question in the section depending on there order
                var questionObjectToAdd = addToSectionMap[sectionGroupType][addQuestionIndex];
                var questionAdded = false;
                for (var questionIndex = 0; questionIndex < questionList.length && questionAdded != true; questionIndex++) {

                    if (parseInt(questionObjectToAdd.order) < parseInt(questionList[questionIndex].order)) {

                        questionObjectToAdd.visable = true;

                        questionObjectToAdd.mandatory = newTestIfMandatory(questionObjectToAdd);
                        questionObjectToAdd = setQuestionToMandatory(questionObjectToAdd);
     

                        Alloy.Globals.localDataHandler.updateQuestion(questionObjectToAdd);


                        questionList.splice(questionIndex, 0, questionObjectToAdd);
                        Alloy.Globals.Logger.log("added splice : " + questionObjectToAdd.title.text,"info");
                        questionAdded = true;
                    }
                }
                if (questionAdded == false) {
                    questionObjectToAdd.visable = true;

                    questionObjectToAdd.mandatory = newTestIfMandatory(questionObjectToAdd);
                    questionObjectToAdd = setQuestionToMandatory(questionObjectToAdd);

                    Alloy.Globals.localDataHandler.updateQuestion(questionObjectToAdd);
                    questionList.push(questionObjectToAdd);
                    Alloy.Globals.Logger.log("added push : " + questionObjectToAdd.title.text,"info");
                }
            }
        }

        if (sectionGroupType in addToSectionMap || sectionGroupType in removeFromSectionMap) {
            sectionList[sectionIndex].setItems(questionList);
            
            if(questionList.length > 0){
	        	sectionList[sectionIndex].headerView.show();
	        	sectionList[sectionIndex].headerView.height = Ti.UI.SIZE;
	        }
	        else{
	        	sectionList[sectionIndex].headerView.hide();
	        	sectionList[sectionIndex].headerView.height = 0;
	        }
        }
    }


    var testMandatorySectionMap = [];
    for (var questionIndex = 0; questionIndex < questionObject.mandatoryDependenciesList.length; questionIndex++) {
        var childQuestion = newFindQuestionObject(questionObject.mandatoryDependenciesList[questionIndex].name, questionObject.mandatoryDependenciesList[questionIndex].groupType);
        if (childQuestion == null) continue;

        if (!(childQuestion.groupType in testMandatorySectionMap)) {
            testMandatorySectionMap[childQuestion.groupType] = [];
        }
        testMandatorySectionMap[childQuestion.groupType][childQuestion.name] = true;
    }

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
        var questionList = sectionList[sectionIndex].getItems();
        var sectionGroupType = sectionList[sectionIndex].groupType;

        if (sectionGroupType in testMandatorySectionMap) {
   

            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name in testMandatorySectionMap[sectionGroupType]) {
                    questionList[questionIndex].mandatory = newTestIfMandatory(questionList[questionIndex]);
                    questionList[questionIndex] = setQuestionToMandatory(questionList[questionIndex]);
                    Alloy.Globals.localDataHandler.updateQuestion(questionList[questionIndex]);
                }
            }

            sectionList[sectionIndex].setItems(questionList);

        }
    }
};



/**
`findQuestionsValue` searches for the question that matches the 
passed questionName, then the question value array is returned. if no question is
found it returns an array with a empty String in

@param questionName : (string) Name to search against

@return - success :  value List eg ["value1", "value2"]
@return - fail : list with one item [""]
*/
var findQuestionsValue = function (questionName) {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].getItems().length; questionIndex++) {
            var questionList = sectionList[sectionIndex].getItems();

            if (questionList[questionIndex].name == questionName) {
                return questionList[questionIndex].value;
            }
        }
    }
    return [""];
};



/**
`findSectionByAssociatedFileName` searches for the question that matches the 
passed alcrmQuestionID that also is found is the file that matches associatedFileName.

@param alcrmQuestionID : (string) alcrmQuestionID to search for
@param associatedFileName : (string) associatedFileName to search for
 
@return - success :  Object {questionIndex, questionObject, sectionObject}
@return - fail : null
*/
var findQuestionByAssociatedFileName = function (alcrmQuestionID, associatedFileName) {
    var sectionList = getAllQuestionSections();

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
    	
        if (sectionList[sectionIndex].associatedFileName == associatedFileName) {
            var questionList = sectionList[sectionIndex].getItems();
            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].alcrmQuestionID == alcrmQuestionID) {

                    return {
                    	questionIndex: questionIndex,
                        question: questionList[questionIndex],
                        section: sectionList[sectionIndex]
                    };
                }
            }
        }
    }
    Alloy.Globals.Logger.log("findQuestionByAssociatedFileName question not found, alcrmQuestionID = "+alcrmQuestionID+", associatedFileName = "+associatedFileName, "error");
    return null;
};



/**
`findSectionByAssociatedFileName` searches for the section that matches the 
passed alcrmGroupType that also is found is the file that matches associatedFileName.
the fuction will return the section object or null if not found

@param alcrmGroupType :(string) alcrmGroupType to search for
@param associatedFileName : (string) associatedFileName to search for
  
@return - success :  (Titanium.UI.ListSection) sectionObject
@return - fail : null
*/
var findSectionByAssociatedFileName = function (alcrmGroupType, associatedFileName) {
    var sectionList = getAllQuestionSections();

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].associatedFileName == associatedFileName && sectionList[sectionIndex].alcrmGroupType == alcrmGroupType) {
            return sectionList[sectionIndex];
        }
    }
    return null;
};



/** 
`exports.clear` clears all sections and questions from the listView

@return : n/a
*/
exports.clear = function () {
    allSections = [];
    $.listView.setSections(allSections);
};



/**
`buildQuestionSections` takes the JASON_sectionList and builds titanium
ListSection for each section and return the new list of titanium ListSections

@param JASON_sectionList : simple JSON List of Sections and Question

@return :  (Titanium.UI.ListSection)  listSections
*/
var buildQuestionSections = function (JASON_sectionList) {
    var newSectionList = [];
    for (var i = 0; i < JASON_sectionList.length; i++) {
        var newQuestionsSection = Titanium.UI.createListSection();

        if (JASON_sectionList[i].pageType == "riskAssessment") {
            newQuestionsSection.headerView = Alloy.createController("questionSectionHeader", {
                title: JASON_sectionList[i].title
            }).getView();
        } else {
            newQuestionsSection.headerView = Alloy.createController("questionSectionHeader", {
                title: JASON_sectionList[i].pageName + " " + JASON_sectionList[i].title
            }).getView();
        }

        newQuestionsSection.title = JASON_sectionList[i].title;
        newQuestionsSection.groupType = JASON_sectionList[i].groupType;
        newQuestionsSection.alcrmGroupType = JASON_sectionList[i].alcrmGroupType;
        newQuestionsSection.associatedFileName = JASON_sectionList[i].associatedFileName;
        newQuestionsSection.pageName = JASON_sectionList[i].pageName;
        newQuestionsSection.pageType = JASON_sectionList[i].pageType;
       	newQuestionsSection.pageID= JASON_sectionList[i].pageID;
        newQuestionsSection.setItems(JASON_sectionList[i].questionList);
        newSectionList.push(newQuestionsSection);
        
        if(JASON_sectionList[i].questionList.length == 0){
        	newQuestionsSection.headerView.hide();
        	newQuestionsSection.headerView.height = 0;
        }
    }
    return newSectionList;
};



/**
`removeHiddenQuestions` takes the JASON_sectionList removes all hidden questions
before the function buildQuestionSections is called. all hidden questions are added to
hiddenQuestions list
 
@param JASON_sectionList : simple JSON List of Sections and Question

@return :  JASON_sectionList - with hidden questions removed
*/
var removeHiddenQuestions = function (JASON_sectionList) {
	try{
	    for (var sectionIndex = 0; sectionIndex < JASON_sectionList.length; sectionIndex++) {

	        var questionList = JASON_sectionList[sectionIndex].questionList;
	        for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
	        	
				if(questionList[questionIndex] != null){
		            if (questionList[questionIndex].visable == false) {
		            	Alloy.Globals.Logger.log("removeHiddenQuestion at start, question name = "+questionList[questionIndex].name,"info");
		                hiddenQuestions.push(questionList[questionIndex]);
		                questionList.splice(questionIndex, 1);
		                questionIndex = questionIndex - 1;
		            }
		            
		       }
	        }
	        JASON_sectionList.questionList = questionList;
	    }
	    return JASON_sectionList;
	}catch(e){
		Alloy.Globals.Logger.log("Exception in removeHiddenQuestions. Error Details: "+JSON.stringify(e), "error");
		Alloy.Globals.aIndicator.hide();
	}
};


/**
`setupSelectedQuestion` called within the function setAssessment. it searches for the
a question that has been previously selected or if non found the first non read-only question

@return : n/a
 */
var setupSelectedQuestion = function () {
 try{
    for (var sectionIndex = 0; sectionIndex < allSections.length; sectionIndex++) {
        var questionList = allSections[sectionIndex].getItems();
        for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
        	if(questionList[questionIndex] != null){
	            if (questionList[questionIndex].selected == true) {
	                selectQuestion(questionList[questionIndex]);
	                return;
	            }
	        }
        }
    }


    if (allSections.length > 0) {
        var questionList = allSections[0].getItems();
        if (questionList > 0) {
            selectQuestion(questionList[0]);
        }
    }
 }catch(e){
 	Alloy.Globals.Logger.log("Exception in setupSelectedQuestion. Error Details: "+JSON.stringify(e), "error");
	Alloy.Globals.aIndicator.hide();
 }
};



/**
`setAssessment` the JASON_sectionList is the interpreted question set and assessmentObject
is the saved assessment object created in localDataHandler. this function is used to setup 
questionRenderer to veiw an assessment

@param JASON_sectionList : simple JSON List of Sections and Question
@param assessmentObject : object defining an assessment and names of attched saved files
 
@return - n/a
*/
exports.setAssessment = function (JASON_sectionList, assessmentObject) {
	try{
		Ti.API.info("setAssessment = "+JSON.stringify(JASON_sectionList));
		$.listView.setSections([]);
	    currentAssessmentObject = assessmentObject;
	
	    hiddenQuestions = [];
	    allSections = [];
	
	    JASON_sectionList = removeHiddenQuestions(JASON_sectionList);
	
		
	
	    sectionList = buildQuestionSections(JASON_sectionList);
	
	    allSections = sectionList;
	
	    $.listView.setSections(sectionList);
	    
	    var userPreferences = Alloy.Globals.User.getPreferences();
	    setListViewDisplayTypeToSingleSections(userPreferences.singleView);
		userPreferences = null;
		
	    setupSelectedQuestion();
	
	    $.listView.scrollToItem(0, 0);
	}catch(e){
		Alloy.Globals.Logger.log("Exception in setAssessment. Error Details: "+JSON.stringify(e), "error");
		Alloy.Globals.aIndicator.hide();
	}
};


/**
`appendSectionsToAssessment` the JASON_sectionList is the interpreted question.
used to add extra sectons to the listView after setAssessment has been called
@param JASON_sectionList : simple JSON List of Sections and Question
 
@return - n/a
*/
exports.appendSectionsToAssessment = function (JASON_sectionList) {
	Ti.API.info("appendSectionsToAssessment = "+JSON.stringify(JASON_sectionList));
    JASON_sectionList = removeHiddenQuestions(JASON_sectionList);

    appendSectionList = buildQuestionSections(JASON_sectionList);

    allSections = allSections.concat(appendSectionList);
    $.listView.setSections(allSections);
};


/**
`exports.moveToQuestion` searches for a section that matched the groupType
and moves the listView to make visble the question at questionIndex at the top of the screen

@param groupType : (string) groupType to search for
@param questionIndex : (int) questionIndex to search for
 
@return - n/a
*/
exports.moveToQuestion = function (groupType, questionIndex) {
    Alloy.Globals.Logger.log("** questionRender moveToQuestion, groupType = "+groupType+", questionIndex = "+questionIndex,"info");
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType == groupType) {

            if (listViewDisplayType == ALL_SECTIONS) {
                $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
            } else if (listViewDisplayType == SINGLE_SECTIONS) {
                setSelectedSectionForSingleSections(sectionIndex);
                $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
            }

            selectQuestion(sectionList[sectionIndex].getItemAt(questionIndex));

            return;
        }
    }
};


/**
`getQuestionIndexFromSection` returns the index of the question that matches the questionName
in the section that is passed. if no question is found null is returned

@param questionName : (string) questionName to search for
@param section : (Titanium.UI.ListSection) section to search in

@return - success :  (int) question index
@return - fail : null
*/
var getQuestionIndexFromSection = function (questionName, section) {

    var questionList = section.getItems();

    for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
        if (questionList[questionIndex].name == questionName) {
            return questionIndex;
        }
    }
    return null;
};


/**
`moveToQuestionByName` move the list view to place the question found that matches questionName
and groupType at the top of the screen

@param questionName : (string) questionName to search for
@param groupType : (string) groupType to search for
 
@return - n/a
*/
var moveToQuestionByName = function (questionName, groupType) {

    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType == groupType) {

            var questionIndex = getQuestionIndexFromSection(questionName, sectionList[sectionIndex]);
            
            if (questionIndex == null) return;

            else if (listViewDisplayType == ALL_SECTIONS) {
                $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
            } else if (listViewDisplayType == SINGLE_SECTIONS) {
                setSelectedSectionForSingleSections(sectionIndex);
                $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
            }
            selectQuestion(sectionList[sectionIndex].getItemAt(questionIndex));

            return;
        }
    }
};


/**
`exports.goToFirstUnanswered` searches for the first question that has not been answered and
moves the listView so the question is at the top of the sceeen

@return - n/a
*/
exports.goToFirstUnanswered = function () {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
    	
    	if(sectionList[sectionIndex].pageType == "coreQuestion")continue;
    	
        var questionList = sectionList[sectionIndex].getItems();
        for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
            if (questionList[questionIndex].value[0] == "") {
            	
                selectQuestion(questionList[questionIndex]);

                if (listViewDisplayType == ALL_SECTIONS) {
                    $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
                
                } else if (listViewDisplayType == SINGLE_SECTIONS) {
                    setSelectedSectionForSingleSections(sectionIndex);
                    $.listView.scrollToItem(sectionIndex, questionIndex, {
	                    animated: false,
	                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
	                });
                }
                return;
            }
        }
    }
};


/**
`exports.goToLastPositiond` searches for the first question that has not been a

@return - n/a
*/
exports.goToLastPositiond = function () {
    moveToQuestionByName(questionSelected.name, questionSelected.groupType);
};


/**
`exports.getGoToContentsDetails` builds a list of all sections and questions to be used in the goTo window

@return - list of new section objects which contain list of new question objects
*/
exports.getGoToContentsDetails = function () {
    var sectionContentsDetailsList = [];
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
    	
    	var mandatoryQuestion = false;
 
        var newSectionContents = {
            questionList: [],
            title: sectionList[sectionIndex].title,
            associatedFileName: sectionList[sectionIndex].associatedFileName,
            pageName: sectionList[sectionIndex].pageName,
            pageType: sectionList[sectionIndex].pageType,
            pageID : sectionList[sectionIndex].pageID,
            
            mandatoryQuestions : false,
            allMandatoryQuestionsAnswered : true,
            allQuestionsAnswered : true,
            
            sectionIndex: sectionIndex,
            groupType: sectionList[sectionIndex].groupType
        };
        if (sectionList[sectionIndex].getItems().length != 0) {
            sectionContentsDetailsList.push(newSectionContents);
        }

        var questionsList = sectionList[sectionIndex].getItems();
        for (var questionIndex = 0; questionIndex < questionsList.length; questionIndex++) {
		
            if (questionsList[questionIndex].isAQuestion == false) {
                continue;
            }
            
            if(questionsList[questionIndex].mandatory == true){
            	newSectionContents.mandatoryQuestions = true;
            	if(questionsList[questionIndex].value[0] == ""){
            		newSectionContents.allMandatoryQuestionsAnswered = false;
            		newSectionContents.allQuestionsAnswered = false;
            	}
            }
            else{
            	if(questionsList[questionIndex].value[0] == ""){
            		newSectionContents.allQuestionsAnswered = false;
            	}
            }

            var newQuestionDetails = {
                title: questionsList[questionIndex].title.text,
                questionIndex: questionIndex,
                mandatory: questionsList[questionIndex].mandatory,
                firstValue: questionsList[questionIndex].value[0]
            };

            newSectionContents.questionList.push(newQuestionDetails);
        }

    }
    return sectionContentsDetailsList;
};


/**
`getAllQuestionSections` returns a list of all sections in the assessment

@return - list of (Titanium.UI.ListSection) 
*/
var getAllQuestionSections = function () {
    return allSections;
};


/**
`setSelectedSectionForSingleSections` takes a section from the allSections list and sets it to be the single visable section

@param sectionsIndex : (int) the index of the section in the sectionList

@/returns - n/a
*/
var setSelectedSectionForSingleSections = function (sectionsIndex) {
    currentSingleSectionIndex = sectionsIndex;
    var newSectionList = [];
    newSectionList[0] = allSections[sectionsIndex];
   
    $.backButton.visible = (sectionsIndex > 0);
    $.nextButton.visible = (sectionsIndex < (allSections.length - 1));

    $.listView.setSections(newSectionList);
};


/**
`setListViewDisplayTypeToSingleSections` toogles the listViewDisplayType to be SINGLE_SECTIONS or ALL_SECTIONS
@param onSingleSection : (boolean) if the SingleSection is on
 
@return - n/a
*/
var setListViewDisplayTypeToSingleSections = function (onSingleSection) {

    if (onSingleSection == true) {
        listViewDisplayType = SINGLE_SECTIONS;
        if (allSections.length == 0) return;

        currentSingleSectionIndex = 0;
        setSelectedSectionForSingleSections(currentSingleSectionIndex);

        $.singleSectionsNavView.height = "80dp";
        $.allSectionsNavView.height = 0;
        $.allSectionsNavView.top = 0;
    } else {
        listViewDisplayType = ALL_SECTIONS;
        $.listView.setSections(allSections);

        $.singleSectionsNavView.height = 0;
        $.allSectionsNavView.height = "80dp";

    }
};


/**
`getQuestionSection` searches of a section that has groupType and returns the SectionObject

@param groupType : (string) groupType to search for

@return - success :  sectionObject
@return - fail : null
*/
var getQuestionSection = function (groupType) {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
        if (sectionList[sectionIndex].groupType == groupType) {
            return sectionList[sectionIndex];
        }
    }
    return null;
};


/**
`validateSingleQuestionValue` to be called by validateEntireQuestion 

@param value : (string) value to be tested 
@param questionObject : questionObject to be validated
 
@return :  questionObject - updated questionObject
*/
var validateSingleQuestionValue = function (value, questionObject) {
    var returnObject = {
        isValid: true,
        outPutMessage: ""
    };
    
    var dataType = questionObject.type;

    if (value == "") {
   	
        if (questionObject.validation.mandatory == true) {

            returnObject.isValid = false;
            returnObject.outPutMessage = L("mandatory_error_text");
            return returnObject;
        } else {

            var conditionalMandatory = questionObject.validation.conditionalMandatory;
            if (conditionalMandatory.length != 0) {
                for (var i = 0; i < conditionalMandatory.length; i++) {

                    var testValue = findQuestionsValue(conditionalMandatory[i].name);

                    if (conditionalMandatory[i].value == null) {
                        continue;
                    }

                    for (var testValueIndex = 0; testValueIndex < testValue.length; testValueIndex++) {
                        if (conditionalMandatory[i].value == testValue[testValueIndex]) {
                            returnObject.isValid = false;
                            returnObject.outPutMessage = L("mandatory_error_text");;
                            return returnObject;
                        }
                    }
                }
            }

            returnObject.isValid = true;
            return returnObject;
        }
    }

    if (dataType == "numeric" || dataType == "numericRange") {
        var test = Alloy.Globals.Validator.isNumber(value, false);
        if (test == false) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("numeric_error_text");
            return returnObject;
        }
    } else if (dataType == "decimal" || dataType == "decimalRange") {
        var test = Alloy.Globals.Validator.isDecimal(value);
        if (test == false) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("decimal_error_text");
            return returnObject;
        }
    }

    if (questionObject.validation.validationTest == false) {
        returnObject.isValid = true;
        return returnObject;
    }

    if (questionObject.validation.min != null) {
        if (parseInt(value) < parseInt(questionObject.validation.min)) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("min_error_text") +" "+  questionObject.validation.min;
            return returnObject;
        }
    }

    if (questionObject.validation.max != null) {
        if (parseInt(value) > parseInt(questionObject.validation.max)) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("max_error_text") +" "+ questionObject.validation.max;
            return returnObject;
        }
    }

    if (questionObject.validation.minLength != null) {
        if (value.length <= parseInt(questionObject.validation.minLength)) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("minLength_error_text") +" "+  questionObject.validation.minLength + " characters";
            return returnObject;
        }
    }


    if (questionObject.validation.maxLength != null) {
        if (value.length >= parseInt(questionObject.validation.maxLength)) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("maxLength_error_text") +" "+  questionObject.validation.maxLength + " characters";
            return returnObject;
        }
    }


    if (questionObject.validation.format != null) {
        if (Alloy.Globals.Validator.isValidFormat(value) == false) {
            returnObject.isValid = false;
            returnObject.outPutMessage = L("format_error_text") +" "+ questionObject.validation.format;
            return returnObject;
        }
    }

    returnObject.isValid = true;
    return returnObject;
};


/**
`setQuestionError` sets the error message for a questionObject

@param isValid : (boolean) if the question is valid
@param message : (string) error message to display
@param questionObject : questionObject to update

@return :  questionObject
*/
var setQuestionError = function (isValid, message, questionObject) {
    if (isValid == false) {

        questionObject.errorMessageVisable = true;
        questionObject.questionErrorMessageView = {
            height: "30dp",
            top: "5dp"
        };
        questionObject.questionErrorMessage = {
            text: message
        };
    } else {
        questionObject.errorMessageVisable = false;
        questionObject.questionErrorMessageView = {
            height: "0dp",
            top: "0dp"
        };
        questionObject.questionErrorMessage = {
            text: ""
        };
    }
    return questionObject;
};


/**
`validateEntireQuestion` validate the values of a question

@param questionObject : questionObject to update

@return :  questionObject
*/
var validateEntireQuestion = function (questionObject) {
	
    var valueList = questionObject.value;
    validateResponse = {
        isValid: true,
        outPutMessage: ""
    };
    
    for (var valueIndex = 0; valueIndex < valueList.length; valueIndex++) {
        validateResponse = validateSingleQuestionValue(valueList[valueIndex], questionObject);
        if (validateResponse.isValid == false) {
            break;
        }
    }

    if (questionObject == null) {
        return questionObject;
    } else {

        questionObject = setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionObject);
    }
    
    questionObject = setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionObject);

    return questionObject;
};

/*
//`Ti.App.addEventListener("singleViewChange)` listen for an event of the question renderer
//being changed from single to muiti section view
Ti.App.addEventListener("singleViewChange", function (data) {
    setListViewDisplayTypeToSingleSections(data.isSingleView);
});
*/



/**
`moveSectionBackClick` the callback function for the button click to move the selected section
in the single section mode to the previous section

@param e : not used

@return :  n/a
*/
function moveSectionBackClick(e) {
    setSelectedSectionForSingleSections(currentSingleSectionIndex - 1);
};



/**
`moveSectionNextClick` the callback function for the button click to move the selected section
in the single section mode to the next section

@param e : not used
 
@return :  n/a
*/
function moveSectionNextClick(e) {
    setSelectedSectionForSingleSections(currentSingleSectionIndex + 1);
};



/**
`questionRealTimeValidation` called from a textFieldTemplate change event to
this function validates a question value and display updates the question error
message if thr question is not valid

@param e.questionObject : questionObject
@param e.section : sectionObject
@param e.questionIndex : (int) the index of the question in the section

@return :  n/a
*/
var questionRealTimeValidation = function(e)
{
	 e.questionObject = validateEntireQuestion(e.questionObject);
	 if (e.section != null) {
        e.section.updateItemAt(e.questionIndex, e.questionObject);
    }
};
exports.questionRealTimeValidation = questionRealTimeValidation;



/**
`questionValueChange` called from a questionTemplate changes its value
the function updates the question error message if needed and removes or addes 
questions if this question value change effets them

@param e.questionObject : questionObject
@param e.section : (Titanium.UI.ListSection) sectionObject
@param e.questionIndex : (int) the index of the question in the section

@return :  n/a
*/
var questionValueChange = function (e) {

    // Blur the currently focused TF
    try {
        Alloy.Globals.currentlyFocusedTF && Alloy.Globals.currentlyFocusedTF.blur();
    } catch (e) {
        Alloy.Globals.Logger.log('Cannot blur textfield' + JSON.stringify(e),"info");
    }

    if (e.questionObject.alcrmQuestionID === "I_ASSESSMENT_TITLE" || e.questionObject.alcrmQuestionID === "LAST_ASSESSMENT_DATE") {

        var sectionList = getAllQuestionSections();

        var questionTitleRef = findQuestionsRef(sectionList, "0I_ASSESSMENT_TITLE", "0Collector");
		
		if (e.questionObject.alcrmQuestionID === "I_ASSESSMENT_TITLE") {
			questionTitleRef.question = e.questionObject;
		}
		
        if (questionTitleRef !== null) {
      
            var questionResponse =
                "<ques:parameterName>" + questionTitleRef.question.alcrmQuestionID + "</ques:parameterName>" +
                "<ques:parameterValue>" + questionTitleRef.question.displayValue.value + "</ques:parameterValue>";

            questionTitleRef.question.questionResponse = questionResponse;

            questionTitleRef.section.updateItemAt(questionTitleRef.questionIndex, questionTitleRef.question);

            if (e.questionObject.alcrmQuestionID === "I_ASSESSMENT_TITLE") {
                e.questionObject = questionTitleRef.question;
            }
        }

    }
    
    if(e.questionObject.alcrmQuestionID === "I_CENSUS_TYPE" && e.questionObject.value[0] != "20" && e.questionObject.associatedFileName === $.censusFooterView.getCensusAssociatedFileName()){
    	$.censusFooterView.close();
    }
	
    e.questionObject = validateEntireQuestion(e.questionObject);

    if (e.section != null) {
        e.section.updateItemAt(e.questionIndex, e.questionObject);
    }

    Alloy.Globals.localDataHandler.updateQuestion(e.questionObject);
    
    Alloy.Globals.Logger.log("questionRender questionValueChange name = "+e.questionObject.name + ", question = "+JSON.stringify(e.questionObject),"info");
    newTestDependentQuestions(e.questionObject);

    return e.questionObject;
};
exports.questionValueChange = questionValueChange;



/**
`toggleScrollLock` toggles if the list view is locked in place or not

@return :  n/a
 */
var toggleScrollLock = function()
{
	if($.listView.canScroll === true){
    	$.listView.setCanScroll(false);
    }else{
        $.listView.setCanScroll(true);
    }
};
exports.toggleScrollLock = toggleScrollLock;




/**
`footerTextButtonClick` the callback function for the button click text in the qustion renderer footer
opens the userNotesDialog and populates it with the saved Assessment Notes.

@param e : not used

@return :  n/a
*/
function footerTextButtonClick(e) {
    Alloy.createController("questionDialogs/userNotesDialog", {
        notes: currentAssessmentObject.notes,
        title: "Assessment Notes",
        closeCallBack: function (notes) {
            currentAssessmentObject.notes = notes;
            Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);
        }
    });
};



/**
`footerNotesButtonClick` the callback function for the button click notes in the qustion renderer footer
triggers the slideNotify for the currently selected question to display the server notes

@param e : not used

@return :  n/a
*/
function footerNotesButtonClick(e) {

    if (questionSelected != null) {
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
            Alloy.Globals.Util.slideNotify(30, questionRef.question.alcrmNotes, false);
        }
    }
};



/**
`footerHelpButtonClick` the callback function for the button click help in the qustion renderer footer
triggers the slideNotify for the currently selected question to display the server help message

@param e : not used

@return :  n/a
*/
function footerHelpButtonClick(e) {
	
	if (questionSelected != null) {
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
        	
        	if(questionRef.question.help != ""){
        		alert(questionRef.question.help);
        	}
        }
    }
};



/**
`pageDeletedEvent` used to delete a census attached to an assessment

@param associatedFileName : (string) fileName to be deleted
 
@return :  n/a
*/
var pageDeletedEvent = function(associatedFileName){
	if(associatedFileName === $.censusFooterView.getCensusAssociatedFileName()){
    	$.censusFooterView.close();
    }
};
exports.pageDeletedEvent = pageDeletedEvent;



/**
`Ti.App.addEventListener("startCensesTimer")` fired when a used clicks start for the quick census
this will opem the census timer as a footer of the question renderer and count down based on the 
timerDuration question value

@param e.question : questionObject that files the event

@return :  true or false - depending if the timer opened or not
*/
Ti.App.addEventListener("startCensesTimer", function (e) {
    var question = e.question;

    var sectionList = getAllQuestionSections();

    var questionRef = findQuestionByAssociatedFileName("I_DURATION", question.associatedFileName);
    if (questionRef != null) {

        if (questionRef.question.value[0] == "") {

            questionRef.question = setQuestionError(false, L("duration_error_text"), questionRef.question);
            questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);
            Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
            return false;
        } else {

            var timerDuration = parseInt(questionRef.question.value[0]) * 60;
            Alloy.Globals.Logger.log("timerDuration = " + timerDuration + ", text = " + questionRef.question.value[0],"info");
            $.censusFooterView.open(timerDuration, question.groupType, question.associatedFileName);
        }
    }
    else{
    	return false;
    }
    
    var questionRef = findQuestionByAssociatedFileName("I_CENSUS_QUICK_START", question.associatedFileName);
    if (questionRef != null) {
    	var timeString = Alloy.Globals.moment().format("HH:mm");
    	questionRef.question.displayValue.value = timeString;
    	questionRef.question.value[0] = timeString;
    	
    	var questionResponse = 
		   "<ques:parameterName>"+questionRef.question.alcrmQuestionID+"</ques:parameterName>"+ 
		   "<ques:parameterValue>"+timeString+"</ques:parameterValue>"+
		   "<ques:notes>"+questionRef.question.notes+"</ques:notes>";
		questionRef.question.questionResponse = questionResponse;
		
		questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);
        Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
    }
    else{
    	return false;
    }
    return true;
});



/**
`$.censusFooterView.on("goToCensus")` fired when a used clicks go to census on the census timer footer
the list view will move to the census usage page and position the top question at the top of the screen

@param e.question : questionObject that files the event

@return :  true or false - depending if the timer opened or not
*/
$.censusFooterView.on("goToCensus", function (e) {
    e.censusAssociatedFileName;
    var section = findSectionByAssociatedFileName("CensusUsage", e.censusAssociatedFileName);
    if (section != null) {
        if (section.getItems().length >= 1) {
            moveToQuestionByName(section.getItems()[0].name, section.groupType);
        }
    }

});



/**
`updateAndReturnQuestion` fired when a used clicks go to census on the census timer footer
//the list view will move to the census usage page and position the top question at the top of the screen

@param question : questionObject to be updated
@param value : (string) value to be set
@param displayValue : (string) value to populate the textField

@return :  true or false - depending if the timer opened or not
*/
var updateAndReturnQuestion = function (question, value, displayValue) {
    if (question.template == "singleSelectTemplate") {
        question.displayValue = {
            value: displayValue
        };
        question.value = [displayValue];

        var questionResponse =
            "<ques:parameterName>" + question.alcrmQuestionID + "</ques:parameterName>" +
            "<ques:parameterValue>" + value + "</ques:parameterValue>";

        question.questionResponse = questionResponse;
    }
    return question;
};


/**
`Ti.App.addEventListener("setEntireSectionTemplate")` fired when a used clicks go to census on the census timer footer
the list view will move to the census usage page and position the top question at the top of the screen

@param e.groupType : question groupType to match
@param e.value : (string) value to be set
@param e.questionToChangeTemplate : (string) template name to match

@return :  n/a
*/
Ti.App.addEventListener("setEntireSectionTemplate", function (e) {

    var sectionList = getAllQuestionSections();

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType != e.groupType) continue;

        var questionList = sectionList[sectionIndex].getItems();
        for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].getItems().length; questionIndex++) {
        	
            if (questionList[questionIndex].template == e.questionToChangeTemplate) {
                var updatedQuestion = updateAndReturnQuestion(questionList[questionIndex], e.value, e.displayValue);
                sectionList[sectionIndex].updateItemAt(questionIndex, updatedQuestion);
            }
        }
    }

});



/**
`selectQuestion` updates the new question to be selected and removed the ui changes for the last selected question

@param newQuestionSelected : the new questionObject to select
 
@return :  QuestionObject
*/
var selectQuestion = function (newQuestionSelected) {
    var sectionList = getAllQuestionSections();


    if (questionSelected != null) {
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
        	if(questionRef.question.readOnly == false){
            
	            questionRef.question.headerView = Alloy.Globals.Styles["headerViewDefult"];	    		
	            questionRef.question.selected = false;
	            questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);

	            Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
           }
        }
    }
    
    questionSelected = newQuestionSelected;

    Alloy.Globals.Logger.log("new questionSelected title = " + questionSelected.title.text,"info");

    var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
    if (questionRef != null) {
    	if(questionRef.question.readOnly == false){
	        questionRef.question.headerView = Alloy.Globals.Styles["headerViewSelected"];
	        
	        questionRef.question.selected = true;
	        questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);
	        newQuestionSelected = questionRef.question;
	        Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
	       }
    }

    return newQuestionSelected;
};
exports.selectQuestion = selectQuestion;



/**
`footerPostlayout` callback when census timer footer has finshed it height change
resets the list view so there is not overlap

@param e : not used

@return :  n/a
*/
function footerPostlayout(e) {
    $.listView.bottom = $.footer.size.height;
};