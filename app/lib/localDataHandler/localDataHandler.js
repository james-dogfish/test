/*
 *
 */
var CENSUS = 0; //GLOBAL DEFINE FOR ANDY
var TRAINS = 1; //GLOBAL DEFINE FOR ANDY
var versionID;
var INDEX_FILE_VERSION_NUM = 4;

function localDataHandler() {
    var self = this;
	
    var interpreterModule2 = require('interpreter/interpreterModule2');
	var curUserDir = Alloy.Globals.User.getUserDir();
	alert("curUserDir = "+curUserDir.nativePath);
    self.clearAllSavedAssessments = function () {
        var indexFile = Ti.Filesystem.getFile(curUserDir.nativePath + "assessmentIndex.json");
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
        var indexFile = Ti.Filesystem.getFile(curUserDir.nativePath + "assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

    self.updateSavedAssessments = function (savedAssessments) {
        var indexFile = Ti.Filesystem.getFile(curUserDir.nativePath + "assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

    self.updateQuestion = function (question) {
        var assessmentFile = Ti.Filesystem.getFile(curUserDir.nativePath + question.associatedFileName);
        if (assessmentFile.exists()) {
            var sectionList = JSON.parse(assessmentFile.read().text);

            var questionFound = false;
            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true; sectionIndex++) {

                if (sectionList[sectionIndex].alcrmGroupType == question.alcrmGroupType) {
                    var questionList = sectionList[sectionIndex].questionList;

                    for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true; questionIndex++) {
                        if (sectionList[sectionIndex].questionList[questionIndex].name == question.name) {
                            sectionList[sectionIndex].questionList[questionIndex] = question;
                            questionFound = true;
                        }
                    }
                }
            }

            if (questionFound == false) {
                alert("updateQuestion : question not found ");
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
        var assessmentFile = Ti.Filesystem.getFile(curUserDir.nativePath + fileName);
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
			
			isSubmitted: false,
            defaultCensusQuestions: [],
            defaultTrainInfoQuestions: []

        };
        savedAssessments.push(newAssessment);

        self.updateSavedAssessments(savedAssessments);

        var newAssessmentFileName = newAssessment.mainQuestionsfileName;
        var newAssessmentFile = Ti.Filesystem.getFile(curUserDir.nativePath + newAssessmentFileName);


        //new interpreterModule
        var newQuestionSet = interpreterModule2.interpret(JASON_question_list, {
            associatedFileName: newAssessment.mainQuestionsfileName,
            pageName: "Risk Assessment",
            pageID: 0,
            pageType: "riskAssessment"
        });

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

                var newCensusFileName = assessmentObject.assessmentID + savedAssessments[i].censusLastPageID + "CensusQuestions.json";
                var newCensusFile = Ti.Filesystem.getFile(curUserDir.nativePath + newCensusFileName);

                savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);

                //new interpreterModule
                var newCensusQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultCensusQuestions, {
                    associatedFileName: newCensusFileName,
                    pageName: "Census " + savedAssessments[i].censusLastPageID,
                    pageID: savedAssessments[i].censusLastPageID,
                    pageType: "census"
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
            mainQuestionSet: new Array(),
            individualCensusList: [],
            individualTrainList: []
        };


        var assessmentFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.mainQuestionsfileName);

        if (assessmentFile.exists()) {
            returnQuestionObj.mainQuestionSet = JSON.parse(assessmentFile.read().text);
        }

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                returnQuestionObj.individualCensusList.push(
                    JSON.parse(censusQuestionFile.read().text)
                );
            }
        }

        for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
            var trainGroupQuestionFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.trainGroupQuestionsfileNameList[i]);
            if (trainGroupQuestionFile.exists()) {
                returnQuestionObj.individualTrainList.push(
                    JSON.parse(trainGroupQuestionFile.read().text)
                );
            }
        }

        return returnQuestionObj;
    };


    self.addNewTrainGroupToAssessment = function (assessmentObject, trainGroupMap) {
        var savedAssessments = self.getAllSavedAssessments();


        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID + "TrainGroupQuestions.json";
                var newTrainGroupFile = Ti.Filesystem.getFile(curUserDir.nativePath + newTrainGroupFileName);
                savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);


                //new interpreterModule
                var newTrainInfoQuestionSet = interpreterModule2.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
                    associatedFileName: newTrainGroupFileName,
                    pageName: "Train Info " + savedAssessments[i].trainGroupLastPageID,
                    pageID: savedAssessments[i].trainGroupLastPageID,
                    pageType: "trainInfo"
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
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var mainQuestionsfile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.mainQuestionsfileName);
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

        var getAllData = [];

        switch (type) {
        case 0: //census
            var censusQuestionsfileNameList = assessmentObject.censusQuestionsfileNameList;
            for (var i = 0; i < censusQuestionsfileNameList.length; i++) {
                //read each file here
                var currentCensusFile = Ti.Filesystem.getFile(curUserDir.nativePath + censusQuestionsfileNameList[i]);
                if (!currentCensusFile.exists) {
                    Ti.API.error("Line 352 localDataHandler.js - cant open currentCensusfile " + censusQuestionsfileNameList[i]);
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
                var currentTrainFile = Ti.Filesystem.getFile(curUserDir.nativePath + trainGroupQuestionsfileNameList[i]);
                if (!currentTrainFile.exists) {
                    Ti.API.error("Line 367 localDataHandler.js - cant open currentTrainfile " + trainGroupQuestionsfileNameList[i]);
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

    self.deleteAssociatedFileNameFromAssessment = function (assessmentObject, associatedFileName) {

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            if (associatedFileName == assessmentObject.censusQuestionsfileNameList[i]) {
                var file = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.censusQuestionsfileNameList[i]);
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


    self.openAssessment = function (assessmentObject) {
        var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            alert("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);


        var assessmentFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
        }


        for (var i = 0; i < assessmentObject.trainGroupQuestionsfileNameList.length; i++) {
            var trainGroupQuestionFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.trainGroupQuestionsfileNameList[i]);
            if (trainGroupQuestionFile.exists()) {
                var trainGroupQuestions = JSON.parse(trainGroupQuestionFile.read().text);
                returnQuestionSet = returnQuestionSet.concat(trainGroupQuestions);
            }
        }

        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(curUserDir.nativePath + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                var censusQuestions = JSON.parse(censusQuestionFile.read().text);
                returnQuestionSet = returnQuestionSet.concat(censusQuestions);

            }
        }
        return returnQuestionSet;
    };
}

module.exports = new localDataHandler;