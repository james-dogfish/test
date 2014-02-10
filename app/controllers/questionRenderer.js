//REQUIRES
//var Validator = require('validator/Validator');
//var Alloy.Globals.Styles = require('styles/styles');
//var Alloy.Globals.localDataHandler = require('Alloy.Globals.localDataHandler/Alloy.Globals.localDataHandler');
//var Alloy.Globals.User = require('core/Alloy.Globals.User');
//END OF REQUIRES

Alloy.Globals.currentlyFocusedTF = null; // Will store the currently focused textfield

//var userPreferences = Alloy.Globals.User.getPreferences();
var hiddenQuestions = [];
var allSections = [];
var currentAssessmentObject = null;

//questionSelected is used for the move to lastQuestion
//when a question is selected this value is updated
var questionSelected = null;

var ALL_SECTIONS = 1;
var SINGLE_SECTIONS = 2;

var currentSingleSectionIndex = 0;
var listViewDisplayType = ALL_SECTIONS;

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
    //alert("not found " +questionName);
    return null;
};


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

var newFindQuestionObject = function (questionName, groupType) {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType == groupType) {
            var questionList = sectionList[sectionIndex].getItems();
            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name == questionName) {
                    //return questionList[questionIndex].value;
                    return questionList[questionIndex];
                }
            }
        }
    }
    return null;
};

var newTestDependentQuestions = function (questionObject) {
	
    var addToSectionMap = [];
    
    Alloy.Globals.Logger.log("addToSectionMap hiddenQuestions = "+JSON.stringify(hiddenQuestions),"info");
    
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
					Alloy.Globals.Logger.log("addToSectionMap question name = "+hiddenQuestions[questionIndex].name,"info");
                    addToSectionMap[hiddenQuestions[questionIndex].groupType].push(hiddenQuestions[questionIndex]);
                    hiddenQuestions.splice(questionIndex, 1);
                    questionIndex--;
                }
            }
        }
    }

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

        if (sectionGroupType in removeFromSectionMap) {
            Alloy.Globals.Logger.log("R sectionGroupType : " + sectionGroupType,"info");

            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name in removeFromSectionMap[sectionGroupType]) {
                    Alloy.Globals.Logger.log("remove : " + questionList[questionIndex].name,"info");
                    questionList[questionIndex].visable = false;

                    questionList[questionIndex].mandatory = newTestIfMandatory(questionList[questionIndex]);
                    questionList[questionIndex] = setQuestionToMandatory(questionList[questionIndex]);
                    Alloy.Globals.Logger.log("testMandatory : " + questionList[questionIndex].name + ", mandatory = " + questionList[questionIndex].mandatory,"info");

                    Alloy.Globals.localDataHandler.updateQuestion(questionList[questionIndex]);
                    hiddenQuestions.push(questionList[questionIndex]);
                    questionList.splice(questionIndex, 1);

                    questionIndex--;
                }
            }
        }

        if (sectionGroupType in addToSectionMap) {
            Alloy.Globals.Logger.log("----- A sectionGroupType : " + sectionGroupType + " = " + JSON.stringify(addToSectionMap[sectionGroupType]),"info");

            for (var addQuestionIndex = 0; addQuestionIndex < addToSectionMap[sectionGroupType].length; addQuestionIndex++) {

                var questionObjectToAdd = addToSectionMap[sectionGroupType][addQuestionIndex];
                var questionAdded = false;
                for (var questionIndex = 0; questionIndex < questionList.length && questionAdded != true; questionIndex++) {

                    if (parseInt(questionObjectToAdd.order) < parseInt(questionList[questionIndex].order)) {

                        questionObjectToAdd.visable = true;

                        questionObjectToAdd.mandatory = newTestIfMandatory(questionObjectToAdd);
                        questionObjectToAdd = setQuestionToMandatory(questionObjectToAdd);
                        Alloy.Globals.Logger.log("testMandatory : " + questionObjectToAdd.name + ", mandatory = " + questionObjectToAdd.mandatory,"info");

                        Alloy.Globals.localDataHandler.updateQuestion(questionObjectToAdd);


                        questionList.splice(questionIndex, 0, questionObjectToAdd);
                        Alloy.Globals.Logger.log("added splice: " + questionObjectToAdd.name,"info");
                        questionAdded = true;
                    }
                }
                if (questionAdded == false) {
                    questionObjectToAdd.visable = true;

                    questionObjectToAdd.mandatory = newTestIfMandatory(questionObjectToAdd);
                    questionObjectToAdd = setQuestionToMandatory(questionObjectToAdd);
                    Alloy.Globals.Logger.log("testMandatory : " + questionObjectToAdd.name + ", mandatory = " + questionObjectToAdd.mandatory,"info");

                    Alloy.Globals.localDataHandler.updateQuestion(questionObjectToAdd);
                    questionList.push(questionObjectToAdd);
                    Alloy.Globals.Logger.log("added push : " + questionObjectToAdd.name,"info");
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
            Alloy.Globals.Logger.log("mandatory sectionGroupType : " + sectionGroupType,"info");

            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                if (questionList[questionIndex].name in testMandatorySectionMap[sectionGroupType]) {
                    questionList[questionIndex].mandatory = newTestIfMandatory(questionList[questionIndex]);
                    Alloy.Globals.Logger.log("testMandatory : " + questionList[questionIndex].name + ", mandatory = " + questionList[questionIndex].mandatory,"info");
                    questionList[questionIndex] = setQuestionToMandatory(questionList[questionIndex]);
                    Alloy.Globals.localDataHandler.updateQuestion(questionList[questionIndex]);
                }
            }

            sectionList[sectionIndex].setItems(questionList);


        }
    }
};


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


