// Set current tab globally so that other windows can be opened
Alloy.Globals.tabGroup = $.tabGroup;

//the current assessment object
var curAssObj = null;
var xmlDocAss, xmlDocCrossQues, xmlDocCrossAns, xmlDocCensus, xmlDocTrain = null;

/////////////////////////////////////////////////////////////////////////Window specific Functions below/////////////////////////////////////////////////////////////////////////
/*******************************************************************************
 * toggleSearch: this function is fired when a user taps on the "Search" button
 *******************************************************************************/
function toggleSearch() {

	if (!User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
	}

	if (!Util.allRouteTemplatesAvailable()) {
		/*
		 // Check to make sure all route templates are fully downloaded
		 Util.slideNotify($.home, 0, 'Please wait while all the files required for your route are downloaded!');
		 //Alloy.Globals.aIndicator.show('Please wait while all the files required for your route are downloaded!');
		 // Download template files now
		 Util.downloadAllRouteTemplates(function() {
		 Util.slideNotify($.home, null, null, true);
		 });
		 */

	}

	$.tabGroup.setActiveTab($.masterSearchTab.getView());
	$.masterSearchTab.setData(false);
}

/*******************************************************************************
 * openMenu: this function sets up menu item for home screen
 *******************************************************************************/
var openMenu = function() {

	// Check whether settings are filled
	/*if (!User.hasPreferences()) {
	// Open setting screen
	var userSettings = Alloy.createController('userSettings', {
	message: true
	}).getView();
	userSettings.open();
	return false;
	}*/

	//var Ui = require('core/Ui'),
	popOver = Ui.renderPopOver({
		width : 250
	}), menuTable = Ti.UI.createTableView({
		width : 250,
		height : Ti.UI.SIZE
	}), data = [/*{
	 title: 'Settings',
	 id: 1
	 }, */
	{
		title : 'GoTo',
		id : 2
	}, {
		title : 'Help',
		id : 3
	} /*{
	 title: 'Commit All Completed',
	 id: 4
	 }, {
	 title: 'Logout',
	 id: 5
	 }*/];

	menuTable.setData(data);

	popOver.add(menuTable);

	popOver.show({
		view : $.menuButton
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
			gotoQuestionSectionWindow.on("goToQuestion", function(data) {
				questionRendererController.moveToQuestion(data.groupType, data.questionIndex);
			});
			gotoQuestionSectionWindow.setContentsDetails(questionRendererController.getContentsDetails());
			gotoQuestionSectionWindow.show();

		} else if (e.row.id === 3) {
			//do nothing
		} else if (e.row.id === 4) {
			responseGenerator.commitAllCompleted();
		} else if (e.row.id === 5) {
			User.logOut();
			$.tabGroup.close();
			$.destroy
			Alloy.createController('index').getView().open();
			loginView.open();
		}
	});
};

/** here we load the risk assessments **/
$.riskAssessmentsTab.loadRiskAssessments();

/*************************************************************
 * openRiskAssessment:
 * 			- clear the questionRenderTab
 * 			- set the active tab to the questionrendertab view
 * 			- set the assessment to the passed assessment object
 * params:
 * 			-e: the selected risk assessment object
 *************************************************************/

$.riskAssessmentsTab.on("openRiskAssessment", function(e) {
	$.questionRendererTab.clear();
	$.tabGroup.setActiveTab($.questionRendererTab.getView());

	$.questionRendererTab.setAssessment(e.assessmentObject);
});

/** here we call toggleSearch (see above) **/
$.riskAssessmentsTab.on("openSearchTab", toggleSearch);

