var INDEX_FILE_VERSION_NUM = 8;

/**
`localDataHandler` deals with the lifetime of local files used to
& store/retrieve/manage data locally

@class localDataHandler
*/
function localDataHandler() {
    var self = this;

    var testEnvironment = false;
    
/**
`setTestEnvironment`

@method setTestEnvironment

@param {boolean} isTesting

@return {} n/a
*/
    self.setTestEnvironment = function(isTesting) {
        testEnvironment = isTesting;
    };

/**
`getWorkingDirectory` will get the Directory all files will be read from, this is ether the users Directory or the test Directory

@method getWorkingDirectory

@return {} n/a
*/
    self.getWorkingDirectory = function() {

        var workingDirectory = "";
        if (testEnvironment == false) {
            workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, Alloy.Globals.User.getUserDir());
            return workingDirectory.nativePath;
        } else {
            workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "testDirectory");
            return workingDirectory.nativePath;
        }
    };

/**
`cacheCrossingSearch` saves the CrossingSearch results so you do not need to make repeated requestes

@method cacheCrossingSearch

@param {JSON_List} payload

@return {} n/a
*/ 
    self.cacheCrossingSearch = function(payload) {
        try {
            var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");
            crossingsFile.write(JSON.stringify(payload));
            crossingsFile = null;
        } catch (e) {
			Alloy.Globals.Logger.logException(e);
            Alloy.Globals.aIndicator.hide();
        }
    };

/**
`clearCachedCrossing`

@method clearCachedCrossing

@return {} n/a
*/ 
    self.clearCachedCrossing = function() {
        var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");

        if (crossingsFile.exists()) {
            crossingsFile.deleteFile();
            crossingsFile = null;
        }

    };

/**
`loadCachedCrossingSearch` returns a saved list of corssings

@method loadCachedCrossingSearch

@return {JSON_List} 
*/ 
    self.loadCachedCrossingSearch = function() {
        try {
            var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");
            if (crossingsFile.exists()) {
                crossingsFileContents = crossingsFile.read().text;
                crossingsFile = null;
                return JSON.parse(crossingsFileContents);
            } else {
                return [];
            }
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            return [];
        }
    };


/**
`clearAllSavedAssessments` will clear all assessments for the working Directory. this will delete all files related to each assessments

@method clearAllSavedAssessments

@return {} n/a
*/ 
    self.clearAllSavedAssessments = function() {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "assessmentIndex.json");
        var savedAssessments = [];
        if (!indexFile.exists()) {
            return;
        } else {
            savedAssessments = JSON.parse(indexFile.read());
            indexFile.deleteFile();
        }

        for (var i = 0; i < savedAssessments.length; i++) {
            self.removeAssessment(savedAssessments[i]);
        }

        indexFile.write(JSON.stringify([]));
    };

