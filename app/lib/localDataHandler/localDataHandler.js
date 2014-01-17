/*
 *
 */
var CENSUS = 0; //GLOBAL DEFINE FOR ANDY
var TRAINS = 1; //GLOBAL DEFINE FOR ANDY

function localDataHandler() {
    var self = this;
    
    var interpreterModule2 = require('interpreter/interpreterModule2'); //test 
    
    //assessmentIndex.json file contains detils of all the assessments and the file names 

    self.clearAllSavedAssessments = function () {
        var indexFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + "/assessmentIndex.json");
        var savedAssessments = [];
        if (!indexFile.exists()) {
            return;
        } else {
            savedAssessments = JSON.parse(indexFile.read());
            indexFile.deleteFile();
        }

        for (var i = 0; i < savedAssessments.length; i++) {

            self.removeAssessment(savedAssessments[i]);
            /*
			var assessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + savedAssessments[i].fileName);
			if (assessmentFile.exists()) {
				assessmentFile.deleteFile();	
			}
			*/
        }

        indexFile.write(JSON.stringify([]));
    };

    self.getAllSavedAssessments = function () {
        var indexFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + "/assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

    self.updateSavedAssessments = function (savedAssessments) {
        //alert("updateSavedAssessments called");
        var indexFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + "/assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

    self.updateQuestionWithUserResponse = function (fileName, question) {
        var assessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + fileName);
        if (assessmentFile.exists()) {
            var sectionList = JSON.parse(assessmentFile.read().text);
            
            var questionFound = false;
           // var questonName = Alloy.Globals.localParser.getQuestionName(question_node);
            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true ; sectionIndex++) {
            	var questionList = sectionList[sectionIndex].questionList;
            	
            	for(var questionIndex =0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true  ; questionIndex++){
            		
            		if(sectionList[sectionIndex].questionList[questionIndex].name == question.name){
            			sectionList[sectionIndex].questionList[questionIndex] = question;
            			questionFound= true;	
            		}
            	}
            }


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

    self.updateQuestionWithUserNotes = function (fileName, question) {
        var assessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + fileName);
        if (assessmentFile.exists()) {
            
            var sectionList = JSON.parse(assessmentFile.read().text);
            var questionFound = false;
           // var questonName = Alloy.Globals.localParser.getQuestionName(question_node);
            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true ; sectionIndex++) {
            	var questionList = sectionList[sectionIndex].questionList;
            	
            	for(var questionIndex =0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true  ; questionIndex++){
            		
            		if(sectionList[sectionIndex].questionList[questionIndex].name == question.name){
            			sectionList[sectionIndex].questionList[questionIndex] = question;
            			questionFound= true;	
            		}
            		
            	}
            }

            //assessmentFile.deleteFile();
            assessmentFile.write(JSON.stringify(sectionList));

            return true;
        }
        alert("ERROR - assessmentFile does not exists");
        return false;
    };

    /*
	var addAssociatedFileNameToQuestionSet = function(JASON_question_list, fileName){
		for(var i=0; i< JASON_question_list.length; i++){
			JASON_question_list[i].associatedFileName = fileName;
			JASON_question_list[i].notes ="";
		}
		return JASON_question_list;
	};
	*/

