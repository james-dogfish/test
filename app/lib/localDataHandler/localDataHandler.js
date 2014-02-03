var INDEX_FILE_VERSION_NUM = 8;

/*************************************************************
 * localDataHandler: 
 * 			- deals with the lifetime of local files used to
 * 			- store/retrieve/manage data locally
 *************************************************************/
function localDataHandler() {
    var self = this;
    
    var testEnvironment = false;
    
    self.setTestEnvironment = function(isTesting){
    	testEnvironment = isTesting;
    };
    
    self.getWorkingDirectory = function(){
    	
    	var workingDirectory = "";
    	if(testEnvironment == false){
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, User.getUserDir()); 
    		return workingDirectory.nativePath;
    	}
    	else{
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "testDirectory");  
    		return workingDirectory.nativePath;
    	}
    };
    
    self.cacheCrossingSearch = function(payload)
    {
	   try{
       	 	var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");
        	crossingsFile.write(JSON.stringify(payload));
        	crossingsFile = null;
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       }
    };
    
    self.clearCachedCrossing = function()
    {
    	var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory() + "crossingsSearch.json");

    	if (crossingsFile.exists()) 
    	{ 
    		crossingsFile.deleteFile(); 
    		crossingsFile = null;
    	}
    	
    };
    
    self.loadCachedCrossingSearch = function()
    {
		try{
	        var crossingsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  +"crossingsSearch.json");
	        if (crossingsFile.exists()) {
	            crossingsFileContents = crossingsFile.read().text;
	            crossingsFile = null;
	            return JSON.parse(crossingsFileContents);
	        } else {
	            return [];
	        }
	    }catch(e){
	    	return[];
	    }
    };
   
    self.clearAllSavedAssessments = function () {	
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
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

    self.updateSavedAssessments = function (savedAssessments) {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

    self.updateQuestion = function (question) {
		var savedAssessments = self.getAllSavedAssessments();
		var refToSaveAssessmentIndex = null;
		for(var savedAssementIndex=0; savedAssementIndex<savedAssessments.length; savedAssementIndex++)
		{
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
                Ti.API.info("updateQuestion : question not found ");
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
	  try{
        var savedAssessments = self.getAllSavedAssessments();

        var mandatoryQuestionCount = 0;
        for (var i = 0; i < JASON_question_list.length; i++) {
            var isMandatory = localParser.getQuestionMandatory(JASON_question_list[i]);
            if (isMandatory == true) {
                mandatoryQuestionCount++;
            }
        }

        var assessmentID = new Date().getTime();
        var newAssessment = {
            versionID: INDEX_FILE_VERSION_NUM,
            assessmentID: assessmentID,
            mainQuestionsfileName: assessmentID + "mainQuestions.json",
            coreQuestionsFileName : null,

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

		Ti.API.info("before calling interpret");
		Ti.API.info(JSON.stringify(JASON_question_list));
		
        //new interpreterModule
        var newQuestionSet = interpreter.interpret(JASON_question_list, {
            associatedFileName: newAssessment.mainQuestionsfileName,
            pageName: L("page_risk_assessment_name"),
            pageID: 0,
            pageType: "riskAssessment",
            readOnly: false,
            assessmentId: assessmentID,
            questionMap: quesMap
        });
        Ti.API.info("after calling interpret");
        Ti.API.info("newQuestionSet >> " + JSON.stringify(newQuestionSet));

        newAssessmentFile.write(JSON.stringify(newQuestionSet));
        return newAssessment;
      }catch(e){
      	 Alloy.Globals.aIndicator.hide();
      	 return;
      }
    };

    self.addDefaultCensus = function (assessmentObject, defaultQuestionSet) {
    	try{
    	Ti.API.info("addDefaultCensus assessmentObject="+JSON.stringify(assessmentObject));
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i].defaultCensusQuestions = defaultQuestionSet;
                self.updateSavedAssessments(savedAssessments);
                return true;
            }
        }
        return false;
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       		return false;
       }
    };

    self.addDefaultTrainInfo = function (assessmentObject, defaultQuestionSet) {
    	try{
    	Ti.API.info("addDefaultTrainInfo assessmentObject="+JSON.stringify(assessmentObject));
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                savedAssessments[i].defaultTrainInfoQuestions = defaultQuestionSet;
                self.updateSavedAssessments(savedAssessments);
                return true;
            }
        }
        return false;
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       		return false;
       }
    };
    
    self.addNewCoreQuestionToAssessment = function (assessmentObject, JASON_question_list, questionMap) {
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var newCoreQuestionsFileName = assessmentObject.assessmentID +"CoreQuestions.json";
                
                var newCoreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newCoreQuestionsFileName);
                savedAssessments[i].coreQuestionsFileName = newCoreQuestionsFileName;

              
                var newCoreQuestionSet = interpreter.interpret(JASON_question_list, {
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
    };

    self.addNewCensusToAssessment = function (assessmentObject, censusMap) {
 
		try{
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var newCensusFileName = assessmentObject.assessmentID + savedAssessments[i].censusLastPageID + "CensusQuestions.json";
                var newCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newCensusFileName);
                savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);

                var newCensusQuestionSet = interpreter.interpret(savedAssessments[i].defaultCensusQuestions, {
                    associatedFileName: newCensusFileName,
                    pageName: L("page_census_name")+" " + savedAssessments[i].censusLastPageID,
                    pageID: savedAssessments[i].censusLastPageID,
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

                savedAssessments[i].censusLastPageID = parseInt(savedAssessments[i].censusLastPageID) + 1;
                self.updateSavedAssessments(savedAssessments);

                return newCensusQuestionSet;
            }
        }

        return [];
       }catch(e)
       {
       	Alloy.Globals.aIndicator.hide();
       	return[];
       }
    };
    
    self.checkIfCensusIsDone = function (assessmentObject) {
    	
    	var censusDone = true;
		var censusQuestions = [];
		
        for (var i = 0; i < assessmentObject.censusQuestionsfileNameList.length; i++) {
            var censusQuestionFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[i]);

            if (censusQuestionFile.exists()) {
                censusQuestions.push(
                    JSON.parse(censusQuestionFile.read().text)
                );
            }
        }
        
        for(var i = 0; i < censusQuestions.length; i++)
        {
        	var questionList = censusQuestions[i].questionList;
        	for(var t = 0; t < questionList.length; t++)
        	{
        		if(questionList[t].isAQuestion == true)
        		{
        			if(questionList[t].value == [])
        			{
        				Ti.API.error("ANDY to sort ROW Stuff ? You must complete the census questions. Change this to yes/no.");
        				return;
        			}
        			
        		}
        	}
        }
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
		try{ 
		 
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID + "TrainGroupQuestions.json";
                var newTrainGroupFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newTrainGroupFileName);
                savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);

                //new interpreterModule
                var newTrainInfoQuestionSet = interpreter.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
                    associatedFileName: newTrainGroupFileName,
                    pageName: L("page_train_info_name")+" " + savedAssessments[i].trainGroupLastPageID,
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
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       }


    };

    self.removeAssessment = function (assessmentObject) {
    	
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var mainQuestionsfile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
                if (mainQuestionsfile.exists()) {
                    mainQuestionsfile.deleteFile();
                }
                
                if(assessmentObject.coreQuestionsFileName !== null)
                {
                	 var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.coreQuestionsFileName);
		             if (coreQuestionsFile.exists()) {
		             	coreQuestionsFile.deleteFile();
		             }
                }

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
		try{
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
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       }

    };
	
	self.getMainRiskAssessmentQuestions = function (assessmentObject) {
		try{
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
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       }
    };
    
    self.updateQuestionCount = function (assessmentObject) {
    	try{
    	var returnQuestionSet = [];
    	assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);
        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
            ////Ti.API.info("returnQuestionSet >> " + JSON.stringify(returnQuestionSet));
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
        }catch(e){
        	Alloy.Globals.aIndicator.hide();
        }
    };

    self.openAssessment = function (assessmentObject) {
		try{
        var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            alert("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

        if(assessmentObject.coreQuestionsFileName != null){
        	var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.coreQuestionsFileName);
	        if (coreQuestionsFile.exists()) {
	            var coreQuestions = JSON.parse(coreQuestionsFile.read().text);
	            returnQuestionSet = returnQuestionSet.concat(coreQuestions);
	        }
        }
	
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
        return returnQuestionSet;
       }catch(e){
       		Alloy.Globals.aIndicator.hide();
       }
    };
}

module.exports = new localDataHandler;