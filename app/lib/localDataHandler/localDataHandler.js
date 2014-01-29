/*
 *
 */
var CENSUS = 0; //GLOBAL DEFINE FOR ANDY
var TRAINS = 1; //GLOBAL DEFINE FOR ANDY
var versionID;
var INDEX_FILE_VERSION_NUM = 7;

function localDataHandler() {
    var self = this;
    
    var testEnvironment = false;
	
    var interpreterModule2 = require('interpreter/interpreterModule2');
    
    self.setTestEnvironment = function(isTesting){
    	testEnvironment = isTesting;
    };
    
    self.getWorkingDirectory = function(){
    	
    	var workingDirectory = "";
    	if(testEnvironment == false){
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, Alloy.Globals.User.getUserDir()); 
    		//Ti.API.info("workingDirectory.nativePath = "+workingDirectory.nativePath);
    		return workingDirectory.nativePath;
    	}
    	else{
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "testDirectory");  
    		//Ti.API.info("workingDirectory.nativePath = "+workingDirectory.nativePath);
    		return workingDirectory.nativePath;
    	}
    };
    
    self.cacheCrossingSearch = function(payload)
    {
    	//var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
        var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");
        crossingsFile.write(JSON.stringify(payload));
        return true;
    };
    
    self.loadCachedCrossingSearch = function()
    {
    	//var curUserDir = Alloy.Globals.User.getUserDir();
		// alert("curUserDir = "+curUserDir.nativePath);
        var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "crossingsSearch.json");
        if (crossingsFile.exists()) {
            crossingsFileContents = crossingsFile.read().text;
            return JSON.parse(crossingsFileContents);
        } else {
            return [];
        }
    };
   
    self.clearAllSavedAssessments = function () {
    	 //alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
	
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
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

    self.getAllSavedAssessments = function () {
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		// alert("curUserDir = "+curUserDir.nativePath);
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

    self.updateSavedAssessments = function (savedAssessments) {
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

    self.updateQuestion = function (question) {
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		var savedAssessments = self.getAllSavedAssessments();
		var refToSaveAssessmentIndex = null;
		for(var savedAssementIndex=0; savedAssementIndex<savedAssessments.length; savedAssementIndex++)
		{
			//Ti.API.info("question = "+ JSON.stringify(question));
			//Ti.API.info("savedAssessments[savedAssementIndex].assessmentID = "+ savedAssessments[savedAssementIndex].assessmentID);
			//Ti.API.info("question.assesmentId = "+ question.assessmentId);

			if(savedAssessments[savedAssementIndex].assessmentID === question.assessmentId)
			{
				refToSaveAssessmentIndex = savedAssementIndex;
				break;
			}
		}
        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + question.associatedFileName);
        if (assessmentFile.exists()) {
            var sectionList = JSON.parse(assessmentFile.read().text);

            var questionFound = false;
            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true; sectionIndex++) {

                if (sectionList[sectionIndex].alcrmGroupType == question.alcrmGroupType) {
                    var questionList = sectionList[sectionIndex].questionList;

                    for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true; questionIndex++) {
                        if (sectionList[sectionIndex].questionList[questionIndex].name == question.name) {
                            
                            var oldQuestion =  sectionList[sectionIndex].questionList[questionIndex];
                            var newQuestion =  question;
                            
                            if(oldQuestion.validation.mandatory === true)
                            {
                            	if(oldQuestion.value[0] === "" && newQuestion.value[0] !== "")
                            	{
                            		
                            		savedAssessments[refToSaveAssessmentIndex].questionsCompleted++;
                            	}else if(oldQuestion.value[0] !== "" && newQuestion.value[0] === "")
                            	{
                            		savedAssessments[refToSaveAssessmentIndex].questionsCompleted--;
                            	}
                            	
                            	
                            }
                                      
                            sectionList[sectionIndex].questionList[questionIndex] = question;
                            questionFound = true;
                        }
              
                        
                    }
                }
                
                
            }

            if (questionFound == false) {
                //alert("updateQuestion : question not found ");
            }

			self.updateSavedAssessments(savedAssessments);
			
            assessmentFile.deleteFile();
            assessmentFile.write(JSON.stringify(sectionList));

            return true;
        }
        alert("ERROR - assessmentFile does not exists");
        return false;
    };

    self.updateSingleAssessmentIndexEntry = function (assessmentObject) {
    	
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i] = assessmentObject;
            }
        }
        self.updateSavedAssessments(savedAssessments);
    };
    
    self.getMostUpTodateAssessmentObject = function (assessmentObject) {
        var savedAssessments = self.getAllSavedAssessments();
        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                assessmentObject = savedAssessments[i];
                break;
            }
        }
        return assessmentObject;
    };

    self.updateQuestionWithUserNotes = function (fileName, question) {
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + fileName);
        if (assessmentFile.exists()) {

            var sectionList = JSON.parse(assessmentFile.read().text);
            var questionFound = false;

            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true; sectionIndex++) {

                if (sectionList[sectionIndex].groupType == question.groupType) {
                    var questionList = sectionList[sectionIndex].questionList;

                    for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true; questionIndex++) {

                        if (sectionList[sectionIndex].questionList[questionIndex].name == question.name) {
                            sectionList[sectionIndex].questionList[questionIndex] = question;
                            questionFound = true;
                        }
                    }
                }
            }

            assessmentFile.write(JSON.stringify(sectionList));

            return true;
        }
        alert("ERROR - assessmentFile does not exists");
        return false;
    };
    
    self.setAssessmentCompleted = function(assessmentObject)
    {
    	 var savedAssessments = self.getAllSavedAssessments();

         for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
            	savedAssessments[i].isSubmitted = true;
            	self.updateSavedAssessments(savedAssessments);
            	return;
            }
         }    
    };
    
    self.addNewAssessment = function (JASON_question_list, crossingName, detailID, crossingID, quesMap /*defaultCensusQuestions, defaultTrainInfoQuestions*/ ) {
		//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		 
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

            censusQuestionsfileNameList: [],
            censusLastPageID: 1,
            trainGroupQuestionsfileNameList: [],
            trainGroupLastPageID: 1,
            crossingName: crossingName,
            crossingID: crossingID,
            questionCount: mandatoryQuestionCount,
            questionsCompleted: 0,
            alcrmStatus: "not sent",
            notes: "",
            detailID: detailID,
            
            censusDesktopComplete : false,
       
			
			isSubmitted: false,
            defaultCensusQuestions: [],
            defaultTrainInfoQuestions: []

        };
        savedAssessments.push(newAssessment);

        self.updateSavedAssessments(savedAssessments);

        var newAssessmentFileName = newAssessment.mainQuestionsfileName;
        var newAssessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newAssessmentFileName);


        //new interpreterModule
        var newQuestionSet = interpreterModule2.interpret(JASON_question_list, {
            associatedFileName: newAssessment.mainQuestionsfileName,
            pageName: "Risk Assessment",
            pageID: 0,
            pageType: "riskAssessment",
            assessmentId: assessmentID,
            questionMap: quesMap
        });
        
        Ti.API.info("main question set = "+JSON.stringify(newQuestionSet));

        newAssessmentFile.write(JSON.stringify(newQuestionSet));
        return newAssessment;
    };

    self.addDefaultCensus = function (assessmentObject, defaultQuestionSet) {
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i].defaultCensusQuestions = defaultQuestionSet;
                self.updateSavedAssessments(savedAssessments);
                return true;
            }
        }
        return false;
    };

    self.addDefaultTrainInfo = function (assessmentObject, defaultQuestionSet) {
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i].defaultTrainInfoQuestions = defaultQuestionSet;
                self.updateSavedAssessments(savedAssessments);
                return true;
            }
        }
        return false;
    };

    self.addNewCensusToAssessment = function (assessmentObject, censusMap) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		 
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var newCensusFileName = assessmentObject.assessmentID + savedAssessments[i].censusLastPageID + "CensusQuestions.json";
                var newCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newCensusFileName);
                savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);
			//	Ti.API.info("============================");
				//Ti.API.info(JSON.stringify(savedAssessments[i].defaultCensusQuestions));
				//Ti.API.info("============================");
                //new interpreterModule
              
                var newCensusQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultCensusQuestions, {
                    associatedFileName: newCensusFileName,
                    pageName: "Census " + savedAssessments[i].censusLastPageID,
                    pageID: savedAssessments[i].censusLastPageID,
                    pageType: "census",
                    assessmentId: assessmentObject.assessmentID,
                    questionMap: censusMap
                });

                newCensusFile.write(
                    JSON.stringify(
                        newCensusQuestionSet
                    )
                );

                savedAssessments[i].censusLastPageID = parseInt(savedAssessments[i].censusLastPageID) + 1;
                self.updateSavedAssessments(savedAssessments);

                return newCensusQuestionSet;
            }
        }

        return [];
    };

    self.createAssessmentPDFResponse = function (assessmentObject) {
    		 
        var returnQuestionObj = {
        	assessmentNotes: assessmentObject.notes,
            mainQuestionSet: new Array(),
            individualCensusList: [],
            individualTrainList: []
        };


        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);

        if (assessmentFile.exists()) {
            returnQuestionObj.mainQuestionSet = JSON.parse(assessmentFile.read().text);
        }

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                returnQuestionObj.individualCensusList.push(
                    JSON.parse(censusQuestionFile.read().text)
                );
            }
        }

        for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
            var trainGroupQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.trainGroupQuestionsfileNameList[i]);
            if (trainGroupQuestionFile.exists()) {
                returnQuestionObj.individualTrainList.push(
                    JSON.parse(trainGroupQuestionFile.read().text)
                );
            }
        }

        return returnQuestionObj;
    };


    self.addNewTrainGroupToAssessment = function (assessmentObject, trainGroupMap) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		 
		 
        var savedAssessments = self.getAllSavedAssessments();


        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID + "TrainGroupQuestions.json";
                var newTrainGroupFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newTrainGroupFileName);
                savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);


                //new interpreterModule
                var newTrainInfoQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
                    associatedFileName: newTrainGroupFileName,
                    pageName: "Train Info " + savedAssessments[i].trainGroupLastPageID,
                    pageID: savedAssessments[i].trainGroupLastPageID,
                    pageType: "trainInfo",
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


    };

    self.removeAssessment = function (assessmentObject) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);

        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var mainQuestionsfile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
                if (mainQuestionsfile.exists()) {
                    mainQuestionsfile.deleteFile();
                }

                //delete savedAssessments[i];
                savedAssessments.splice(i, 1);

                self.updateSavedAssessments(savedAssessments);
                return true;
            }
        }

        return false;
    };


    self.getAllCensusesOrTrains = function (assessmentObject, type) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);

        var getAllData = [];

        switch (type) {
        case 0: //census
            var censusQuestionsfileNameList = assessmentObject.censusQuestionsfileNameList;
            for (var i = 0; i < censusQuestionsfileNameList.length; i++) {
                //read each file here
                var currentCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + censusQuestionsfileNameList[i]);
                if (!currentCensusFile.exists) {
                    //Ti.API.error("Line 352 localDataHandler.js - cant open currentCensusfile " + censusQuestionsfileNameList[i]);
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
                var currentTrainFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + trainGroupQuestionsfileNameList[i]);
                if (!currentTrainFile.exists) {
                    //Ti.API.error("Line 367 localDataHandler.js - cant open currentTrainfile " + trainGroupQuestionsfileNameList[i]);
                } else {
                    var currentContents = currentTrainFile.read().text;
                    getAllData.push(
                        JSON.parse(currentContents)
                    );
                }
            }
            break;

        }

        return getAllData;
    };


    

    self.deleteAssociatedFileNameFromAssessment = function (assessmentObject, associatedFileName) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            if (associatedFileName == assessmentObject.censusQuestionsfileNameList[i]) {
                var file = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[i]);
                if (file.exists() == true) {
                    file.deleteFile();
                }
                assessmentObject.censusQuestionsfileNameList.splice(i, 1);
                self.updateSingleAssessmentIndexEntry(assessmentObject);
                return true;
            }
        }

        return false;

    };
	
	self.getMainRiskAssessmentQuestions = function (assessmentObject) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		 
        var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            alert("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);


        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
        }


       
        return returnQuestionSet;
    };
    
    self.updateQuestionCount = function (assessmentObject) {
    	var returnQuestionSet = [];
    	assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
            //Ti.API.info("returnQuestionSet >> " + JSON.stringify(returnQuestionSet));
            var mandatoryCount = 0;
            var answeredCount = 0;
            for(var returnQuestionSetIndex = 0; returnQuestionSetIndex < returnQuestionSet.length; returnQuestionSetIndex++)
            {
            	if(returnQuestionSet[returnQuestionSetIndex].alcrmGroupType === "CrossingGeneral")
            	{
            		continue;
            	}else{
            		//get the questionList
            		var questionList = returnQuestionSet[returnQuestionSetIndex].questionList;
            		for(var questionListIndex = 0; questionListIndex < questionList.length; questionListIndex++)
            		{
            			//Count the Mandatory
	            		if(questionList[questionListIndex].mandatory == true ||
	            			 questionList[questionListIndex].mandatory == "true"){
	            			mandatoryCount++;
	            		}
	            		
	            		//Count the Answered
            			if(typeof questionList[questionListIndex].value !== "undefined")
            			{		
	            			if(questionList[questionListIndex].value instanceof Array)
	            			{            				
	            				if(questionList[questionListIndex].value.length >= 1)
	            				{
	            					if(questionList[questionListIndex].value[0].trim().length > 0)
		            				{
		            					//alert("value0="+questionList[questionListIndex].value[0]);
		            					answeredCount++;
		            				}
	            				}	
	            			}else{ // if it's not an Array
	            				if(questionList[questionListIndex].value.trim().length > 0)
		            			{
		            					answeredCount++;
		            			}
	            			}
	            		}//end check for undefined
            		}//end inner for loop
            	}//end if
            }//end outer for loop
            
            //update the ass obj
            assessmentObject.questionCount = mandatoryCount;
            assessmentObject.questionsCompleted = answeredCount;
        }
        
        return assessmentObject;
    };

    self.openAssessment = function (assessmentObject) {
    	
    	//alert(Alloy.Globals.User.getLogin().username);
		 //var curUserDir = Alloy.Globals.User.getUserDir();
		 //alert("curUserDir = "+curUserDir.nativePath);
		
        var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            alert("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
	
        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
        }


        for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
            var trainGroupQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.trainGroupQuestionsfileNameList[i]);
            if (trainGroupQuestionFile.exists()) {
                var trainGroupQuestions = JSON.parse(trainGroupQuestionFile.read().text);
                returnQuestionSet = returnQuestionSet.concat(trainGroupQuestions);
            }
        }

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                var censusQuestions = JSON.parse(censusQuestionFile.read().text);
                returnQuestionSet = returnQuestionSet.concat(censusQuestions);

            }
        }
        Ti.API.info("complete returnQuestionSet = "+JSON.stringify(returnQuestionSet));
        return returnQuestionSet;
    };
}

module.exports = new localDataHandler;