/**
`getAllSavedAssessments` get all assessments for the working Directory.  

@method getAllSavedAssessments

@return {JSON_List} savedAssessments
*/ 
    self.getAllSavedAssessments = function() {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

/**
`updateSavedAssessments` will update all the saved assessments detailed with savedAssessments. 
must NOT be used to delete assessments

@method updateSavedAssessments

@param {JSON_List} savedAssessments

@return {} n/a
*/   
    self.updateSavedAssessments = function(savedAssessments) {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

/**
`updateQuestion` will update the saved copy of the  question in the relevent save file

@method updateQuestion

@param {JSON_Object} question

@return {boolean} fail or succeed
*/   
    self.updateQuestion = function(question) {
        try {
            var savedAssessments = self.getAllSavedAssessments();
            var refToSaveAssessmentIndex = null;
            for (var savedAssementIndex = 0; savedAssementIndex < savedAssessments.length; savedAssementIndex++) {
                if (savedAssessments[savedAssementIndex].assessmentID === question.assessmentId) {
                    refToSaveAssessmentIndex = savedAssementIndex;
                    break;
                }
            }
            var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + question.associatedFileName);
            if (assessmentFile.exists()) {
                var sectionList = JSON.parse(assessmentFile.read().text);

                var questionFound = false;
                var foundIndex = null;
                var foundSectionIndex = null;
                for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true; sectionIndex++) {

                    if (sectionList[sectionIndex].alcrmGroupType == question.alcrmGroupType) {
                        var questionList = sectionList[sectionIndex].questionList;

                        for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true; questionIndex++) {
                            if (sectionList[sectionIndex].questionList[questionIndex] &&
                                sectionList[sectionIndex].questionList[questionIndex].hasOwnProperty('name') &&
                                sectionList[sectionIndex].questionList[questionIndex].name == question.name) {

                                foundIndex = questionIndex;
                                foundSectionIndex = sectionIndex;
                                questionFound = true;
                                break;
                            }
                        }
                    }
                }

                if (questionFound == false) {
                    Alloy.Globals.Logger.log("updateQuestion : question not found ", "info");
                } else {
                	Ti.API.info("updateQuestion question.value = "+question.value[0]);
                    sectionList[foundSectionIndex].questionList[foundIndex] = question;
                }

                self.updateSavedAssessments(savedAssessments);

                assessmentFile.deleteFile();
                assessmentFile.write(JSON.stringify(sectionList));

                return true;
            }
            Alloy.Globals.Logger.log("ERROR - assessmentFile does not exists", "info");
            return false;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("An exception occured in updateQuestion. Error Details: " + JSON.stringify(e), "info");
        }
    };
    
    
    /**
	`updateQuestionsSelectedInSavedFile` will set this question to seleted, and change all others to not in specified file
	called by setQuestionToSelected
	
	@method updateQuestionsSelectedInSavedFile
	
	@param {JSON_Object} question
	@param {String} fileName
	
	@return {} n/a
	*/
    var updateQuestionsSelectedInSavedFile = function(question, fileName){
    	var file = Ti.Filesystem.getFile(self.getWorkingDirectory() + fileName);
        if (file.exists()) {
        	var sectionList = JSON.parse(file.read().text);
        	for (var sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {

	            if (sectionList[sectionIndex].alcrmGroupType == question.alcrmGroupType) {
	                var questionList = sectionList[sectionIndex].questionList;
	
	                for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length; questionIndex++) {
	                	if(sectionList[sectionIndex].questionList[questionIndex] === null)continue;
	                	if(sectionList[sectionIndex].questionList[questionIndex].hasOwnProperty('name') === false)continue;
	                	if(sectionList[sectionIndex].questionList[questionIndex].hasOwnProperty('selected') === false)continue;
	                	
	                    if(sectionList[sectionIndex].questionList[questionIndex].name === question.name){
	                    	//alert("question Found");
	                    	sectionList[sectionIndex].questionList[questionIndex] = question;
	                    	sectionList[sectionIndex].questionList[questionIndex].selected = true;
	                    }
	                    else{
	                    	sectionList[sectionIndex].questionList[questionIndex].selected = false;
	                    }
	                }
	            }
	        }
	        
	        file.write(JSON.stringify(sectionList));
        }
        else{
        	return;
        }
            
    };
    
    /**
	`setQuestionToSelected` will set this question to seleted, and change all others to not. only to be called on save and exit
	
	@method setQuestionToSelected
	
	@param {JSON_Object} question
	@param {JSON_Object} assessmentObject
	
	@return {} n/a
	*/
    self.setQuestionSelected = function(question, assessmentObject){
    	if(question === null)return;
    	
    	assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
    	
    	updateQuestionsSelectedInSavedFile(question, assessmentObject.mainQuestionsfileName);
    	
    	for(var i=0; i< assessmentObject.censusQuestionsfileNameList.length; i++){
    		updateQuestionsSelectedInSavedFile(question, assessmentObject.censusQuestionsfileNameList[i]);
    	}
    	for(var i=0; i< assessmentObject.trainGroupQuestionsfileNameList.length; i++){
    		updateQuestionsSelectedInSavedFile(question, assessmentObject.trainGroupQuestionsfileNameList[i]);
    	}
    	
    };
    
    
