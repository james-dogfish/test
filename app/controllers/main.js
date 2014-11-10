// Set current tab globally so that other windows can be opened
Alloy.Globals.tabGroup = $.tabGroup;

//the current assessment object
var curAssObj = null;
var JSONDocAss, JSONDocCrossQues, JSONDocCrossAns, JSONDocCensus, JSONDocTrain = null;

/////////////////////////////////////////////////////////////////////////Window specific Functions below/////////////////////////////////////////////////////////////////////////
/*******************************************************************************
 * toggleSearch: this function is fired when a user taps on the "Search" button
 *******************************************************************************/
function toggleSearch() {
	Alloy.Globals.Logger.log("toggleSearch()", "info");
	Alloy.Globals.Analytics.trackFeature('home:search:toggled');
	if (!Alloy.Globals.User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message: true
		}).getView();
		userSettings.open();
	}

	$.tabGroup.setActiveTab($.masterSearchTab.getView());
	$.masterSearchTab.setData(false);
}

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
	Alloy.Globals.Logger.log("openRiskAssessment", "info");
	$.questionRendererTab.clear();
	$.questionRendererTab.setAssessment(e.assessmentObject);
	$.tabGroup.setActiveTab($.questionRendererTab.getView());
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
 * 			- call the Alloy.Globals.localDataHandler to add default train
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

			var data = Alloy.Globals.localParser.getQuestions(xml_text);
			if (typeof data === "undefined") {
				alert(L('no_data'));
				return;
			}
			var trainData = Alloy.Globals.localDataHandler.addDefaultTrainInfo(curAssObj, data);
			//addDefaultTrainInfo returns false IFF it fails
			if (trainData === false) {
				alert(L('unableToBuildRA'));
				Alloy.Globals.aIndicator.hide();
				return;
			}
			trainData = null;
			censusData = null;
			Alloy.Globals.Logger.log("parseTrainData > got data", "info");
		} else {
			Alloy.Globals.Logger.log("parseTrainData > no data", "info");
			alert(L('no_data'));

		}
	} catch (e) {
		Alloy.Globals.Logger.log("Exception in parseTrainData. Details: " + JSON.stringify(e), "info");
		Alloy.Globals.Logger.logException(e);
		Alloy.Globals.aIndicator.hide();
	}
};

