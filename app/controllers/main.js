var User = require('core/User');
var loginView;

// Set current tab globally so that other windows can be opened
Alloy.Globals.currentTab = $.tab1;
Alloy.Globals.tabGroup = $.tabGroup;

var activityIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
var localDataHandler = require('localDataHandler/localDataHandler');

var interpreterModule = require('interpreter/interpreterModule');

var riskAssessmentsTab = $.riskAssessmentsTab;
var questionRendererTab = $.questionRendererTab;
var masterSearchTab = $.masterSearchTab;
var detailSearchTab = $.detailSearchTab;

var curAssObj = null;
	
/*	
var selectRouteWindow = Alloy.createController('selectRouteWindow');
selectRouteWindow.show(function(selectedRoute){
	alert("route : "+selectedRoute.title);
});
*/

/*
var gotoQuestionSectionWindow = Alloy.createController('gotoQuestionSectionWindow/gotoQuestionSectionWindow');
gotoQuestionSectionWindow.on("goToQuestion", function(data){
	questionRendererController.moveToQuestion(data.sectionToGoToGroupType, data.questionToGoToIndex);
	//alert("groupType "+groupType);
});
*/
		
/////////////////////////////////////////////////////////////////////////Window specific Functions below/////////////////////////////////////////////////////////////////////////
var windowFocused = function() {
	Ti.API.info('Index window focused');
		
		/*
		var question_Views = Alloy.Globals.question_Views;

		$.tableView.setData(question_Views);
		
		Ti.App.addEventListener('questionValueChange', function(data) 
		{ 
		     //alert("question parameterName = "+data.parameterName);
		});
		*/
		//$.questionListView.setItems(Alloy.Globals.question_Views);	
};