/**
`setQuestionToMandatory` will update a question to be Mandatory 

@method setQuestionToMandatory

@param {JSON_Object} questionObject

@return {JSON_Object} questionObject
*/  
	self.setQuestionToMandatory = function(questionObject){
		
		questionObject.mandatory = true;

        if (questionObject.title.text.slice(-1) != "*") {
            questionObject.title.text = questionObject.title.text + "*";
            questionObject.title.font.fontWeight = "bold";
        }
		self.updateQuestion(questionObject);
		return questionObject;
	};

/**
`updateSingleAssessmentIndexEntry` will update a assessment with the same assessmentID as the assessmentObject passed

@method updateSingleAssessmentIndexEntry

@param {JSON_Object} assessmentObject

@return {} n/a
*/ 
    self.updateSingleAssessmentIndexEntry = function(assessmentObject) {
        try {

            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {
                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                    savedAssessments[i] = assessmentObject;
                }
            }
            self.updateSavedAssessments(savedAssessments);
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception in updateSingleAssessmentIndexEntry. Error details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return;
        }
    };

/**
`getMostUpTodateAssessmentObject` will get the most uptodate assessment from file with the same assessmentID as the assessmentObject.assessmentID passed

@method getMostUpTodateAssessmentObject

@param {JSON_Object} assessmentObject

@return {JSON_Object} assessmentObject
*/
    self.getMostUpTodateAssessmentObject = function(assessmentObject) {
        try {
            var savedAssessments = self.getAllSavedAssessments();
            for (var i = 0; i < savedAssessments.length; i++) {
                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                    assessmentObject = savedAssessments[i];
                    break;
                }
            }
            return assessmentObject;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception in getMostUpTodateAssessmentObject. Error details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return assessmentObject;
        }
    };


/**
`setAssessmentCompleted` changes the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
to say that it has been submitted

@method setAssessmentCompleted

@param {JSON_Object} assessmentObject

@return {} n/a
*/
    self.setAssessmentCompleted = function(assessmentObject) {
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i].isSubmitted = true;
                self.updateSavedAssessments(savedAssessments);
                return;
            }
        }
    };


/**
`addNewAssessment` creates a new assessment in the working Directory with the passed variables 

@method addNewAssessment

@param {JSON_Object} JASON_question_list
@param {String} crossingName
@param {String} detailID
@param {String} crossingID
@param {JSON_Map} quesMap

@return {JSON_Object} assessmentObject
*/

    self.addNewAssessment = function(JASON_question_list, crossingName, detailID, crossingID, quesMap /*defaultCensusQuestions, defaultTrainInfoQuestions*/ ) {
        try {
            var savedAssessments = self.getAllSavedAssessments();

            var mandatoryQuestionCount = 0;
            for (var i = 0; i < JASON_question_list.length; i++) {
                var isMandatory = Alloy.Globals.localParser.getQuestionMandatory(JASON_question_list[i]);
                if (isMandatory == true) {
                    mandatoryQuestionCount++;
                }
            }

            var assessmentID = new Date().getTime();
            var newAssessment = {
                versionID: INDEX_FILE_VERSION_NUM,
                assessmentID: assessmentID,
                mainQuestionsfileName: assessmentID + "mainQuestions.json",
                coreQuestionsFileName: null,

                censusQuestionsfileNameList: [],
                trainGroupQuestionsfileNameList: [],
                trainGroupLastPageID: 1,
                crossingName: crossingName,
                crossingID: crossingID,
                questionCount: mandatoryQuestionCount,
                questionsCompleted: 0,
                alcrmStatus: "not sent",
                notes: "",
                detailID: detailID,

                censusDesktopComplete: false,


                isSubmitted: false,
                defaultCensusQuestions: [],
                defaultTrainInfoQuestions: []

            };
            savedAssessments.push(newAssessment);

            self.updateSavedAssessments(savedAssessments);

            var newAssessmentFileName = newAssessment.mainQuestionsfileName;
            var newAssessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + newAssessmentFileName);

            var newQuestionSet = Alloy.Globals.interpreter.interpret(JASON_question_list, {
                associatedFileName: newAssessment.mainQuestionsfileName,
                pageName: L("page_risk_assessment_name"),
                pageID: 0,
                pageType: "riskAssessment",
                readOnly: false,
                assessmentId: assessmentID,
                questionMap: quesMap
            });

            newAssessmentFile.write(JSON.stringify(newQuestionSet));
            return newAssessment;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception in addNewAssessment. Error details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return;
        }
    };