/** set the active tab to riskAssessmentTab when tapping on back button **/
$.masterSearchTab.on("BackButtonClick", function(e) {
	$.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

/** call masterSearchData controller setData function here **/
$.masterSearchTab.on("RefreshButtonClick", function(e) {
	$.masterSearchTab.setData(true);
});

/*************************************************************
 * parseTrainData:
 * 			- call the parser to parse the xml_text
 * 			- do some sanity check on the parser output
 * 			- call the localDataHandler to add default train
 * 			  info questions
 * params:
 * 			- xml_text: the xml text returned by the webservice
 * 			            call.
 * 			- curAssObj: the current assessment object.
 *
 *************************************************************/
function parseTrainData(xml_text, curAssObj) {
	try {
		if (xml_text !== null || typeof xml_text !== 'undefined') {

			var data = localParser.getQuestions(xml_text);
			if ( typeof data === "undefined") {
				alert(L('no_data'));
				return;
			}
			var trainData = localDataHandler.addDefaultTrainInfo(curAssObj, data);
			trainData = null;
			censusData = null;

		} else {
			alert(L('no_data'));

		}
	} catch(e) {
		Alloy.Globals.aIndicator.hide();
	}
};

/*************************************************************
 * parseCensusData:
 * 			- call the parser to parse the xml_text
 * 			- do some sanity check on the parser output
 * 			- call the localDataHandler to add default census
 * 			  questions
 * params:
 * 			- xml_text: the xml text returned by the webservice
 * 			            call.
 * 			- curAssObj: the current assessment object.
 *
 *************************************************************/
function parseCensusData(xml_text, curAssObj) {
	try {
		if (xml_text !== null || typeof xml_text !== 'undefined') {

			var data = localParser.getQuestions(xml_text);
			if ( typeof data === "undefined") {
				alert(L('no_data'));
				return;
			}

			var censusData = localDataHandler.addDefaultCensus(curAssObj, data);
			xml_text = null;
			censusData = null;

		} else {
			alert(L('no_data'));

		}
	} catch(e) {
		Alloy.Globals.aIndicator.hide();
	}
};

/*************************************************************
 * parseData:
 * 			- call the parser to parse the xml_text, crosQues,
 * 			  crosAns.
 *  		- map the crosAns to crosQues to prepoluate the
 * 			  crosQues.
 * 			- call localDataHandler to add new assessment
 * 		      (create a new file on disk).
 * 			- call the localDataHandler to core questions to
 * 			  the assessment.
 * params:
 * 			- xml_text: the xml text returned by the webservice
 * 			            call.
 * 			- crosQues: the xml text returned by the webservice
 * 			            call to retrieve crossing questions.
 * 			- crossAns: the xml text returned by the webservice
 * 						call to retrieve the crossings questions
 * 						answers.
 * 			- detailID: used here to fulfill addNewAssessment interface
 * 			- crossingID: as above
 * 			- riskMap: 	  as above
 *
 *************************************************************/
function parseData(xml_text, crosQues, crosAns, detaildID, crossingID, riskMap) {

	try {
		if (xml_text !== null || typeof xml_text !== 'undefined') {

			var quesMap = [];
			var questionsData = localParser.getQuestions(xml_text);

			if (crosQues !== null || typeof crosQues !== 'undefined') {
				var crossingQuestions = localParser.getQuestions(crosQues);

				if (crosAns !== null || typeof crosAns !== 'undefined') {
					var crossingAnswers = localParser.getQuestions(crosAns);
					Ti.API.info("crossingAnswers >> " + JSON.stringify(crossingAnswers));

					if ( typeof crossingAnswers !== "undefined") {
						if ( typeof crossingAnswers[0] !== "undefined") {
							if ( typeof crossingAnswers[0].detailedData !== "undefined") {
								for (var i = 0; i < crossingAnswers[0].detailedData.length; i++) {
									if (typeof crossingAnswers[0].detailedData[i]["ns7:parameterValue"] !== "undefined" && typeof crossingAnswers[0].detailedData[i]["ns7:parameterName"] !== "undefined") {

										quesMap[crossingAnswers[0].detailedData[i]["ns7:parameterName"]["#text"]] = {
											value : crossingAnswers[0].detailedData[i]["ns7:parameterValue"]["#text"]
										};
									}
								}
							}
						}
					}
				}
			}

			if ( typeof questionsData === "undefined") {
				alert(L('no_data'));
				Alloy.Globals.aIndicator.hide();
				return;
			}
			Ti.API.info("questionsData >> " + JSON.stringify(questionsData));
			Ti.API.info("Alloy.Globals.currentCrossingName >> " + Alloy.Globals.currentCrossingName);
			Ti.API.info("detaildID >> " + detaildID);
			Ti.API.info("crossingID >> " + crossingID);
			var curAssObj = localDataHandler.addNewAssessment(questionsData, Alloy.Globals.currentCrossingName, detaildID, crossingID, []);
			localDataHandler.addNewCoreQuestionToAssessment(curAssObj, crossingQuestions, quesMap);
			return curAssObj;

		} else {
			alert(L('no_data'));

		}
	} catch(e) {
		Ti.API.error("Exception occured in parseData " + JSON.stringify(e));
		Alloy.Globals.aIndicator.hide();
	}
};


function createAssessmentWithMainQuestionSet(xml_text, detaildID, crossingID){
	try {
		var questionsData = localParser.getQuestions(xml_text);
		var  assessmentObject = localDataHandler.addNewAssessment(questionsData, Alloy.Globals.currentCrossingName, detaildID, crossingID, []);
		questionsData = null;
		xml_text = null;
		
		return assessmentObject;
	}
	catch(e) {
		Ti.API.error("Exception occured in createAssessmentWithMainQuestionSet " + JSON.stringify(e));
		Alloy.Globals.aIndicator.hide();
		return null;
	}
	
};

function addCoreQuestionSetToAssessment(assessmentObject, crosQues, crosAns){
	try {
		if(assessmentObject == null){
			Ti.API.info("assessmentObject == null ");
			return false;
		}
		

		var crossingQuestions = localParser.getQuestions(crosQues);

		var quesMap = [];
		var crossingAnswers = localParser.getQuestions(crosAns);
		
		if ( typeof crossingAnswers !== "undefined") {
			if ( typeof crossingAnswers[0] !== "undefined") {
				if ( typeof crossingAnswers[0].detailedData !== "undefined") {
					for (var i = 0; i < crossingAnswers[0].detailedData.length; i++) {
						if (typeof crossingAnswers[0].detailedData[i]["ns7:parameterValue"] !== "undefined" && typeof crossingAnswers[0].detailedData[i]["ns7:parameterName"] !== "undefined") {
	
							quesMap[crossingAnswers[0].detailedData[i]["ns7:parameterName"]["#text"]] = {
								value : crossingAnswers[0].detailedData[i]["ns7:parameterValue"]["#text"]
							};
						}
					}
				}
			}
			else{
				Ti.API.info("typeof crossingAnswers[0] == undefined");
				return false;
			}
		}
		else{
			Ti.API.info("typeof crossingAnswers == undefined");
			return false;
		}
		
		
			
		localDataHandler.addNewCoreQuestionToAssessment(assessmentObject, crossingQuestions, quesMap);
		
		quesMap = null;
		crossingQuestions = null;
			
		return true;
		
	}
	catch(e) {
		Ti.API.error("Exception occured in createAssessmentWithMainQuestionSet " + JSON.stringify(e));
		Alloy.Globals.aIndicator.hide();
	}
	
}

function getCrossingQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId : crossingDetail.id,
		groupType : "Crossing"
	}, function(xmlDoc) {
		xmlDocCrossQues = xmlDoc;
		buildAssessment(crossingDetail);
		Ti.API.info(" === getCrossingQuestionSet DONE === ");
	}, function(xmlDoc) {
		Ti.API.info("getCrossingQuestionSet failed");
	});
};

