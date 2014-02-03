// Set current tab globally so that other windows can be opened
Alloy.Globals.tabGroup = $.tabGroup;

//the current assessment object
var curAssObj = null;

/////////////////////////////////////////////////////////////////////////Window specific Functions below/////////////////////////////////////////////////////////////////////////
/*******************************************************************************
 * toggleSearch: this function is fired when a user taps on the "Search" button
 *******************************************************************************/
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
var openMenu = function () {

    // Check whether settings are filled 
    if (!User.hasPreferences()) {
        // Open setting screen
        var userSettings = Alloy.createController('userSettings', {
            message: true
        }).getView();
        userSettings.open();
        return false;
    }

    //var Ui = require('core/Ui'),
        popOver = Ui.renderPopOver({
            width: 250
        }),
        menuTable = Ti.UI.createTableView({
            width: 250,
            height: Ti.UI.SIZE
        }),
        data = [/*{
            title: 'Settings',
            id: 1
        }, */{
            title: 'GoTo',
            id: 2
        }, {
            title: 'Help',
            id: 3
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
        view: $.menuButton
    });

    menuTable.addEventListener('click', function (e) {
        popOver.hide();
        if (e.row.id === 1) {
            // Open setting screen
            var userSettings = Alloy.createController('userSettings');
            userSettings.open();
        } else if (e.row.id === 2) {
            // GoTo screen
            var gotoQuestionSectionWindow = Alloy.createController('gotoQuestionSectionWindow/gotoQuestionSectionWindow');
            gotoQuestionSectionWindow.on("goToQuestion", function (data) {
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
            $.destroy;
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

$.riskAssessmentsTab.on("openRiskAssessment", function (e) {
    $.questionRendererTab.clear();
    $.tabGroup.setActiveTab($.questionRendererTab.getView());

    $.questionRendererTab.setAssessment(e.assessmentObject);
});

/** here we call toggleSearch (see above) **/
$.riskAssessmentsTab.on("openSearchTab", toggleSearch);

/** set the active tab to riskAssessmentTab when tapping on back button **/
$.masterSearchTab.on("BackButtonClick", function (e) {
    $.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

/** call masterSearchData controller setData function here **/
$.masterSearchTab.on("RefreshButtonClick", function (e) {
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
try{
    if (xml_text !== null || typeof xml_text !== 'undefined') {

        var data = localParser.getQuestions(xml_text);
        if (typeof data === "undefined") {
            alert(L('no_data'));
            return;
        }
        var censusData = localDataHandler.addDefaultTrainInfo(curAssObj, data);

    } else {
        alert(L('no_data'));

    }
}catch(e)
{
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
try{
    if (xml_text !== null || typeof xml_text !== 'undefined') {
       
        var data = localParser.getQuestions(xml_text);
        if (typeof data === "undefined") {
            alert(L('no_data'));
            return;
        }
        
        var censusData = localDataHandler.addDefaultCensus(curAssObj, data);

    } else {
        alert(L('no_data'));

    }
}catch(e)
{
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

try{
    if (xml_text !== null || typeof xml_text !== 'undefined') {

        var quesMap = [];
        var questionsData = localParser.getQuestions(xml_text);

        if (crosQues !== null || typeof crosQues !== 'undefined') {
            var crossingQuestions = localParser.getQuestions(crosQues);

            if (crosAns !== null || typeof crosAns !== 'undefined') {
                var crossingAnswers = localParser.getQuestions(crosAns);
                for (var i = 0; i < crossingAnswers[0].detailedData.length; i++) {
                    if (typeof crossingAnswers[0].detailedData[i]["ns7:parameterValue"] !== "undefined" &&
                        typeof crossingAnswers[0].detailedData[i]["ns7:parameterName"] !== "undefined") {

                        quesMap[crossingAnswers[0].detailedData[i]["ns7:parameterName"]["#text"]] = {
                            value: crossingAnswers[0].detailedData[i]["ns7:parameterValue"]["#text"]
                        };
                    }

                }
            }
        }

        if (typeof questionsData === "undefined") {
            alert(L('no_data'));
            Alloy.Globals.aIndicator.hide();
            return;
        }
        
        var curAssObj = localDataHandler.addNewAssessment(questionsData, Alloy.Globals.currentCrossingName, detaildID, crossingID, []);
        localDataHandler.addNewCoreQuestionToAssessment(curAssObj, crossingQuestions, quesMap);
		return curAssObj;

    } else {
        alert(L('no_data'));

    }
}catch(e){
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
$.masterSearchTab.on("crossingSelected", function (crossingDetail) {
try{
	
	if(typeof crossingDetail != "undefined"){
		if(crossingDetail != "null"){
    		Alloy.Globals.currentCrossingName = crossingDetail.name;
    		Alloy.Globals.currentCrossingDetailID = crossingDetail.id;
    		Alloy.Globals.aIndicator.show("Creating Risk Assessment...");
    	}
    }else{
    	return;
    }
    
    Alloy.Globals.Soap.getQuestionsRequest({
            crossingId: crossingDetail.id,
            groupType: "Crossing"
        },
        function (xmlDocCrossQues) {
            Alloy.Globals.Soap.getCrossingRequest({
                    crossingId: crossingDetail.id
                },
                function (xmlDocCrossAns) {
                    var riskMap = [];
                    XMLTools.setDoc(xmlDocCrossAns);

                    //get Assessment Question Set
                    Alloy.Globals.Soap.getQuestionsRequest({
                            crossingId: crossingDetail.id,
                            groupType: "Assessment"
                        },
                        function (xmlDocAss) {
                            var riskMap = [];

                            XMLTools.setDoc(xmlDocAss);
                            var assObj = XMLTools.toObject();
                            
                            var curAssObj = parseData(xmlDocAss, xmlDocCrossQues, xmlDocCrossAns, /*crossingDetail.detailId*/ 0, crossingDetail.id, riskMap);
                            if (typeof curAssObj === "undefined") {
                                alert(L('no_data'));
                                Alloy.Globals.aIndicator.hide();
                                return;
                            } else {
                                //get Census Question Set
                                Alloy.Globals.Soap.getQuestionsRequest({
                                        crossingId: crossingDetail.id,
                                        groupType: "Census"
                                    },
                                    function (xmlDoc) {
                                    	if(typeof curAssObj !== "undefined")
                                        	parseCensusData(xmlDoc, curAssObj);

                                        //get Train Question Set
		                                Alloy.Globals.Soap.getQuestionsRequest({
		                                        crossingId: crossingDetail.id,
		                                        groupType: "Train"
		                                    },
		                                    function (xmlDoc) {
		                                    	if(typeof curAssObj !== "undefined")
		                                        	parseTrainData(xmlDoc, curAssObj);

		                                        if (typeof curAssObj === "undefined") {
		                                            alert(L('no_data'));
		
		                                        } else {
		                                        	//DO THIS 3 TIMES Because as far we know they need 3 train info groups
			                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);
			                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);
			                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);
			                                        
		                                            $.riskAssessmentsTab.loadRiskAssessments();
		                                            $.questionRendererTab.setAssessment(curAssObj);
		                                            $.tabGroup.setActiveTab($.questionRendererTab.getView());
		                                        }
		                                        Alloy.Globals.aIndicator.hide();
		                                    },
		                                    function (xmlDoc) {});
		                                	//end of get Train Question Set
                                    },
                                    function (xmlDoc) {});
                                //end of get census question set                 
                            }
                        }, //end of get Question Request Success function
                        function (xmlDoc) {});
                    //end of get Question Request Failure function
                }, function () {});
        }, function () {});
 
}catch(e){
	Alloy.Globals.aIndicator.hide();
}      
});

/** laod the risk assessments then switch tab **/
$.questionRendererTab.on("saveAndExitClick", function (e) {
    $.riskAssessmentsTab.loadRiskAssessments();
    $.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

/** call the openMenu function above **/
$.questionRendererTab.on("openMenu", openMenu);