/**
`addNewAssessment` addes a Default Census question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed

@method addNewAssessment

@param {JSON_Object} assessmentObject
@param {JSON_List} defaultQuestionSet

@return {boolean} fail or succeed
*/
    self.addDefaultCensus = function(assessmentObject, defaultQuestionSet) {
        try {
            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {
                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                    savedAssessments[i].defaultCensusQuestions = defaultQuestionSet;
                    self.updateSavedAssessments(savedAssessments);
                    return true;
                }
            }
            return false;
        } catch (e) {
            Alloy.Globals.Logger.log("Exception occured in addDefaultCensus. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return false;
        }
    };


/**
`addDefaultTrainInfo` addes a Default train question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 

@method addDefaultTrainInfo

@param {JSON_Object} assessmentObject
@param {JSON_List} defaultQuestionSet

@return {boolean} fail or succeed
*/
    self.addDefaultTrainInfo = function(assessmentObject, defaultQuestionSet) {
        try {
            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {
                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                    savedAssessments[i].defaultTrainInfoQuestions = defaultQuestionSet;
                    self.updateSavedAssessments(savedAssessments);
                    return true;
                }
            }
            return false;
        } catch (e) {
            Alloy.Globals.Logger.log("Exception occured in addDefaultTrainInfo. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return false;
        }
    };

/**
`addNewCoreQuestionToAssessment` adds a core question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed  

@method addNewCoreQuestionToAssessment

@param {JSON_Object} assessmentObject
@param {JSON_List} defaultQuestionSet
@param {JSON_map} questionMap

@return {JSON_List} question set
*/
    self.addNewCoreQuestionToAssessment = function(assessmentObject, JASON_question_list, questionMap) {
        try {
            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {

                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                    var newCoreQuestionsFileName = assessmentObject.assessmentID + "CoreQuestions.json";

                    var newCoreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + newCoreQuestionsFileName);
                    savedAssessments[i].coreQuestionsFileName = newCoreQuestionsFileName;


                    var newCoreQuestionSet = Alloy.Globals.interpreter.interpret(JASON_question_list, {
                        associatedFileName: newCoreQuestionsFileName,
                        pageName: L("page_core_question_name"),
                        pageID: 0,
                        pageType: "coreQuestion",
                        readOnly: true,
                        assessmentId: assessmentObject.assessmentID,
                        questionMap: questionMap
                    });

                    newCoreQuestionsFile.write(
                        JSON.stringify(
                            newCoreQuestionSet
                        )
                    );

                    self.updateSavedAssessments(savedAssessments);

                    return newCoreQuestionSet;
                }
            }

            return [];
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in addNewCoreQuestionToAssessment. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
            return [];
        }
    };


/**
`addNewCensusToAssessment` adds a new Census question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed
 the new Census uses the saved default Census Questions set for this assessment

@method addNewCensusToAssessment

@param {JSON_Object} assessmentObject
@param {JSON_map} censusMap

@return {JSON_List} newCensusQuestionSet
*/
    self.addNewCensusToAssessment = function(assessmentObject, censusMap) {

        try {
            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {

                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                    var censusPageNum = savedAssessments[i].censusQuestionsfileNameList.length + 1;
                    var newCensusFileName = assessmentObject.assessmentID + censusPageNum + "CensusQuestions.json";
                    var newCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + newCensusFileName);
                    savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);

                    var newCensusQuestionSet = Alloy.Globals.interpreter.interpret(savedAssessments[i].defaultCensusQuestions, {
                        associatedFileName: newCensusFileName,
                        pageName: L("page_census_name") + " " + censusPageNum,
                        pageID: censusPageNum,
                        pageType: "census",
                        readOnly: false,
                        assessmentId: assessmentObject.assessmentID,
                        questionMap: censusMap
                    });

                    newCensusFile.write(
                        JSON.stringify(
                            newCensusQuestionSet
                        )
                    );
                    
                    self.updateSavedAssessments(savedAssessments);

                    return newCensusQuestionSet;
                }
            }

            return [];
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.aIndicator.hide();
            Alloy.Globals.Logger.log("exception addNewCensusToAssessment >> - " + JSON.stringify(e), "info");
            return [];
        }
    };