function getCrossingQuestionAnswersSet(crossingDetail) {

	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId : crossingDetail.id,
	}, function(xmlDoc) {
		xmlDocCrossAns = xmlDoc;
		buildAssessment(crossingDetail);
		Ti.API.info(" === getCrossingQuestionAnswersSet DONE === ");
	}, function(xmlDoc) {
		Ti.API.info("getCrossingQuestionSet failed");
	});
};

function getAssessmentQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId : crossingDetail.id,
		groupType : "Assessment"
	}, function(xmlDoc) {
		xmlDocAss = xmlDoc;
		buildAssessment(crossingDetail);
		Ti.API.info(" === getAssessmentQuestionSet DONE === ");
	}, function(xmlDoc) {
		Ti.API.info("getAssessmentQuestionSet failed");
	});
};

function getCensusQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId : crossingDetail.id,
		groupType : "Census"
	}, function(xmlDoc) {
		xmlDocCensus = xmlDoc;
		buildAssessment(crossingDetail);
		Ti.API.info(" === getCensusQuestionSet DONE === ");
	}, function(xmlDoc) {
		Ti.API.info("getCensusQuestionSet failed");
	});
};

function getTrainInfoQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId : crossingDetail.id,
		groupType : "Train"
	}, function(xmlDoc) {
		xmlDocTrain = xmlDoc;
		buildAssessment(crossingDetail);
		Ti.API.info(" === getTrainInfoQuestionSet DONE === ");
	}, function(xmlDoc) {
		Ti.API.info("getTrainInfoQuestionSet failed");
	});
};