function toggleSearch() {

	if (!User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message: true
		}).getView();
		userSettings.open();
	}


	if (!Util.allRouteTemplatesAvailable()) {
		/*
		// Check to make sure all route templates are fully downloaded
		Util.slideNotify($.home, 0, 'Please wait while all the files required for your route are downloaded!');
		//activityIndicator.show('Please wait while all the files required for your route are downloaded!');
		// Download template files now
		Util.downloadAllRouteTemplates(function() {
			Util.slideNotify($.home, null, null, true);
		});
		*/

	}
	

	$.tabGroup.setActiveTab(masterSearchTab.getView());
	masterSearchTab.setData();
}

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
			gotoQuestionSectionWindow.on("goToQuestion", function(data){
				questionRendererController.moveToQuestion(data.groupType, data.questionIndex);
			});
			gotoQuestionSectionWindow.setContentsDetails(questionRendererController.getContentsDetails());
			gotoQuestionSectionWindow.show();
			
		} else if (e.row.id === 3) {
			// Help screen 
			//var appHelp = Alloy.createController('appHelp').getView();
			//appHelp.open();
		} else if (e.row.id === 4) {
			// Commit all assessments
			//Alloy.Globals.Util.submitCompletedAssessments();
			var responseGenerator = require('responseGenerator/responseGenerator');
			responseGenerator  = new responseGenerator();
			responseGenerator.commitAllCompleted();
			
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

riskAssessmentsTab.loadRiskAssessments();

riskAssessmentsTab.on("openRiskAssessment", function(e){
	questionRendererTab.clear();
	$.tabGroup.setActiveTab($.questionRendererTab.getView());
	
	activityIndicator.show();
	var assessment = localDataHandler.openAssessment(e.assessmentObject);
	questionRendererTab.setAssessment(interpreterModule.interpret(assessment), e.assessmentObject);
	activityIndicator.hide();
});

riskAssessmentsTab.on("openSearchTab", toggleSearch);

masterSearchTab.on("crossingSelected", function(crossingObject){
	//alert("crossing name : "+crossingObject.name);
	 $.tabGroup.setActiveTab(detailSearchTab.getView());
	 Alloy.Globals.currentCrossingName = crossingObject.name;
	  Alloy.Globals.aIndicator.show("Loading...");
							detailSearchTab.setData(crossingObject);
	
});
masterSearchTab.on("BackButtonClick", function(e){
	$.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

masterSearchTab.on("RefreshButtonClick", function(e){
	masterSearchTab.setData();
});

function parseTrainData(xml_text)
{
	if(xml_text!==null || typeof xml_text!=='undefined'){
		var localParser = require('parser/localParser');
		var interpreter = require('interpreter/interpreterModule');
		localParser = new localParser();
		
		var data = localParser.getQuestions(xml_text);
		
		var localDataHandler = require('localDataHandler/localDataHandler');
		var censusData = localDataHandler.addDefaultTrainInfo(curAssObj, data);
	
	}else{
		alert("TrainParseData Failed");

	}
};

function parseCensusData(xml_text)
{
	
		
	if(xml_text!==null || typeof xml_text!=='undefined'){
		var localParser = require('parser/localParser');
		var interpreter = require('interpreter/interpreterModule');
		localParser = new localParser();
		
		var data = localParser.getQuestions(xml_text);
		
		var localDataHandler = require('localDataHandler/localDataHandler');
		var censusData = localDataHandler.addDefaultCensus(curAssObj, data);

	}else{
		alert("CensusParseData Failed");

	}
};

function parseData(xml_text,detaildID, crossingID,riskMap)
{
	if(xml_text!==null || typeof xml_text!=='undefined'){
		var localParser = require('parser/localParser');
		localParser = new localParser();
		Alloy.Globals.parsedData = localParser.getQuestions(xml_text);
		Alloy.Globals.localParser = localParser;
		
		var localDataHandler = require('localDataHandler/localDataHandler');
		curAssObj = localDataHandler.addNewAssessment(Alloy.Globals.parsedData, Alloy.Globals.currentCrossingName, detaildID, crossingID, riskMap);
		
		Alloy.Globals.aIndicator.hide();
		$.tabGroup.setActiveTab(riskAssessmentsTab.getView());
		riskAssessmentsTab.loadRiskAssessments();
	}else{
		alert("Startup Failure: no xml text null or undefined");

	}
};

detailSearchTab.on("BackButtonClick", function(e){
	$.tabGroup.setActiveTab(masterSearchTab.getView());
});

detailSearchTab.on("assSelected", function(crossingDetail){
	//alert(JSON.stringify(crossingDetail));
	 Alloy.Globals.aIndicator.show("Loading...");
	 var assData2=[];
	 var riskMap = {};
	 Alloy.Globals.currentCrossingDetailID = crossingDetail.id;
	 
	 Alloy.Globals.Soap.getAssessment(
					{
						assessmentId:crossingDetail.id
					},
					function(xmlDoc){
							
							var XMLTools = require("tools/XMLTools");
			                var xml2 = new XMLTools(xmlDoc);
			                var assObj = JSON.stringify(xml2.toObject());
			                
			                var data2 = JSON.parse(assObj);
			                var results = data2["soapenv:Body"]["ns9:GetAssessmentResponse"]["ns9:assessment"]["ns5:riskData"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	Alloy.Globals.aIndicator.hide();
			                	var Util = require('core/Util');
								Util.showAlert("No Results");
								
			                }else{
			                	//alert('getAssessment Success response >> ' + JSON.stringify(results));
				                for(var i=0; i<results.length; i++)
				                {
				                		riskMap[results[i]["ns6:parameterName"]] = null;
				                		var paramDetails = new Array();
				                		paramDetails.push({
				                			paramValue:results[i]["ns6:parameterValue"],
				                			displayValue:results[i]["ns6:displayValue"]
				                		});
										riskMap[results[i]["ns6:parameterName"]] = paramDetails;    
				                }
				            	 	//get Assessment Question Set
				            	 	Alloy.Globals.Soap.getQuestionsRequest(
									{
										crossingId:crossingDetail.crossingId
									},
									function(xmlDoc){
										parseData(xmlDoc,crossingDetail.detailId,crossingDetail.crossingId,riskMap);
									},
									function(xmlDoc){
										    var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                Alloy.Globals.aIndicator.hide();
							                Ti.API.error('getQuestionReqeust Error response >> ' + xml.toJSON());
							          
									});
									
									//get Census Question Set
									Alloy.Globals.Soap.getQuestionsRequest(
									{
										crossingId:crossingDetail.crossingId,
										groupType:"Census"
									},
									function(xmlDoc){
										parseCensusData(xmlDoc,assObj);
										alert("created census data");
									},
									function(xmlDoc){
										    var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                Alloy.Globals.aIndicator.hide();
							                Ti.API.error('getQuestionReqeust Error response >> ' + xml.toJSON());
							          
									});
									
									//get Train Question Set
									Alloy.Globals.Soap.getQuestionsRequest(
									{
										crossingId:crossingDetail.crossingId,
										groupType:"Train"
									},
									function(xmlDoc){
										parseTrainData(xmlDoc,assObj);
										alert("created train data");
									},
									function(xmlDoc){
										    var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                Alloy.Globals.aIndicator.hide();
							                Ti.API.error('getQuestionReqeust Error response >> ' + xml.toJSON());
							          
									});
									
									
									
							}
					},
					function(xmlDoc){
						    var XMLTools = require("tools/XMLTools");
			                var xml2 = new XMLTools(xmlDoc);
			                alert('getAssessment Error response >> ' + xml2.toJSON());
					});
});

questionRendererTab.on("BackButtonClick", function(e){
	$.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});
questionRendererTab.on("openMenu", openMenu);