/**
`checkIfCensusIsDone` check if census is done for an assessment that matches the assessmentID as the assessmentObject passed 

@method checkIfCensusIsDone

@param {JSON_Object} assessmentObject

@return {} n/a
*/
    self.checkIfCensusIsDone = function(assessmentObject) {

        var censusDone = true;
        var censusQuestions = [];

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                censusQuestions.push(
                    JSON.parse(censusQuestionFile.read().text)
                );
            }
        }

        for (var i = 0; i < censusQuestions.length; i++) {
            var questionList = censusQuestions[i].questionList;
            for (var t = 0; t < questionList.length; t++) {
                if (questionList[t].isAQuestion == true) {
                    if (questionList[t].value == []) {
                        Alloy.Globals.Logger.log("ANDY to sort ROW Stuff ? You must complete the census questions. Change this to yes/no.", "error");
                        return;
                    }

                }
            }
        }
    };

/**
`createAssessmentPDFResponse` creates an object needed from the saved assessment that is needed by the server to create a PDF doc

@method createAssessmentPDFResponse

@param {JSON_Object} assessmentObject

@return {JSON_List} 
*/
    self.createAssessmentPDFResponse = function(assessmentObject) {

        var returnQuestionObj = {
            assessmentNotes: assessmentObject.notes,
            coreCrossingSet: new Array(),
            mainQuestionSet: new Array(),
            individualCensusList: [],
            individualTrainList: []
        };
        
        if (assessmentObject.coreQuestionsFileName !== null) {
	    	var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.coreQuestionsFileName);
	        if (coreQuestionsFile.exists()) {
	         	 returnQuestionObj.coreCrossingSet.push(
                    JSON.parse(coreQuestionsFile.read().text)
                );
	        }
	    }

        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName);

        if (assessmentFile.exists()) {
            returnQuestionObj.mainQuestionSet = JSON.parse(assessmentFile.read().text);
        }

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                returnQuestionObj.individualCensusList.push(
                    JSON.parse(censusQuestionFile.read().text)
                );
            }
        }

        for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
            var trainGroupQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.trainGroupQuestionsfileNameList[i]);
            if (trainGroupQuestionFile.exists()) {
                returnQuestionObj.individualTrainList.push(
                    JSON.parse(trainGroupQuestionFile.read().text)
                );
            }
        }
		//alert("returnQuestionObj.coreCrossingSet >>>> "+JSON.stringify(returnQuestionObj.coreCrossingSet));
        return returnQuestionObj;
    };

/**
`addNewTrainGroupToAssessment` adds a new train group question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed
the new TrainGroup uses the saved default TrainGroup Questions set for this assessment
    
@method addNewTrainGroupToAssessment

@param {JSON_Object} assessmentObject
@param {JSON_Map} trainGroupMap

@return {JSON_List} newTrainInfoQuestionSet
*/
    
    self.addNewTrainGroupToAssessment = function(assessmentObject, trainGroupMap) {
        try {

            var savedAssessments = self.getAllSavedAssessments();

            for (var i = 0; i < savedAssessments.length; i++) {
                if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                    var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID + "TrainGroupQuestions.json";
                    var newTrainGroupFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + newTrainGroupFileName);
                    savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);

                    var newTrainInfoQuestionSet = Alloy.Globals.interpreter.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
                        associatedFileName: newTrainGroupFileName,
                        pageName: L("page_train_info_name") + " " + savedAssessments[i].trainGroupLastPageID,
                        pageID: savedAssessments[i].trainGroupLastPageID,
                        pageType: "trainInfo",
                        readOnly: false,
                        questionMap: []
                    });

                    newTrainGroupFile.write(
                        JSON.stringify(
                            newTrainInfoQuestionSet
                        )
                    );

                    savedAssessments[i].trainGroupLastPageID = parseInt(savedAssessments[i].trainGroupLastPageID) + 1;
                    self.updateSavedAssessments(savedAssessments);

                    return newTrainInfoQuestionSet;
                }
            }
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in addNewTrainGroupToAssessment. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }


    };