/*************************************************************
 * parseCensusData:
 * 			- call the parser to parse the xml_text
 * 			- do some sanity check on the parser output
 * 			- call the Alloy.Globals.localDataHandler to add default census
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

			var data = Alloy.Globals.localParser.getQuestions(xml_text);
			if (typeof data === "undefined") {
				alert(L('no_data'));
				Alloy.Globals.Logger.log("parseCensusData > no data", "info");
				return;
			}

			var censusData = Alloy.Globals.localDataHandler.addDefaultCensus(curAssObj, data);
			//addDefaultCensus returns false IFF it fails
			if (censusData === false) {
				alert(L('unableToBuildRA'));
				Alloy.Globals.aIndicator.hide();
				return;
			}
			xml_text = null;
			censusData = null;
			Alloy.Globals.Logger.log("parseCensusData > got data", "info");

		} else {
			Alloy.Globals.Logger.log("parseCensusData > xml_text is undefined or null", "info");
			alert(L('no_data'));

		}
	} catch (e) {
		Alloy.Globals.Logger.log("Exception in parseCensusData. Error: " + JSON.stringify(e), "info");
		Alloy.Globals.Logger.logException(e);
		Alloy.Globals.aIndicator.hide();
	}
};

function createAssessmentWithMainQuestionSet(xml_text, detaildID, crossingID) {
	try {
		var questionsData = Alloy.Globals.localParser.getQuestions(xml_text);
		var assessmentObject = Alloy.Globals.localDataHandler.addNewAssessment(questionsData, Alloy.Globals.currentCrossingName, detaildID, crossingID, []);
		questionsData = null;
		xml_text = null;

		return assessmentObject;
	} catch (e) {
		Alloy.Globals.Logger.log("Exception occured in createAssessmentWithMainQuestionSet " + JSON.stringify(e), "error");
		Alloy.Globals.aIndicator.hide();
		return null;
	}

};

function addCoreQuestionSetToAssessment(assessmentObject, crosQues, crosAns) {
	try {
		if (assessmentObject === null || 
			typeof assessmentObject === "undefined") {
			Alloy.Globals.Logger.log("assessmentObject is null or undefined", "info");
			return false;
		}
		

		var crossingQuestions = Alloy.Globals.localParser.getQuestions(crosQues);
		
		if (typeof crossingQuestions === "undefined" || crossingQuestions === null) {
			Alloy.Globals.Logger.log("typeof crossingQuestions is undefined or null", "info");
			return false;
		}
			
		var quesMap = [];
		var crossingAnswers = Alloy.Globals.localParser.getQuestions(crosAns);
		Alloy.Globals.Logger.log("crossingAnswers ======= > " + JSON.stringify(crossingAnswers), "info");
		if (typeof crossingAnswers !== "undefined") {
			if(crossingAnswers !== null){
				for (var i = 0; i < crossingAnswers.length; i++) {
					if (typeof crossingAnswers[i].parameterValue !== "undefined" && typeof crossingAnswers[i].parameterName !== "undefined") {
	
						quesMap[crossingAnswers[i].parameterName] = {
							value: crossingAnswers[i].parameterValue
						};
					}
				}
			}else{
				Alloy.Globals.Logger.log("typeof crossingAnswers is null", "info");
				return false;
			}
		} else {
			Alloy.Globals.Logger.log("typeof crossingAnswers == undefined", "info");
			return false;
		}

		var coreQues = Alloy.Globals.localDataHandler.addNewCoreQuestionToAssessment(assessmentObject, crossingQuestions, quesMap);
		if (coreQues === [] || coreQues === null || typeof coreQues === "undefined") //see line 558 of localDataHandler.js
		{
			Alloy.Globals.Logger.log("coreQues is empty or undefined or null - unable to build ra", "info");
			alert(L('unableToBuildRA'));
			Alloy.Globals.aIndicator.hide();
			return false;
		}

		quesMap = null;
		crossingQuestions = null;

		return true;

	} catch (e) {
		Alloy.Globals.Logger.logException(e);
		Alloy.Globals.Logger.log("Exception occured in addCoreQuestionSetToAssessment " + JSON.stringify(e), "error");
		Alloy.Globals.aIndicator.hide();
	}

}

function getCrossingQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId: crossingDetail.id,
		groupType: "Crossing"
	}, function(xmlDoc) {
		Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
			function(data) {
				// callback
				var data = JSON.parse(data);

				JSONDocCrossQues = data;
				buildAssessment(crossingDetail);
			}
		);
		//end of convertJSON

	}, function(xmlDoc) {
		Alloy.Globals.Logger.log("getCrossingQuestionSet failed", "info");
	});
};

function getCrossingQuestionAnswersSet(crossingDetail) {

	Alloy.Globals.Soap.getCrossingRequest({
		crossingId: crossingDetail.id
	}, function(xmlDoc) {
		Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
			function(data) {
				// callback
				var data = JSON.parse(data);

				JSONDocCrossAns = data;
				buildAssessment(crossingDetail);
			}
		);
		//end of convertJSON

	}, function(xmlDoc) {
		Alloy.Globals.Logger.log("getCrossingQuestionSet failed", "info");
	});
};

function getAssessmentQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId: crossingDetail.id,
		groupType: "Assessment"
	}, function(xmlDoc) {
		Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
			function(data) {
				// callback
				var data = JSON.parse(data);

				JSONDocAss = data;
				buildAssessment(crossingDetail);
			}
		);
		//end of convertJSON

	}, function(xmlDoc) {
		Alloy.Globals.Logger.log("getAssessmentQuestionSet failed", "info");
	});
};

function getCensusQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId: crossingDetail.id,
		groupType: "Census"
	}, function(xmlDoc) {
		Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
			function(data) {
				// callback
				var data = JSON.parse(data);

				JSONDocCensus = data;
				buildAssessment(crossingDetail);
			}
		);
		//end of convertJSON

	}, function(xmlDoc) {
		Alloy.Globals.Logger.log("getCensusQuestionSet failed", "info");
	});
};

function getTrainInfoQuestionSet(crossingDetail) {
	Alloy.Globals.Soap.getQuestionsRequest({
		crossingId: crossingDetail.id,
		groupType: "Train"
	}, function(xmlDoc) {
		Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
			function(data) {
				// callback
				var data = JSON.parse(data);

				JSONDocTrain = data;
				buildAssessment(crossingDetail);
			}
		);
		//end of convertJSON

	}, function(xmlDoc) {
		Alloy.Globals.Logger.log("getTrainInfoQuestionSet failed", "info");
	});
};

var buildAssessment = function(crossingDetail) {
	Alloy.Globals.Logger.log("============== DEBUG ==============", "info");
	Alloy.Globals.Logger.log("JSONDocAss = " + (JSONDocAss !== null && typeof JSONDocAss !== "undefined"), "info");
	Alloy.Globals.Logger.log("JSONDocCrossQues = " + (JSONDocCrossQues !== null && typeof JSONDocCrossQues !== "undefined"), "info");
	Alloy.Globals.Logger.log("JSONDocCrossAns = " + (JSONDocCrossAns !== null && typeof JSONDocCrossAns !== "undefined"), "info");
	Alloy.Globals.Logger.log("JSONDocCensus = " + (JSONDocCensus !== null && typeof JSONDocCensus !== "undefined"), "info");
	Alloy.Globals.Logger.log("JSONDocTrain = " + (JSONDocTrain !== null && typeof JSONDocTrain !== "undefined"), "info");
	Alloy.Globals.Logger.log("============== END OF DEBUG ==============", "info");

	if (JSONDocAss === null || JSONDocCrossQues === null || JSONDocCrossAns === null || JSONDocCensus === null || JSONDocTrain === null) {
		Alloy.Globals.loadingRiskAssessment = false;
		return false;
	}

	var assessmentObject = createAssessmentWithMainQuestionSet(JSONDocAss, 0, crossingDetail.id);
	JSONDocAss = null;

	if (assessmentObject === null || typeof assessmentObject === "undefined") {
		Alloy.Globals.Logger.log("in main.js buildAssessment >> assessmentObject == null or undefined", "info");
		Alloy.Globals.aIndicator.hide();
		Alloy.Globals.loadingRiskAssessment = false;
		return;
	}
	
	if(assessmentObject === null || typeof assessmentObject === "undefined" ||
		JSONDocCrossQues === null || typeof JSONDocCrossQues === "undefined" ||
		JSONDocCrossAns === null || typeof JSONDocCrossAns === "undefined")
		{
			Alloy.Globals.Logger.log("in main.js buildAssessment >> assessmentObject OR JSONDocCrossQues OR JSONDocCrossAns == null or undefined", "info");
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.loadingRiskAssessment = false;
			return;
		}

	var returnValue = addCoreQuestionSetToAssessment(assessmentObject, JSONDocCrossQues, JSONDocCrossAns);
	JSONDocCrossQues = null;
	JSONDocCrossAns = null;
	if (returnValue === false) {
		Alloy.Globals.Logger.log("in main.js addCoreQuestionSetToAssessment >> did not create", "info");
		Alloy.Globals.loadingRiskAssessment = false;
		return;
	}

	if (typeof assessmentObject === "undefined") {
		alert(L('no_data'));
		Alloy.Globals.aIndicator.hide();
		Alloy.Globals.loadingRiskAssessment = false;
		return;
	} else {
		parseCensusData(JSONDocCensus, assessmentObject);
		JSONDocCensus = null;

		parseTrainData(JSONDocTrain, assessmentObject);
		JSONDocTrain = null;

		var trainGroup1 = Alloy.Globals.localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);
		var trainGroup2 = Alloy.Globals.localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);
		var trainGroup3 = Alloy.Globals.localDataHandler.addNewTrainGroupToAssessment(assessmentObject, []);

		Ti.API.info("************** trainGroup1 queestionList ==> " + JSON.stringify(trainGroup1[0].questionList));
		Ti.API.info("************** trainGroup2 queestionList ==> " + JSON.stringify(trainGroup2[0].questionList));
		Ti.API.info("************** trainGroup3 queestionList ==> " + JSON.stringify(trainGroup3[0].questionList));

		if (typeof assessmentObject !== "undefined" &&
			typeof trainGroup1 !== "undefined" &&
			typeof trainGroup2 !== "undefined" &&
			typeof trainGroup3 !== "undefined") {
			if (assessmentObject !== null && assessmentObject !== [] &&
				typeof trainGroup1[0] !== "undefined" &&
				typeof trainGroup2[0] !== "undefined" &&
				typeof trainGroup3[0] !== "undefined") {
				if (trainGroup1[0].questionList !== null && trainGroup1[0].questionList !== [] &&
					trainGroup2[0].questionList !== null && trainGroup2[0].questionList !== [] &&
					trainGroup3[0].questionList !== null && trainGroup3[0].questionList !== []) {
					//Assuming that there are always **at least** 4 questions in each train info group
					if (trainGroup1[0].questionList.length >= 4 ||
						trainGroup2[0].questionList.length >= 4 ||
						trainGroup3[0].questionList.length >= 4) {
						Ti.API.info("************** trainGroup1.queestionList FOUND " + trainGroup1[0].questionList.length + " questions");
						Ti.API.info("************** trainGroup2.queestionList FOUND " + trainGroup2[0].questionList.length + " questions");
						Ti.API.info("************** trainGroup3.queestionList FOUND " + trainGroup3[0].questionList.length + " questions");

						$.riskAssessmentsTab.loadRiskAssessments();
						$.questionRendererTab.setAssessment(assessmentObject);
						$.tabGroup.setActiveTab($.questionRendererTab.getView());
						Alloy.Globals.loadingRiskAssessment = false;
					} else {
						alert(L('unableToBuildRA'));
						Alloy.Globals.aIndicator.hide();
						Alloy.Globals.loadingRiskAssessment = false;
						return;
					}
				} else {
					alert(L('unableToBuildRA'));
					Alloy.Globals.aIndicator.hide();
					Alloy.Globals.loadingRiskAssessment = false;
					return;
				}
			} else {
				alert(L('unableToBuildRA'));
				Alloy.Globals.aIndicator.hide();
				Alloy.Globals.loadingRiskAssessment = false;
				return;
			}
		} else {
			alert(L('unableToBuildRA'));
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.loadingRiskAssessment = false;
			return;
		}

		Alloy.Globals.loadingRiskAssessment = false;
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
	if (typeof crossingDetail != "undefined") {
		if (crossingDetail != "null") {
			Alloy.Globals.currentCrossingName = crossingDetail.name;
			Alloy.Globals.currentCrossingDetailID = crossingDetail.id;
			Alloy.Globals.aIndicator.show("Creating Risk Assessment...");
		}
	} else {
		return;
	}

	JSONDocAss = null;
	JSONDocCrossQues = null;
	JSONDocCrossAns = null;
	JSONDocCensus = null;
	JSONDocTrain = null;

	getCrossingQuestionSet(crossingDetail);
	getAssessmentQuestionSet(crossingDetail);
	getCrossingQuestionAnswersSet(crossingDetail);
	getCensusQuestionSet(crossingDetail);
	getTrainInfoQuestionSet(crossingDetail);
});

/** laod the risk assessments then switch tab **/
$.questionRendererTab.on("saveAndExitClick", function(e) {
	try {
		Alloy.Globals.currentlyFocusedTF.blur();
	} catch (e) {
		Alloy.Globals.Logger.logException(e);
		Alloy.Globals.Logger.log("COULD NOT BLUR Alloy.Globals.currentlyFocusedTF", "error");
	}
	$.riskAssessmentsTab.loadRiskAssessments();
	$.tabGroup.setActiveTab($.riskAssessmentsTab.getView());

	Alloy.Globals.Analytics.trackNav('Assessment Form', 'Home', 'ra:exit');
	Alloy.Globals.Analytics.trackFeature('RiskAssessment:Closed');
});