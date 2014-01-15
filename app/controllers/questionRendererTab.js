var User = require('core/User');
var userPreferences = User.getPreferences();
var currentAssessmentObject = null;

exports.setAssessment = function(sectionList, assessmentObject){
	currentAssessmentObject = assessmentObject;
	$.questionListView.setAssessment(sectionList, assessmentObject);
	
};

exports.clear = function(){
	$.questionListView.clear();
};


function backButtonClick(e) {
	$.trigger("BackButtonClick");
}

function parseData(xml_text)
{
	if(xml_text!==null || typeof xml_text!=='undefined'){
		var localParser = require('parser/localParser');
		var interpreter = require('interpreter/interpreterModule');
		localParser = new localParser();
		
		var data = localParser.getQuestions(xml_text);
		//alert("data: "+JSON.stringify(data));
		//alert("currentAssessmentObject: "+JSON.stringify(currentAssessmentObject));
		
		var localDataHandler = require('localDataHandler/localDataHandler');
		var censusData = localDataHandler.addNewCensusToAssessment(currentAssessmentObject, data, []);
		//alert("Census Data: "+JSON.stringify(censusData));
		
		var censusDataInterpreted = interpreter.interpret(censusData);
		//alert("censusDataInterpreted Data: "+JSON.stringify(censusDataInterpreted));
		
		$.questionListView.appendSectionsToAssessment(censusDataInterpreted);
		
		
	}else{
		alert("ParseData Failed");

	}
};

var createCensus = function(){
	currentAssessmentObject;
	
	//$.questionListView.appendSectionsToAssessment();
	
	Alloy.Globals.Soap.getQuestionsRequest(
									{
										
										crossingId:currentAssessmentObject.crossingID,
										groupType:"Census"
									},
									function(xmlDoc){
										parseData(xmlDoc);
									},
									function(xmlDoc){
										    var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                Alloy.Globals.aIndicator.hide();
							                Ti.API.error('getQuestionReqeust Census Error response >> ' + xml.toJSON());
							          
									});
	/*Alloy.Globals.Soap.getQuestionsRequest(
									{
										crossingId:Ti.App.Properties.getString("crossingIDSelected"),
										groupType:"Train"
									},
									function(xmlDoc){
										parseData(xmlDoc,crossingDetail.crossingId,riskMap);
									},
									function(xmlDoc){
										    var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                Alloy.Globals.aIndicator.hide();
							                Ti.API.error('getQuestionReqeust Train Error response >> ' + xml.toJSON());
							          
									});*/
	

};

// Setting up menu item for home screen
var openMenu = function() {

	// Check whether settings are filled 
	if (!User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message: true
		}).getView();
		userSettings.open();
		return false;
	}

	var Ui = require('core/Ui'),
	popOver = Ui.renderPopOver({
		width: 250
	}),
	menuTable = Ti.UI.createTableView({
		width: 250,
		height: Ti.UI.SIZE
	}),
	data = [{
		title: 'Settings',
		id: 1
	}, {
		title: 'GoTo',
		id: 2
	},{
		title: 'Help',
		id: 3
	}, {
		title: 'Commit All Completed',
		id: 4
	}, {
		title: 'Logout',
		id: 5
	}];

	menuTable.setData(data);

	popOver.add(menuTable);

	popOver.show({
		view: $.menuButton
	});

	menuTable.addEventListener('click', function(e) {
		popOver.hide();
		if (e.row.id === 1) {
			// Open setting screen
			var userSettings = Alloy.createController('userSettings');
			userSettings.open();
		} else if (e.row.id === 2) {
			// GoTo screen
			var gotoQuestionSectionWindow = Alloy.createController('gotoQuestionSectionWindow/gotoQuestionSectionWindow');
			gotoQuestionSectionWindow.setAssessmentObject(currentAssessmentObject);
			gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());
			
			gotoQuestionSectionWindow.on("goToQuestion", function(data){
				$.questionListView.moveToQuestion(data.groupType, data.questionIndex);
			});
			
			gotoQuestionSectionWindow.on("createCensus", function(data){
				createCensus();
			});
			gotoQuestionSectionWindow.on("goToFirstUnanswered", function(data){
				$.questionListView.goToFirstUnanswered();
			});
			gotoQuestionSectionWindow.on("goToLastPositiond", function(data){
				$.questionListView.goToLastPositiond();
			});
			gotoQuestionSectionWindow.show();
			
		} else if (e.row.id === 3) {
			// Help screen 
			//var appHelp = Alloy.createController('appHelp').getView();
			//appHelp.open();
		} else if (e.row.id === 4) {
			// Commit all assessments
			//Alloy.Globals.Util.submitCompletedAssessments();
		} else if (e.row.id === 5) {
			// Reset the searching table 
			//$.searchTable.visible = false;
			//$.searchButton.title = 'Search';
			// Making table clickable!
			//$.searchTable.loading = false;
			// Log a user out
			
			Alloy.Globals.tabGroup.close();
			loginView = Alloy.createController('index').getView();
			loginView.open();
			User.logOut();
		}
	});
};