/**
`removeAssessment` deletes all local content for an assessment that matches the assessmentID as the assessmentObject.assessmentID passed
    
@method removeAssessment

@param {JSON_Object} assessmentObject

@return {boolean} fail or succeed
*/ 
    self.removeAssessment = function(assessmentObject) {
		try {
	        var savedAssessments = self.getAllSavedAssessments();
	
	        for (var i = 0; i < savedAssessments.length; i++) {
	            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
	
	                var mainQuestionsfile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName);
	                if (mainQuestionsfile.exists()) {
	                	Alloy.Globals.Logger.log("mainQuestions File deleted : " + self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName, "info");
	                    mainQuestionsfile.deleteFile();
	                }
	                else{
	                	Alloy.Globals.Logger.log("could not deleted mainQuestions File  : " + self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName, "error");
	                }
	
	                if (assessmentObject.coreQuestionsFileName !== null) {
	                    var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.coreQuestionsFileName);
	                    if (coreQuestionsFile.exists()) {
	                    	Alloy.Globals.Logger.log("coreQuestions File deleted : " + self.getWorkingDirectory() + assessmentObject.coreQuestionsFileName, "info");
	                        coreQuestionsFile.deleteFile();
	                    }
	                    else{
	                		Alloy.Globals.Logger.log("could not deleted coreQuestions File  : " + self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName, "error");
	                	}
	                }
	                
	
	                for(var trainGroupfileIndex =0; trainGroupfileIndex < assessmentObject.trainGroupQuestionsfileNameList.length; trainGroupfileIndex++){
	                	var file = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.trainGroupQuestionsfileNameList[trainGroupfileIndex]);
	                	if (file.exists()) {
	                		Alloy.Globals.Logger.log("trainGroup file deleted : " + self.getWorkingDirectory() + assessmentObject.trainGroupQuestionsfileNameList[trainGroupfileIndex], "info");
	                    	file.deleteFile();
	                    }
	                    else{
	                		Alloy.Globals.Logger.log("could not deleted trainGroup File  : " + self.getWorkingDirectory() + assessmentObject.trainGroupQuestionsfileNameList[trainGroupfileIndex], "error");
	                	}
	                }
	                
	                for(var censusfileIndex =0; censusfileIndex < assessmentObject.censusQuestionsfileNameList.length; censusfileIndex++){
	                	var file = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[censusfileIndex]);
	                	if (file.exists()) {
	                		Alloy.Globals.Logger.log("censusfile deleted : " + self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[censusfileIndex], "info");
	                    	file.deleteFile();
	                    }
	                    else{
	                		Alloy.Globals.Logger.log("could not deleted censusfile File  : " + self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[censusfileIndex], "error");
	                	}
	                }
	
	                savedAssessments.splice(i, 1);
	
	                self.updateSavedAssessments(savedAssessments);
	                return true;
	            }
	        }
	
	        return false;
        } 
        catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in removeAssessment. Error Details: " + JSON.stringify(e), "error");
            return false;
        }
    };

