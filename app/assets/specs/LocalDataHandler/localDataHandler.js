require('/test-framework/tijasmine').infect(this);

//NOTE: This test must be executed right after the App Startup in order for Alloy.Globals.parsedData to be defined.
describe("Local Data Handler Test Suite", function () {
	
    var LocalDataHandler = require('localDataHandler/localDataHandler');
 	LocalDataHandler.setTestEnvironment(true);
 	
 	var localParser = require('parser/localParser');
	localParser = new localParser();
	
 	var assessmentObject = null;
 	
 	
 	
 	LocalDataHandler.clearAllSavedAssessments();
 	
 	it('test addNewAssessment function returns success True', function(){
		 	//LocalDataHandler = new LocalDataHandler();
		 	
		 	
		 	var response = false;
		 	
		 	var xmlTestFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "testFiles/test_question_set.xml");
			var xmltext = xmlTestFile.read().text;
			var JASON_question_list = localParser.getQuestions(xmltext);
		
		 	assessmentObject = LocalDataHandler.addNewAssessment(JASON_question_list, "crossingName1", "detailID1", "crossingID1", []);
		 	
		 	
		 	var mainQuestionsfileName = Ti.Filesystem.getFile(LocalDataHandler.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName );
		 	if(mainQuestionsfileName.exists() == true) {
		 		response = true;
		 	}
		 		
			expect(response).toEqual(true);
    });
    
    //notes
    
    it('test getAllSavedAssessments function returns success True', function(){
    	var response = false;
    	
    	var savedAssessments = LocalDataHandler.getAllSavedAssessments();
    	
    	if(savedAssessments.length == 1){
    		if(savedAssessments[0].assessmentId == assessmentObject.assessmentId){
    			response = true;
    		}
    	}
    	
    	expect(response).toEqual(true);
    });
    
    it('test updateSingleAssessmentIndexEntry function returns success True', function(){
		 	//LocalDataHandler = new LocalDataHandler();
		 	
		 	
		 	var response = false;
		 	
		 	var testString ="notes test";
	
			if(assessmentObject != null){

				if(assessmentObject.notes == ""){
					assessmentObject.notes = testString;
					LocalDataHandler.updateSingleAssessmentIndexEntry(assessmentObject);
					
					var savedAssessments = LocalDataHandler.getAllSavedAssessments();
					if(savedAssessments.length == 1){
			    		if(savedAssessments[0].notes == testString){
			    			response = true;
			    		}
			    	}
					
				}
			 }
			expect(response).toEqual(true);
    });
    
    it('test getMostUpTodateAssessmentObject function returns success True', function(){

		 	var response = false;
		 	
		 	var testString ="updateSingleAssessmentIndexEntry String";
	
			if(assessmentObject != null){
				

				assessmentObject.notes = testString;
				LocalDataHandler.updateSingleAssessmentIndexEntry(assessmentObject);
				
				assessmentObject.notes = "should not equal this";
				
				assessmentObject = LocalDataHandler.getMostUpTodateAssessmentObject(assessmentObject);
				
				if(assessmentObject.notes == testString){
					response = true;
				}
			 }
			expect(response).toEqual(true);
    });
    
    
    it('test setAssessmentCompleted function returns success True', function(){

		 	var response = false;
	
			if(assessmentObject != null){
				
				if(assessmentObject.isSubmitted == false){
				
					LocalDataHandler.setAssessmentCompleted(assessmentObject);					
					assessmentObject = LocalDataHandler.getMostUpTodateAssessmentObject(assessmentObject);
					
					if(assessmentObject.isSubmitted == true){
						response = true;
					}
				}
			 }
			expect(response).toEqual(true);
    });
    
    it('test addNewCensusToAssessment function returns success True', function(){

		 	var response = false;
	
			if(assessmentObject != null){
				LocalDataHandler.addNewCensusToAssessment(assessmentObject);			
				assessmentObject = LocalDataHandler.getMostUpTodateAssessmentObject(assessmentObject);
				
				if(assessmentObject.censusQuestionsfileNameList.length == 1){
					var censusQuestionsfileName = Ti.Filesystem.getFile(LocalDataHandler.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[0] );
				 	if(censusQuestionsfileName.exists() == true) {
				 		response = true;
				 	}
				}
			 }
			expect(response).toEqual(true);
    });
    
    it('test addNewTrainGroupToAssessment function returns success True', function(){

		 	var response = false;
	
			if(assessmentObject != null){
				LocalDataHandler.addNewTrainGroupToAssessment(assessmentObject);			
				assessmentObject = LocalDataHandler.getMostUpTodateAssessmentObject(assessmentObject);
				
				if(assessmentObject.trainGroupQuestionsfileNameList.length == 1){
					var trainGroupQuestionsfileName = Ti.Filesystem.getFile(LocalDataHandler.getWorkingDirectory()  + assessmentObject.trainGroupQuestionsfileNameList[0] );
				 	if(trainGroupQuestionsfileName.exists() == true) {
				 		response = true;
				 	}
				}
			 }
			expect(response).toEqual(true);
    });
    
    
    it('test deleteAssociatedFileNameFromAssessment function returns success True', function(){

		 	var response = false;
			if(assessmentObject != null){	
				assessmentObject = LocalDataHandler.getMostUpTodateAssessmentObject(assessmentObject);
				
				if(assessmentObject.censusQuestionsfileNameList.length == 1){
					var censusQuestionsfileName = LocalDataHandler.getWorkingDirectory()  + assessmentObject.censusQuestionsfileNameList[0];
				 	if(Ti.Filesystem.getFile(censusQuestionsfileName).exists() == true) {
				 	
				 		LocalDataHandler.deleteAssociatedFileNameFromAssessment(assessmentObject, assessmentObject.censusQuestionsfileNameList[0]);
				 	
				 		if(Ti.Filesystem.getFile(censusQuestionsfileName).exists() == false) {
				 			response = true;
				 		}
				 		
				 	}
				}
			 }
			expect(response).toEqual(true);
    });
    
    it('test openAssessment function returns success True', function(){

		 	var response = false;
			if(assessmentObject != null){	
				var sectionList = LocalDataHandler.openAssessment(assessmentObject);
				
				var interpretedTestFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "testFiles/test_question_set_interpreted.json");
				var interpretedTestText = interpretedTestFile.read().text;
				var interpretedTest = JSON.parse(interpretedTestText);
				
				for(var sectionIndex =0; sectionIndex < interpretedTest.length; sectionIndex++){
					interpretedTest[sectionIndex].associatedFileName = "";
					for(var questionIndex =0; questionIndex < interpretedTest[sectionIndex].questionList.length; questionIndex++){
						if(interpretedTest[sectionIndex].questionList[questionIndex].isAQuestion == true){
							interpretedTest[sectionIndex].questionList[questionIndex].associatedFileName = "";
							interpretedTest[sectionIndex].questionList[questionIndex].assessmentId = 1;
						}
					}
				}
				
				for(var sectionIndex =0; sectionIndex < sectionList.length; sectionIndex++){
					sectionList[sectionIndex].associatedFileName = "";
					for(var questionIndex =0; questionIndex < sectionList[sectionIndex].questionList.length; questionIndex++){
						if(sectionList[sectionIndex].questionList[questionIndex].isAQuestion == true){
							sectionList[sectionIndex].questionList[questionIndex].associatedFileName = "";
							sectionList[sectionIndex].questionList[questionIndex].assessmentId = 1;
						}
					}
				}
				
				Ti.API.info("compare question sets ="+(JSON.stringify(sectionList) == JSON.stringify(interpretedTest)));
				Ti.API.info(JSON.stringify(sectionList));
				Ti.API.info(JSON.stringify(interpretedTest));
				response = JSON.stringify(sectionList) == JSON.stringify(interpretedTest);
		
		
			 }
			expect(response).toEqual(true);
    });
    
    it('test removeAssessment function returns success True', function(){
		 	//LocalDataHandler = new LocalDataHandler();
		 	
		 	
		 	var response = false;
	
			if(assessmentObject != null){
			 	var mainQuestionsfileName = Ti.Filesystem.getFile(LocalDataHandler.getWorkingDirectory()  + assessmentObject.mainQuestionsfileName );
			 	if(mainQuestionsfileName.exists() == true) {
			 		
			 		LocalDataHandler.removeAssessment(assessmentObject);
				 	if(mainQuestionsfileName.exists() == false) {
				 		response = true;
				 	}
	
			 	}
			 }
			expect(response).toEqual(true);
    });
    
    
    
    
    /* END OF TEST SUITE */
});