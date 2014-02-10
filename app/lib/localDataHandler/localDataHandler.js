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
    
    
    //will get the Directory all files will be read from, this is ether the users Directory or the test Directory
    self.getWorkingDirectory = function(){
    	
    	var workingDirectory = "";
    	if(testEnvironment == false){
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, Alloy.Globals.User.getUserDir()); 
    		return workingDirectory.nativePath;
    	}
    	else{
    		workingDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "testDirectory");  
    		return workingDirectory.nativePath;
    	}
    };
    
    //saves the CrossingSearch results so you do not need to make repeated requestes
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
   
   
   //will clear all assessments for the working Directory. this will delete all files related to each assessments
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

	//get all assessments for the working Directory.  
    self.getAllSavedAssessments = function () {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        if (indexFile.exists()) {
            indexFileContents = indexFile.read().text;
            return JSON.parse(indexFileContents);
        } else {
            return [];
        }
    };

	//will update all the saved assessments detailed with savedAssessments.
	//must NOT be used to delete assessments
    self.updateSavedAssessments = function (savedAssessments) {
        var indexFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + "assessmentIndex.json");
        indexFile.write(JSON.stringify(savedAssessments));
        return true;
    };

	//will update the saved copy of the  question in the relevent save file
    self.updateQuestion = function (question) {
    	Ti.API.error("updateQuestion is Called");
    	try{
			var savedAssessments = self.getAllSavedAssessments();
			//Ti.API.info("savedAssessments >> "+JSON.stringify(savedAssessments));
			//Ti.API.info("savedAssessments length >> "+savedAssessments.length);
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
	            var foundIndex = null;
	            var foundSectionIndex = null;
	            for (var sectionIndex = 0; sectionIndex < sectionList.length && questionFound != true; sectionIndex++) {
	
	                if (sectionList[sectionIndex].alcrmGroupType == question.alcrmGroupType) {
	                    var questionList = sectionList[sectionIndex].questionList;
	
	                    for (var questionIndex = 0; questionIndex < sectionList[sectionIndex].questionList.length && questionFound != true; questionIndex++) {
	                        if (sectionList[sectionIndex].questionList[questionIndex] && 
	                        	sectionList[sectionIndex].questionList[questionIndex].hasOwnProperty('name') && 
	                        	sectionList[sectionIndex].questionList[questionIndex].name == question.name) {
        
	                           // sectionList[sectionIndex].questionList[questionIndex] = question;
	                            foundIndex = questionIndex;
	                            foundSectionIndex = sectionIndex;
	                            questionFound = true;
	                        } 
	                    }
	                }
	            }
	
	            if (questionFound == false) {
	                Ti.API.info("updateQuestion : question not found ");
	            }else{
	            	sectionList[foundSectionIndex].questionList[foundIndex] = question;
	            	//alert("updateQuestion - localDataHandler >> "+JSON.stringify(question));
	            }
	
				self.updateSavedAssessments(savedAssessments);
				
	            assessmentFile.deleteFile();
	            assessmentFile.write(JSON.stringify(sectionList));
	
	            return true;
	        }
	        Ti.API.info("ERROR - assessmentFile does not exists");
	        return false;
		}catch(e){
			Ti.API.info("An exception occured in updateQuestion. Error Details: "+JSON.stringify(e));
		}
    };

	//will update a assessment with the same assessmentID as the assessmentObject passed
    self.updateSingleAssessmentIndexEntry = function (assessmentObject) {
    	try{
    		
	        var savedAssessments = self.getAllSavedAssessments();
	
	        for (var i = 0; i < savedAssessments.length; i++) {
	            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
	                savedAssessments[i] = assessmentObject;
	            }
	        }
	        self.updateSavedAssessments(savedAssessments);
	    }catch(e){
	    	Ti.API.info("Exception in updateSingleAssessmentIndexEntry. Error details: "+JSON.stringify(e));
	    	Alloy.Globals.aIndicator.hide();
	    	return;
	    }
    };
    
    //will get the most uptodate assessment from file with the same assessmentID as the assessmentObject.assessmentID passed
    self.getMostUpTodateAssessmentObject = function (assessmentObject) {
    	try{
	        var savedAssessments = self.getAllSavedAssessments();
	        for (var i = 0; i < savedAssessments.length; i++) {
	            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
	                assessmentObject = savedAssessments[i];
	                break;
	            }
	        }
	        return assessmentObject;
	    }catch(e){
	    	Ti.API.info("Exception in getMostUpTodateAssessmentObject. Error details: "+JSON.stringify(e));
	    	Alloy.Globals.aIndicator.hide();
	    	return;
	    }
    };
    
    //changes the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    //to say that it has been submitted
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
    
    //creates a new assessment in the working Directory with the passed variables 
    self.addNewAssessment = function (JASON_question_list, crossingName, detailID, crossingID, quesMap /*defaultCensusQuestions, defaultTrainInfoQuestions*/ ) {
	  try{
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
            coreQuestionsFileName : null,

            censusQuestionsfileNameList: [],
            //censusLastPageID: 1,
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

		//Ti.API.info("before calling interpret");
		//Ti.API.info(JSON.stringify(JASON_question_list));
		
        //new interpreterModule
        var newQuestionSet = Alloy.Globals.interpreter.interpret(JASON_question_list, {
            associatedFileName: newAssessment.mainQuestionsfileName,
            pageName: L("page_risk_assessment_name"),
            pageID: 0,
            pageType: "riskAssessment",
            readOnly: false,
            assessmentId: assessmentID,
            questionMap: quesMap
        });
        //Ti.API.info("after calling interpret");
        //Ti.API.info("newQuestionSet >> " + JSON.stringify(newQuestionSet));

        newAssessmentFile.write(JSON.stringify(newQuestionSet));
        return newAssessment;
      }catch(e){
      	 Ti.API.info("Exception in addNewAssessment. Error details: "+JSON.stringify(e));
      	 Alloy.Globals.aIndicator.hide();
      	 return;
      }
    };

	//addes a Default Census question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    self.addDefaultCensus = function (assessmentObject, defaultQuestionSet) {
    	try{
    	//Ti.API.info("addDefaultCensus assessmentObject="+JSON.stringify(assessmentObject));
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
       		Ti.API.info("Exception occured in addDefaultCensus. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       		return false;
       }
    };

	//addes a Default train question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    self.addDefaultTrainInfo = function (assessmentObject, defaultQuestionSet) {
    	try{
    	//Ti.API.info("addDefaultTrainInfo assessmentObject="+JSON.stringify(assessmentObject));
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
       		Ti.API.info("Exception occured in addDefaultTrainInfo. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       		return false;
       }
    };
    
    //adds a core question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    self.addNewCoreQuestionToAssessment = function (assessmentObject, JASON_question_list, questionMap) {
    	try{
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

                var newCoreQuestionsFileName = assessmentObject.assessmentID +"CoreQuestions.json";
                
                var newCoreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newCoreQuestionsFileName);
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
       }catch(e){
       		Ti.API.info("Exception occured in addNewCoreQuestionToAssessment. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       		return [];
       }
    };

	//adds a new Census question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed
	//the new Census uses the saved default Census Questions set for this assessment
    self.addNewCensusToAssessment = function (assessmentObject, censusMap) {
 
		try{
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {

            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {

				var censusPageNum = savedAssessments[i].censusQuestionsfileNameList.length +1;
                var newCensusFileName = assessmentObject.assessmentID + censusPageNum + "CensusQuestions.json";
                var newCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newCensusFileName);
                savedAssessments[i].censusQuestionsfileNameList.push(newCensusFileName);

                var newCensusQuestionSet = Alloy.Globals.interpreter.interpret(savedAssessments[i].defaultCensusQuestions, {
                    associatedFileName: newCensusFileName,
                    pageName: L("page_census_name")+" " + censusPageNum,
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

                //savedAssessments[i].censusLastPageID = parseInt(savedAssessments[i].censusLastPageID) + 1;
                self.updateSavedAssessments(savedAssessments);

                return newCensusQuestionSet;
            }
        }

        return [];
       }catch(e)
       {
       	Alloy.Globals.aIndicator.hide();
       	Ti.API.info("exception addNewCensusToAssessment >> - "+JSON.stringify(e));
       	return[];
       }
    };
    
   //check if census is done for an assessment that matches the assessmentID as the assessmentObject passed 
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


	//creates an object needed from the saved assessment that is needed by the server to create a PDF doc
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


	//adds a new train group question set to the saved assessment that matches the assessmentID as the assessmentObject.assessmentID passed
	//the new TrainGroup uses the saved default TrainGroup Questions set for this assessment
    self.addNewTrainGroupToAssessment = function (assessmentObject, trainGroupMap) {
		try{ 
		 
        var savedAssessments = self.getAllSavedAssessments();

        for (var i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].assessmentID == assessmentObject.assessmentID) {
                var newTrainGroupFileName = assessmentObject.assessmentID + savedAssessments[i].trainGroupLastPageID + "TrainGroupQuestions.json";
                var newTrainGroupFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + newTrainGroupFileName);
                savedAssessments[i].trainGroupQuestionsfileNameList.push(newTrainGroupFileName);

                //new interpreterModule
                var newTrainInfoQuestionSet = Alloy.Globals.interpreter.interpret(savedAssessments[i].defaultTrainInfoQuestions, {
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
       		Ti.API.info("Exception occured in addNewTrainGroupToAssessment. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       }


    };


	//deletes all local content for an assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
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

	//Censuses Or Trains questions sets for an assessment that matches the assessmentID as the assessmentObject.assessmentID passed 
    self.getAllCensusesOrTrains = function (assessmentObject, type) {
    	try{
        var getAllData = [];

        switch (type) {
        case 0: //census
            var censusQuestionsfileNameList = assessmentObject.censusQuestionsfileNameList;
            for (var i = 0; i < censusQuestionsfileNameList.length; i++) {
                //read each file here
                var currentCensusFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + censusQuestionsfileNameList[i]);
                if (!currentCensusFile.exists) {
                    Ti.API.error("getAllCensusesOrTrains - cant open currentCensusfile " + censusQuestionsfileNameList[i]);
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
                    Ti.API.error("getAllCensusesOrTrains - cant open currentTrainFile " + trainGroupQuestionsfileNameList[i]);
                } else {
                    var currentContents = currentTrainFile.read().text;
                    getAllData.push(
                        JSON.parse(currentContents)
                    );
                }
            }
            break;

        }
		Ti.API.error("getAllCensusesOrTrains returns => "+JSON.stringify(getAllData));
        return getAllData;
        }catch(e){
        	Ti.API.info("Exception occured in getAllCensusesOrTrains. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
        }
    };


    
	//deletes a file attached to an assessment 
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
       		Ti.API.info("Exception occured in deleteAssociatedFileNameFromAssessment. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       }

    };
	
	//get the main question set for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed
	self.getMainRiskAssessmentQuestions = function (assessmentObject) {
		try{
		var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            Ti.API.info("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);


        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
        if (assessmentFile.exists()) {
            var assessment = JSON.parse(assessmentFile.read().text);
            returnQuestionSet = returnQuestionSet.concat(assessment);
        }

        return returnQuestionSet;
       }catch(e){
       		Ti.API.info("Exception occured in getMainRiskAssessmentQuestions. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       }
    };
    
    //updates the number of answers mandatory questions for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed
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
            			//Ti.API.info("updateQuestionCount name = "+ questionList[questionListIndex].name);
            			//Count the Mandatory
	            		if(questionList[questionListIndex].mandatory == true ||
	            			 questionList[questionListIndex].mandatory == "true"){
	            			mandatoryCount++;
	            			

	            			if(typeof questionList[questionListIndex].value === "undefined") continue;
	            			if(!(questionList[questionListIndex].value instanceof Array)) continue;
	            			if(questionList[questionListIndex].value.length <= 0)continue;
	            			if(questionList[questionListIndex].value[0] != ""){
	            				answeredCount++;
	            			}
	            		}
            		}//end inner for loop
            	}//end if
            }//end outer for loop
            
            //update the ass obj
            assessmentObject.questionCount = mandatoryCount;
            assessmentObject.questionsCompleted = answeredCount;
        }
        self.updateSingleAssessmentIndexEntry(assessmentObject);
        return assessmentObject;
        }catch(e){
        	Ti.API.info("Exception occured in updateQuestionCount. Error Details: "+JSON.stringify(e));
        	Alloy.Globals.aIndicator.hide();
        }
    };


	//gets all questions for the assessmesnt that matches the assessmentID as the assessmentObject.assessmentID passed
    self.openAssessment = function (assessmentObject) {
		try{
        var returnQuestionSet = [];

        if (assessmentObject.versionID != INDEX_FILE_VERSION_NUM) {
            Ti.API.info("assessment file format is out of date, continued use of this assessment may cause errors");
        }

        assessmentObject = self.getMostUpTodateAssessmentObject(assessmentObject);

        if(assessmentObject.coreQuestionsFileName != null){
        	var coreQuestionsFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.coreQuestionsFileName);
	        if (coreQuestionsFile.exists()) {
	            var coreQuestions = JSON.parse(coreQuestionsFile.read().text);
	            returnQuestionSet = returnQuestionSet.concat(coreQuestions);
	        }
        }
	
		if(assessmentObject.mainQuestionsfileName != null){
	        var assessmentFile = Ti.Filesystem.getFile(self.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName);
	        if (assessmentFile.exists()) {
	            var assessment = JSON.parse(assessmentFile.read().text);
	            //Ti.API.info("mainQuestionsfileName = "+JSON.stringify(assessment));
	            returnQuestionSet = returnQuestionSet.concat(assessment);
	        }
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
       		Ti.API.info("An exception occured in openAssessment. Error Details: "+JSON.stringify(e));
       		Alloy.Globals.aIndicator.hide();
       }
    };
}

module.exports = new localDataHandler;