/**
`getAllCensusesOrTrains` Censuses Or Trains questions sets for an assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    
@method getAllCensusesOrTrains

@param {Int} type

@return {JSOn_List} CensusesOrTrains lists
*/ 
    self.getAllCensusesOrTrains = function(assessmentObject, type) {
        try {
            var getAllData = [];

            switch (type) {
                case 0: //census
                    var censusQuestionsfileNameList = assessmentObject.censusQuestionsfileNameList;
                    for (var i = 0; i < censusQuestionsfileNameList.length; i++) {
                        //read each file here
                        var currentCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + censusQuestionsfileNameList[i]);
                        if (!currentCensusFile.exists) {
                            Alloy.Globals.Logger.log("getAllCensusesOrTrains - cant open currentCensusfile " + censusQuestionsfileNameList[i], "error");
                        } else {
                            var currentContents = currentCensusFile.read().text;
                            getAllData.push(
                                JSON.parse(currentContents)
                            );
                        }
                    }
                    break;
                case 1: //trains
                    var trainGroupQuestionsfileNameList = assessmentObject.trainGroupQuestionsfileNameList;
                    for (var i = 0; i < trainGroupQuestionsfileNameList.length; i++) {
                        //read each file here
                        var currentTrainFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + trainGroupQuestionsfileNameList[i]);
                        if (!currentTrainFile.exists) {
                            Alloy.Globals.Logger.log("getAllCensusesOrTrains - cant open currentTrainFile " + trainGroupQuestionsfileNameList[i], "error");
                        } else {
                            var currentContents = currentTrainFile.read().text;
                            getAllData.push(
                                JSON.parse(currentContents)
                            );
                        }
                    }
                    break;

            }
            Alloy.Globals.Logger.log("getAllCensusesOrTrains returns => " + JSON.stringify(getAllData), "error");
            return getAllData;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in getAllCensusesOrTrains. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }
    };


/**
`deleteAssociatedFileNameFromAssessment` deletes a file attached to an assessment 

@method deleteAssociatedFileNameFromAssessment

@param {JSON_Object} assessmentObject

@return {boolean} fail or succeed
*/
    self.deleteAssociatedFileNameFromAssessment = function(assessmentObject, associatedFileName) {
        try {
            assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

            for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
                if (associatedFileName == assessmentObject.censusQuestionsfileNameList[i]) {
                    var file = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[i]);
                    if (file.exists() == true) {
                        file.deleteFile();
                    }
                    assessmentObject.censusQuestionsfileNameList.splice(i, 1);
                    self.updateSingleAssessmentIndexEntry(assessmentObject);
                    return true;
                }
            }

            return false;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in deleteAssociatedFileNameFromAssessment. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }

    };
    
    
    
    self.removeAllAttachedCensuses= function(assessmentObject){
    	assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
    	for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
    		var file = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[i]);
            if (file.exists() == true) {
                file.deleteFile();
            }
    	}
    	
    	assessmentObject.censusQuestionsfileNameList = [];
    	self.updateSingleAssessmentIndexEntry(assessmentObject);
    };


