require('/test-framework/tijasmine').infect(this);

//NOTE: This test must be executed right after the App Startup in order for Alloy.Globals.parsedData to be defined.
describe("Interpreter Module  Test Suite", function () {
	var interpreterModule2 = require('interpreter/interpreterModule2');
	
	var localParser = require('parser/localParser');
	localParser = new localParser();

	
	it('compare saved interpreted question set to the new interpreted question set', function(){
		var xmlTestFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "testFiles/test_question_set.xml");
		var xmltext = xmlTestFile.read().text;
		var JASON_question_list = localParser.getQuestions(xmltext);

		var interpretedQuestions = interpreterModule2.interpret(JASON_question_list, {
		    associatedFileName: "mainQuestionsfileName.JSON",
		    pageName: "Risk Assessment",
		    pageID: 0,
		    pageType: "riskAssessment",
		    assessmentId: "1111111111",
		    questionMap: []
		});
		
		Ti.API.info("interpretedQuestions = "+JSON.stringify(interpretedQuestions));
		
		var interpretedTestFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "testFiles/test_question_set_interpreted.json");
		var interpretedTestText = interpretedTestFile.read().text;
		var interpretedTest = JSON.parse(interpretedTestText);
		
		Ti.API.info("compare question sets ="+(JSON.stringify(interpretedQuestions) === JSON.stringify(interpretedTest)));
		var response = JSON.stringify(interpretedQuestions) === JSON.stringify(interpretedTest);
		
		expect(response).toEqual(true);
	});
});