var buildAssessment = function(crossingDetail) {
	Ti.API.info("============== DEBUG ==============");
	Ti.API.info("xmlDocAss = " + (xmlDocAss !== null && typeof xmlDocAss !== "undefined"));
	Ti.API.info("xmlDocCrossQues = " + (xmlDocCrossQues !== null && typeof xmlDocCrossQues !== "undefined"));
	Ti.API.info("xmlDocCrossAns = " + (xmlDocCrossAns !== null && typeof xmlDocCrossAns !== "undefined"));
	Ti.API.info("xmlDocCensus = " + (xmlDocCensus !== null && typeof xmlDocCensus !== "undefined"));
	Ti.API.info("xmlDocTrain = " + (xmlDocTrain !== null && typeof xmlDocTrain !== "undefined"));
	Ti.API.info("============== END OF DEBUG ==============");

	if (xmlDocAss == null || xmlDocCrossQues == null || xmlDocCrossAns == null || xmlDocCensus == null || xmlDocTrain == null) {
		return false;
	}

	//var riskMap = [];
	//var curAssObj = parseData(xmlDocAss, xmlDocCrossQues, xmlDocCrossAns, /*crossingDetail.detailId*/0, crossingDetail.id, riskMap);
	
	var assessmentObject = createAssessmentWithMainQuestionSet(xmlDocAss, 0, crossingDetail.id);
	xmlDocAss = null;
	
	if(assessmentObject == null){
		Ti.API.info("in main.js buildAssessment >> assessmentObject == null");
		return;
	}
	
	var returnValue = addCoreQuestionSetToAssessment(assessmentObject, xmlDocCrossQues, xmlDocCrossAns);
	xmlDocCrossQues = null;
	xmlDocCrossAns = null;
	if(returnValue == false){
		Ti.API.info("in main.js addCoreQuestionSetToAssessment >> did not create");
		return;
	}
	
	
	//Ti.API.info("curAssObj >> " + JSON.stringify(curAssObj));

	if ( typeof assessmentObject === "undefined") {
		alert(L('no_data'));
		Alloy.Globals.aIndicator.hide();
		return;
	} else {
		parseCensusData(xmlDocCensus, assessmentObject);
		xmlDocCensus = null;
		
		parseTrainData(xmlDocTrain, assessmentObject);
		xmlDocTrain = null;

		localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);
		localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);
		localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);

		$.riskAssessmentsTab.loadRiskAssessments();
		$.questionRendererTab.setAssessment(assessmentObject);
		$.tabGroup.setActiveTab($.questionRendererTab.getView());

		Alloy.Globals.aIndicator.hide();
	}
};

/*************************************************************
 * crossingSelected:
 * 			- calls the SOAP client to deal with requests.
 * 			- get the asssessment question set
 * 			- get the crossing question set
 * 			- get the census question set (used for default)
 * 			- get the train info question set (used for default)
 * 			- sets the current assessment object and opens the
 * 			  question renderer tab to display the RA form.
 * params:
 * 			- crossingDetail: the crossing selected object.
 *
 *************************************************************/
$.masterSearchTab.on("crossingSelected", function(crossingDetail) {
	try {

		if ( typeof crossingDetail != "undefined") {
			if (crossingDetail != "null") {
				Alloy.Globals.currentCrossingName = crossingDetail.name;
				Alloy.Globals.currentCrossingDetailID = crossingDetail.id;
				Alloy.Globals.aIndicator.show("Creating Risk Assessment...");
			}
		} else {
			return;
		}

		xmlDocAss = null;
		xmlDocCrossQues = null;
		xmlDocCrossAns = null;
		xmlDocCensus = null;
		xmlDocTrain = null;

		getCrossingQuestionSet(crossingDetail);
		getAssessmentQuestionSet(crossingDetail);
		getCrossingQuestionAnswersSet(crossingDetail);
		getCensusQuestionSet(crossingDetail);
		getTrainInfoQuestionSet(crossingDetail);

	} catch(e) {
		Alloy.Globals.aIndicator.hide();
	}
});

/** laod the risk assessments then switch tab **/
$.questionRendererTab.on("saveAndExitClick", function(e) {
	$.riskAssessmentsTab.loadRiskAssessments();
	$.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

/** call the openMenu function above **/
$.questionRendererTab.on("openMenu", openMenu); 