/**
`getMainRiskAssessmentQuestions` get the main question set for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed

@method getMainRiskAssessmentQuestions

@param {JSON_Object} assessmentObject

@return {JSON_List} returnQuestionSet
*/
    
    self.getMainRiskAssessmentQuestions = function(assessmentObject) {
        try {
            var returnQuestionSet = [];

            if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
                Alloy.Globals.Logger.log("assessment file format is out of date, continued use of this assessment may cause errors", "info");
            }

            assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);


            var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName);
            if (assessmentFile.exists()) {
                var assessment = JSON.parse(assessmentFile.read().text);
                returnQuestionSet = returnQuestionSet.concat(assessment);
            }

            return returnQuestionSet;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in getMainRiskAssessmentQuestions. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }
    };
 
 
 /**
`getQuestionCountForFile` 

@method getQuestionCountForFile

@param {String} assessmentFileName
@param {JSON_Object} assessmentObject

@return {JSON_Object} assessmentObject
*/   
    var getQuestionCountForFile = function(assessmentFileName, assessmentObject){
    	var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentFileName);
	    if (assessmentFile.exists()) {
	        var sectionList = JSON.parse(assessmentFile.read().text);
	        for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
	            if (sectionList[sectionListIndex].alcrmGroupType === "CrossingGeneral") {
	                continue;
	            } else {
	                //get the questionList
	                var questionList = sectionList[sectionListIndex].questionList;
	                for (var questionListIndex = 0; questionListIndex < questionList.length; questionListIndex++) {
	
	                    //Count the Mandatory
	                    if (questionList[questionListIndex].mandatory == true ||
	                        questionList[questionListIndex].mandatory == "true") {
	                        assessmentObject.questionCount++;
	
	
	                        if (typeof questionList[questionListIndex].value === "undefined") continue;
	                        if (!(questionList[questionListIndex].value instanceof Array)) continue;
	                        if (questionList[questionListIndex].value.length <= 0) continue;
	                        if (questionList[questionListIndex].questionResponse != null) {
	                            assessmentObject.questionsCompleted++;
	                        }
	                    }
	                } 
	            } 
	        }
	    }
	    return assessmentObject;
    };


 /**
`updateQuestionCount` updates the number of answers mandatory questions for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed

@method updateQuestionCount

@param {JSON_Object} assessmentObject

@return {JSON_List} returnQuestionSet
*/  
    self.updateQuestionCount = function(assessmentObject) {
        try {
            var returnQuestionSet = [];
            assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
            
            assessmentObject.questionCount = 0;
            assessmentObject.questionsCompleted = 0;
            
           	assessmentObject =  getQuestionCountForFile(assessmentObject.mainQuestionsfileName, assessmentObject);
            for(var i =0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++){
            	assessmentObject =  getQuestionCountForFile(assessmentObject.trainGroupQuestionsfileNameList[i], assessmentObject);
            }
            
            for(var i =0; i < assessmentObject.censusQuestionsfileNameList.length; i++){
                assessmentObject =  getQuestionCountForFile(assessmentObject.censusQuestionsfileNameList[i], assessmentObject);
            }

            self.updateSingleAssessmentIndexEntry(assessmentObject);
            return assessmentObject;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("Exception occured in updateQuestionCount. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }
    };


 /**
`openAssessment` gets all questions for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed

@method openAssessment

@param {JSON_Object} assessmentObject

@return {JSON_List} returnQuestionSet
*/ 
    
    self.openAssessment = function(assessmentObject) {
        try {
            var returnQuestionSet = [];

            if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
                Alloy.Globals.Logger.log("assessment file format is out of date, continued use of this assessment may cause errors", "info");
            }

            assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

            if (assessmentObject.coreQuestionsFileName != null) {
                var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.coreQuestionsFileName);
                if (coreQuestionsFile.exists()) {
                    var coreQuestions = JSON.parse(coreQuestionsFile.read().text);
                    returnQuestionSet = returnQuestionSet.concat(coreQuestions);
                }
            }

            if (assessmentObject.mainQuestionsfileName != null) {
                var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.mainQuestionsfileName);
                if (assessmentFile.exists()) {
                    var assessment = JSON.parse(assessmentFile.read().text);
                    returnQuestionSet = returnQuestionSet.concat(assessment);
                }
            }


            for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
                var trainGroupQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.trainGroupQuestionsfileNameList[i]);
                if (trainGroupQuestionFile.exists()) {
                    var trainGroupQuestions = JSON.parse(trainGroupQuestionFile.read().text);
                    returnQuestionSet = returnQuestionSet.concat(trainGroupQuestions);
                }
            }


            for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
                var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + assessmentObject.censusQuestionsfileNameList[i]);

                if (censusQuestionFile.exists()) {
                    var censusQuestions = JSON.parse(censusQuestionFile.read().text);
                    returnQuestionSet = returnQuestionSet.concat(censusQuestions);

                }
            }
            return returnQuestionSet;
        } catch (e) {
        	Alloy.Globals.Logger.logException(e);
            Alloy.Globals.Logger.log("An exception occured in openAssessment. Error Details: " + JSON.stringify(e), "info");
            Alloy.Globals.aIndicator.hide();
        }
    };
}

module.exports = new localDataHandler;