var findQuestionByAssociatedFileName = function (alcrmQuestionID, associatedFileName) {
    var sectionList = getAllQuestionSections();

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        //Alloy.Globals.Logger.log("sectionList alcrmQuestionID "+associatedFileName+" : "+sectionList[sectionIndex].associatedFileName,"info");
        if (sectionList[sectionIndex].associatedFileName == associatedFileName) {
            var questionList = sectionList[sectionIndex].getItems();
            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {

                Alloy.Globals.Logger.log("alcrmQuestionID " + alcrmQuestionID + " : " + questionList[questionIndex].alcrmQuestionID,"info");
                if (questionList[questionIndex].alcrmQuestionID == alcrmQuestionID) {

                    //return questionList[questionIndex].value;
                    return {
                        question: questionList[questionIndex],
                        questionIndex: questionIndex,
                        section: sectionList[sectionIndex]
                    };
                }
            }
        }
    }
    return null;
};

var findSectionByAssociatedFileName = function (alcrmGroupType, associatedFileName) {
    var sectionList = getAllQuestionSections();

    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        //Alloy.Globals.Logger.log("sectionList alcrmQuestionID "+associatedFileName+" : "+sectionList[sectionIndex].associatedFileName,"info");
        if (sectionList[sectionIndex].associatedFileName == associatedFileName && sectionList[sectionIndex].alcrmGroupType == alcrmGroupType) {
            return sectionList[sectionIndex];
        }
    }
    return null;
};