/*
    var addDefultValuesToQuestionSet = function (JASON_question_list, fileName, riskMap, pageID, pageName, pageType) {
        for (var i = 0; i < JASON_question_list.length; i++) {
            JASON_question_list[i].associatedFileName = fileName;
            JASON_question_list[i].notes = "";
            JASON_question_list[i].pageID = pageID;
            JASON_question_list[i].pageName = pageName;
            JASON_question_list[i].pageType = pageType;

            if (riskMap != undefined) {

            }
        }
        return JASON_question_list;
    };
    */


    self.addNewAssessment = function (JASON_question_list, crossingName, detailID, crossingID, riskMap /*defaultCensusQuestions, defaultTrainInfoQuestions*/ ) {

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

            defaultCensusQuestions: [],
            defaultTrainInfoQuestions: []

        };
        savedAssessments.push(newAssessment);

        self.updateSavedAssessments(savedAssessments);

        var newAssessmentFileName = newAssessment.mainQuestionsfileName;
        var newAssessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + newAssessmentFileName);

		
		//new interpreterModule
		var newQuestionSet = interpreterModule2.interpret(JASON_question_list, {
				associatedFileName : newAssessment.mainQuestionsfileName, 
				pageName : "Risk Assessment", 
				pageID : 0, 
				pageType : "riskAssessment"
			});
		//Ti.API.info("newQuestionSet" + JSON.stringify(newQuestionSet));
		
		
		/*
        newAssessmentFile.write(
            JSON.stringify(
                addDefultValuesToQuestionSet(
                    JASON_question_list,
                    newAssessment.mainQuestionsfileName,
                    riskMap, 0,
                    "Risk Assessment",
                    "riskAssessment")
            )
        );
        */
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
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
            	
                var newCensusFileName = assessmentObject.assessmentID + savedAssessments[i].censusLastPageID+"CensusQuestions.json";
                var newCensusFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + newCensusFileName);

                //alert("censusLastPageID 1 = " + savedAssessments[i].censusLastPageID);
                savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);  
                
                //new interpreterModule
				var newCensusQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultCensusQuestions, {
						associatedFileName : newCensusFileName, 
						pageName : "Census " + savedAssessments[i].censusLastPageID, 
						pageID : savedAssessments[i].censusLastPageID, 
						pageType : "census"
					});
				//Ti.API.info("newCensusQuestionSet" + JSON.stringify(newCensusQuestionSet));
		
				/*
                var returnList = addDefultValuesToQuestionSet(
                    savedAssessments[i].defaultCensusQuestions,
                    newCensusFileName,
                    censusMap,
                    savedAssessments[i].censusLastPageID,
                    "Census " + savedAssessments[i].censusLastPageID,
                    "census");
                    */


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
    
    self.createAssessmentPDFResponse = function(assessmentObject)
    {
    	var returnQuestionObj = {
    		mainQuestionSet: new Array(),
    		individualCensusList: [],
    		individualTrainList: []
    	};
    	
    	
        var assessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.mainQuestionsfileName);

        if (assessmentFile.exists()) {
        	returnQuestionObj.mainQuestionSet = JSON.parse(assessmentFile.read().text);
           //var assessment = JSON.parse(assessmentFile.read().text);
           //returnQuestionSet = returnQuestionSet.concat(assessment);
           
        }

        for(var i=0; i < assessmentObject.censusQuestionsfileNameList.length; i++){
        	var censusQuestionFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.censusQuestionsfileNameList[i]);
 
        	if (censusQuestionFile.exists()) {
        		returnQuestionObj.individualCensusList.push(
        			JSON.parse(censusQuestionFile.read().text)
        		);
	           // var censusQuestions = JSON.parse(censusQuestionFile.read().text);
	            //returnQuestionSet = returnQuestionSet.concat(censusQuestions);
	            
	        }
        }
 
        for(var i=0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++){
        	var trainGroupQuestionFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.trainGroupQuestionsfileNameList[i]);
        	if (trainGroupQuestionFile.exists()) {
        		returnQuestionObj.individualTrainList.push(
        			JSON.parse(trainGroupQuestionFile.read().text)
        		);
	            //var trainGroupQuestions = JSON.parse(trainGroupQuestionFile.read().text);
	            //returnQuestionSet = returnQuestionSet.concat(trainGroupQuestions);
	        }
        }
        
        //Ti.API.info("returnQuestionSet = "+JSON.stringify(returnQuestionSet));
        return returnQuestionObj;
    };
    

    self.addNewTrainGroupToAssessment = function (assessmentObject, trainGroupMap) {
        var savedAssessments = self.getAllSavedAssessments();


        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID+"TrainGroupQuestions.json";
                var newTrainGroupFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + newTrainGroupFileName);
                savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);
                

				//new interpreterModule
				var newTrainInfoQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
						associatedFileName : newTrainGroupFileName, 
						pageName : "Train Info " + savedAssessments[i].trainGroupLastPageID, 
						pageID : savedAssessments[i].trainGroupLastPageID, 
						pageType : "trainInfo"
					});
				//Ti.API.info("newCensusQuestionSet" + JSON.stringify(newTrainInfoQuestionSet));
				
				/*
                var returnList = addDefultValuesToQuestionSet(
                    savedAssessments[i].defaultTrainInfoQuestions,
                    newTrainGroupFileName,
                    trainGroupMap,
                    savedAssessments[i].trainGroupLastPageID,
                    "Train Info " + savedAssessments[i].trainGroupLastPageID,
                    "trainInfo");
                   */


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
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var mainQuestionsfile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.mainQuestionsfileName);
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
        alert("inside getAllCensusesOrTrains localDataHandler.js 314");
        var getAllData = [];
        switch (type) {
        case 0: //census
            var censusQuestionsfileNameList = assessmentObject.censusQuestionsfileNameList;
            for (var i = 0; i < censusQuestionsfileNameList.length; i++) {
                //read each file here
                var currentCensusFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + censusQuestionsfileNameList[i]);
                if (!currentCensusFile.exists) {
                    Ti.API.error("Line 324 localDataHandler.js - cant open currentCensusfile " + censusQuestionsfileNameList[i]);
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
                var currentTrainFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + trainGroupQuestionsfileNameList[i]);
                if (!currentTrainFile.exists) {
                    Ti.API.error("Line 341 localDataHandler.js - cant open currentTrainfile " + trainGroupQuestionsfileNameList[i]);
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
  

    self.openAssessment = function (assessmentObject) {
    	var returnQuestionSet = [];
    	
        var assessmentFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
           var assessment = JSON.parse(assessmentFile.read().text);
           returnQuestionSet = returnQuestionSet.concat(assessment);
           
        }
        for(var i=0; i < assessmentObject.censusQuestionsfileNameList.length; i++){
        	var censusQuestionFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.censusQuestionsfileNameList[i]);
 
        	if (censusQuestionFile.exists()) {
	            var censusQuestions = JSON.parse(censusQuestionFile.read().text);
	            returnQuestionSet = returnQuestionSet.concat(censusQuestions);
	            
	        }
        }
        
        for(var i=0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++){
        	var trainGroupQuestionFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory() + assessmentObject.trainGroupQuestionsfileNameList[i]);
        	if (trainGroupQuestionFile.exists()) {
	            var trainGroupQuestions = JSON.parse(trainGroupQuestionFile.read().text);
	            returnQuestionSet = returnQuestionSet.concat(trainGroupQuestions);
	        }
        }
        //Ti.API.info("returnQuestionSet = "+JSON.stringify(returnQuestionSet));
        return returnQuestionSet;
    };
}

module.exports = new localDataHandler;