var removeQuestionFromListSection = function (section, question, questionIndex) {
    question.visable = false;
    hiddenQuestions.push(question);

    var listViewAnimationProperties = {
        animated: true,
        //animationStyle : Titanium.UI.iPhone.RowAnimationStyle.RIGHT, 
        position: Titanium.UI.iPhone.ListViewScrollPosition.NONE
    };
    section.deleteItemsAt(questionIndex, 1);

    //updateSection(section);

    //e.questionIndex, e.questionObject, e.section
    question.value = [""];

    //Alloy.Globals.Logger.log("removeQuestionFromListSection = "+JSON.stringify(question),"info");

    questionValueChange({
        questionObject: question,
        questionIndex: -1,
        section: null
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

function updateSection(section) {
    var questionList = section.getItems();
    section.setItems(questionList);
}

var addItemFromHiddenList = function (hiddenListItemIndex) {
    var question = hiddenQuestions[hiddenListItemIndex];
    question.visable = true;
    var order = question.order;

    var section = null;

    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
        if (sectionList[sectionIndex].groupType == question.groupType) {
            section = sectionList[sectionIndex];
        }
    }

    if (section == null) {
        //alert("no section found to add to");

        question.visable = false;
        return hiddenListItemIndex;
    }

    var listViewAnimationProperties = {
        animated: true,
        //animationStyle : Titanium.UI.iPhone.RowAnimationStyle.LEFT , 
        position: Titanium.UI.iPhone.ListViewScrollPosition.NONE
    };

    var sectionItemList = section.getItems();
    var questionIndex = 0;
    for (var i = 0; i < sectionItemList.length; i++) {
        if (question.order < sectionItemList[i].order) {
            section.insertItemsAt(i, [question], listViewAnimationProperties);
            questionIndex = i;
            break;
        } else if (i == (sectionItemList.length - 1)) {
            questionIndex = i;
            section.insertItemsAt(i, [question], listViewAnimationProperties);


            break;
        }
    }
    //updateSection(section);
    hiddenQuestions.splice(hiddenListItemIndex, 1);

    //Alloy.Globals.Logger.log("addItemFromHiddenList = "+JSON.stringify(question),"info");

    questionValueChange({
        questionObject: question,
        questionIndex: questionIndex,
        section: section
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

exports.clear = function () {
    allSections = [];
    $.listView.setSections(allSections);
};

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

        //newQuestionsSection.headerTitle = JASON_sectionList[i].title;
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

var removeHiddenQuestions = function (JASON_sectionList) {
	try{
	    for (var sectionIndex = 0; sectionIndex < JASON_sectionList.length; sectionIndex++) {
	    	
	    	//Alloy.Globals.Logger.log("mainQuestionsfileName = "+JSON.stringify(JASON_sectionList[sectionIndex]),"info");
	        var questionList = JASON_sectionList[sectionIndex].questionList;
	        for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
				if(questionList[questionIndex] != null){
					//Alloy.Globals.Logger.log("questionList[questionIndex].visable ="+JSON.stringify(questionList[questionIndex].visable),"info");
		            if (questionList[questionIndex].visable == false) {
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
        //questionSelected.groupType = sectionList[0].groupType;
        var questionList = allSections[0].getItems();
        if (questionList > 0) {
            //questionSelected = questionList[0];
            selectQuestion(questionList[0]);
        }
    }
 }catch(e){
 	Alloy.Globals.Logger.log("Exception in setupSelectedQuestion. Error Details: "+JSON.stringify(e), "error");
	Alloy.Globals.aIndicator.hide();
 }
};

exports.setAssessment = function (JASON_sectionList, assessmentObject) {
	try{
		$.listView.setSections([]);
		//Alloy.Globals.Logger.log("setAssessment == "+JSON.stringify(JASON_sectionList),"info");
	    currentAssessmentObject = assessmentObject;
	
	    hiddenQuestions = [];
	    allSections = [];
	
	    JASON_sectionList = removeHiddenQuestions(JASON_sectionList);
	
		Ti.API.info("JASON_sectionList = "+JSON.stringify(JASON_sectionList));
	
	    sectionList = buildQuestionSections(JASON_sectionList);
	
	
	    if (Alloy.Globals.isDebugOn == true) {
	        //debugLookUpDependentQuestions(sectionList);
	    }
	
	    allSections = sectionList;
	
	
	    //removeAnyRenderOptionQuestion(data);
	    $.listView.setSections(sectionList);
	
	
	    var userPreferences = Alloy.Globals.User.getPreferences();
	    setListViewDisplayTypeToSingleSections(userPreferences.singleView);
		userPreferences = null;
		
	    setupSelectedQuestion();
	    //setup questionSelected to be the first question
	
	    // scroll to first item
	    $.listView.scrollToItem(0, 0);
	}catch(e){
		Alloy.Globals.Logger.log("Exception in setAssessment. Error Details: "+JSON.stringify(e), "error");
		Alloy.Globals.aIndicator.hide();
	}
};

exports.appendSectionsToAssessment = function (JASON_sectionList) {
    //allSections = sectionList;
    JASON_sectionList = removeHiddenQuestions(JASON_sectionList);

    appendSectionList = buildQuestionSections(JASON_sectionList);

    //removeAnyRenderOptionQuestion(appendSectionList);
    allSections = allSections.concat(appendSectionList);
    $.listView.setSections(allSections);
};

exports.removeAllSectionsWithAssociatedFileName = function (associatedFileName) {
    for (var i = 0; i < allSections.length; i++) {

    }
};

exports.moveToQuestion = function (groupType, questionIndex) {
    Alloy.Globals.Logger.log("** questionRender moveToQuestion","info");
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

var getQuestionIndexFromSection = function (questionName, section) {

    var questionList = section.getItems();

    for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
        if (questionList[questionIndex].name == questionName) {
            return questionIndex;
        }
    }
    return null;
};


var moveToQuestionByName = function (questionName, groupType) {

    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

        if (sectionList[sectionIndex].groupType == groupType) {

            var questionIndex = getQuestionIndexFromSection(questionName, sectionList[sectionIndex]);



            if (questionIndex == null) return;



            else if (listViewDisplayType == ALL_SECTIONS) {
                //$.listView.scrollToItem(sectionIndex, questionIndex);
                $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
            } else if (listViewDisplayType == SINGLE_SECTIONS) {
                setSelectedSectionForSingleSections(sectionIndex);
                //$.listView.scrollToItem(sectionIndex, questionIndex);
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

exports.goToFirstUnanswered = function () {
    //alert("goToFirstUnanswered");
    //Alloy.Globals.Logger.log("goToFirstUnanswered","info");
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
    	
    	if(sectionList[sectionIndex].pageType == "coreQuestion")continue;
    	
        var questionList = sectionList[sectionIndex].getItems();
        for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
            if (questionList[questionIndex].value[0] == "") {

                //Alloy.Globals.Logger.log("unanswered question name = "+questionList[questionIndex].name,"info");

                selectQuestion(questionList[questionIndex]);

                if (listViewDisplayType == ALL_SECTIONS) {
                    //$.listView.scrollToItem(sectionIndex, questionIndex);
                    $.listView.scrollToItem(sectionIndex, questionIndex, {
                    animated: false,
                    position: Titanium.UI.iPhone.ListViewScrollPosition.TOP
                });
                
                } else if (listViewDisplayType == SINGLE_SECTIONS) {
                    setSelectedSectionForSingleSections(sectionIndex);
                    //$.listView.scrollToItem(sectionIndex, questionIndex);
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

exports.goToLastPositiond = function () {
    //alert("goToLastPositiond, name : "+questionSelected.name+", groupType : "+questionSelected.groupType) ;
    moveToQuestionByName(questionSelected.name, questionSelected.groupType);
};

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
                //alert('isAQuestion == false');
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




var getAllQuestionSections = function () {
    return allSections;
};

//takes a section from the allSections list and sets it to be the single visable section
var setSelectedSectionForSingleSections = function (sectionsIndex) {
    currentSingleSectionIndex = sectionsIndex;
    var newSectionList = [];
    newSectionList[0] = allSections[sectionsIndex];
    //newSectionList[1] = navigationSection;

    /*
	var isBackButtonVisible = (sectionsIndex >0);
	var isNextButtonVisible = (sectionsIndex < (allSections.length - 1));
	setNavigationButtons(isBackButtonVisible , isNextButtonVisible);
	*/

    $.backButton.visible = (sectionsIndex > 0);
    $.nextButton.visible = (sectionsIndex < (allSections.length - 1));

    $.listView.setSections(newSectionList);
};

//toogles the listViewDisplayType tp be SINGLE_SECTIONS or ALL_SECTIONS
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


var getQuestionSection = function (groupType) {
    var sectionList = getAllQuestionSections();
    for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
        if (sectionList[sectionIndex].groupType == groupType) {
            return sectionList[sectionIndex];
        }
    }
    return null;
};

//to be called by validateEntireQuestion
var validateSingleQuestionValue = function (value, questionObject) {
    var returnObject = {
        isValid: true,
        outPutMessage: ""
    };
    
    

    //var validation = Alloy.Globals.localParser.getValidation(questionObject);
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

    //alert("questionObject.validation.min = "+questionObject.validation.min);
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

var setQuestionError = function (isValid, message, questionObject) {
    if (isValid == false) {

        questionObject.errorMessageVisable = true;
        //questionRefObject.question.properties.height = "145dp";
        questionObject.questionErrorMessageView = {
            height: "30dp",
            top: "5dp"
        };
        questionObject.questionErrorMessage = {
            text: message
        };
    } else {
        questionObject.errorMessageVisable = false;
        //questionRefObject.question.properties.height = "110dp";
        questionObject.questionErrorMessageView = {
            height: "0dp",
            top: "0dp"
        };
        questionObject.questionErrorMessage = {
            text: ""
        };
    }
    return questionObject;
    //section.updateItemAt(questionIndex, questionObject);
};


var validateEntireQuestion = function (questionObject) {

    //alert(JSON.stringify(questionObject));

    //var questionObject = valueChangeObject.item;
    

    var valueList = questionObject.value;
    validateResponse = {
        isValid: true,
        outPutMessage: ""
    };
    
    

    for (var valueIndex = 0; valueIndex < valueList.length; valueIndex++) {
        validateResponse = validateSingleQuestionValue(valueList[valueIndex], questionObject);
        if (validateResponse.isValid == false) {
            //alert(validateResponse.outPutMessage);
            break;
            //return false;
        }
    }

    //var questionRef = findQuestion(questionObject.name);

    if (questionObject == null) {
        //alert("questionRef == null");
        return questionObject;
    } else {

        questionObject = setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionObject);
    }

    //questionRef.question = questionObject;
    //alert("setQuestionError");
    questionObject = setQuestionError(validateResponse.isValid, validateResponse.outPutMessage, questionObject);

    return questionObject;
};

Ti.App.addEventListener("singleViewChange", function (data) {
    setListViewDisplayTypeToSingleSections(data.isSingleView);
});

/*
Ti.App.addEventListener("moveSingleSectionCurrentIndex", function(data){
	setSelectedSectionForSingleSections(currentSingleSectionIndex + data.indexMove);
});
*/

function moveSectionBackClick(e) {
    setSelectedSectionForSingleSections(currentSingleSectionIndex - 1);
};

function moveSectionNextClick(e) {
    setSelectedSectionForSingleSections(currentSingleSectionIndex + 1);
};

var questionRealTimeValidation = function(e)
{
	 e.questionObject = validateEntireQuestion(e.questionObject);
	 if (e.section != null) {
    	//alert("updateItemAt");
        e.section.updateItemAt(e.questionIndex, e.questionObject);
    }
};
exports.questionRealTimeValidation = questionRealTimeValidation;

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
            if (typeof Ti.App.Properties.getString("LastAssDate") !== "undefined" && Ti.App.Properties.getString("LastAssDate") !== null) {
                if (Ti.App.Properties.getString("LastAssDate").trim() !== "") {
                    //e.questionObject.value[0] = e.questionObject.value[0] + " " + Ti.App.Properties.getString("LastAssDate").trim();
                    if (questionTitleRef.question.displayValue.value.trim().length > 0) {
                        questionTitleRef.question.displayValue.value = questionTitleRef.question.displayValue.value.trim().replace(/(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}/g, '') + " " + Ti.App.Properties.getString("LastAssDate").trim();
                    }
                } else {
                    if (questionTitleRef.question.displayValue.value.trim().length > 0) {
                        questionTitleRef.question.displayValue.value = questionTitleRef.question.displayValue.value.trim().replace(/(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}/g, '') + " " + curDate.getDay() + "/" + (curDate.getMonth()) + 1 + "/" + curDate.getFullYear();
                    }
                }
            } else {
                if (questionTitleRef.question.displayValue.value.trim().length > 0) {
                    questionTitleRef.question.displayValue.value = questionTitleRef.question.displayValue.value.trim().replace(/(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}/g, '') + " " + curDate.getDay() + "/" + (curDate.getMonth()) + 1 + "/" + curDate.getFullYear();
                }
            }

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
	
    e.questionObject = validateEntireQuestion(e.questionObject);

    if (e.section != null) {
    	//alert("updateItemAt");
        e.section.updateItemAt(e.questionIndex, e.questionObject);
    }

	//Alloy.Globals.Logger.log("question value = "+e.questionObject.value[0],"info");
    Alloy.Globals.localDataHandler.updateQuestion(e.questionObject);


    //testIfQuestionsNeedToBeRemoved(e.questionObject);
    //testIfQuestionsNeedToBeAdded(e.questionObject);
    Alloy.Globals.Logger.log("questionRender question name = "+e.questionObject.name,"info");
    newTestDependentQuestions(e.questionObject);
 

    return e.questionObject;
};
exports.questionValueChange = questionValueChange;

var toggleScrollLock = function()
{
	if($.listView.canScroll === true){
    	$.listView.setCanScroll(false);
    }else{
        $.listView.setCanScroll(true);
    }
};

exports.toggleScrollLock = toggleScrollLock;

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

function footerNotesButtonClick(e) {

    if (questionSelected != null) {
        //Alloy.Globals.Logger.log("questionSelected title = " + questionSelected.title.text,"info");
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
            Alloy.Globals.Util.slideNotify(30, questionRef.question.alcrmNotes, false);
        }
    }
};

function footerHelpButtonClick(e) {
	
	if (questionSelected != null) {
        //Alloy.Globals.Logger.log("questionSelected title = " + questionSelected.title.text,"info");
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
        	
        	if(questionRef.question.help != ""){
        		alert(questionRef.question.help);
        	}
        	else{
        		//alert(questionRef.question.help);
        	}
        	/*
        	Alloy.createController("questionDialogs/userNotesDialog", {notes : questionRef.question.notes, title : "Question Notes",closeCallBack : function(notes){
				if(notes != ""){
					questionRef.question.notesBackground = {backgroundImage: 'images/questionSelectedNote.png'};
					questionRef.question.notes = notes; 
				}
				else{
					questionRef.question.notesBackground = {backgroundImage: 'images/questionNote.png'};
					questionRef.question.notes = ""; 
				}
				questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);
				Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
			}});
			*/
        }
    }
};

//Ti.App.addEventListener("questionValueChange", questionValueChange);

Ti.App.addEventListener("notesAdded", function (notesObject) {

    Alloy.Globals.localDataHandler.updateQuestion(
        notesObject.item
    );
    /*
	Alloy.Globals.localDataHandler.updateQuestionWithAlloy.Globals.UserNotes(
			notesObject.item.associatedFileName,
			notesObject.item
		);*/
});

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
    
    //Alloy.Globals.moment().format("HH:mm");
    
    
    
});

$.censusFooterView.on("goToCensus", function (e) {
    e.censusAssociatedFileName;
    var section = findSectionByAssociatedFileName("CensusUsage", e.censusAssociatedFileName);
    if (section != null) {
        if (section.getItems().length >= 1) {
            moveToQuestionByName(section.getItems()[0].name, section.groupType);
        }
    }

});

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


Ti.App.addEventListener("setEntireSectionTemplate", function (e) {

    //e= {groupType, value, displayValue, questionToChangeType}
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


var selectQuestion = function (newQuestionSelected) {
    var sectionList = getAllQuestionSections();

    Alloy.Globals.Logger.log("** questionRender selectQuestion","info");

    if (questionSelected != null) {
        Alloy.Globals.Logger.log("questionSelected title = " + questionSelected.title.text,"info");
        var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
        if (questionRef != null) {
        	if(questionRef.question.readOnly == false){
            //questionRef.question.headerView = {backgroundColor: "#eee"};
            
	            questionRef.question.headerView = Alloy.Globals.Styles["headerViewDefult"];
	           	//questionRef.question.headerView = $.createStyle({classes: ['headerViewSelected'] ,apiName: 'View'});
	    		
	            questionRef.question.selected = false;
	            questionRef.section.updateItemAt(questionRef.questionIndex, questionRef.question);

	            Alloy.Globals.localDataHandler.updateQuestion(questionRef.question);
           }
        }
    }

    //findQuestionsRef= function(sectionList, questionName){
    //return {questionIndex : itemIndex, question : itemsList[itemIndex], section : sectionList[sectionIndex]};


    questionSelected = newQuestionSelected;

    Alloy.Globals.Logger.log("new questionSelected title = " + questionSelected.title.text,"info");

    var questionRef = findQuestionsRef(sectionList, questionSelected.name, questionSelected.groupType);
    if (questionRef != null) {
    	if(questionRef.question.readOnly == false){
	        //questionRef.question.headerView = {backgroundColor: "#A1F7B6"};
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

function footerPostlayout(e) {
    //alert("footerHeight = " +$.footer.size.height);
    $.listView.bottom = $.footer.size.height;
};