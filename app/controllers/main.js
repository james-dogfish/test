//REQUIRES
var User = require('core/User');
var Util = require('core/Util');
var localDataHandler = require('localDataHandler/localDataHandler');
var interpreterModule = require('interpreter/interpreterModule2');
var XMLTools = require("tools/XMLTools");
//END OF REQUIRES

var loginView;

// Set current tab globally so that other windows can be opened
Alloy.Globals.currentTab = $.tab1;
Alloy.Globals.tabGroup = $.tabGroup;
Alloy.Globals.questionRendererTab = questionRendererTab;

var activityIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
var riskAssessmentsTab = $.riskAssessmentsTab;
var questionRendererTab = $.questionRendererTab;
var masterSearchTab = $.masterSearchTab;
var detailSearchTab = $.detailSearchTab;
var curAssObj = null;

/////////////////////////////////////////////////////////////////////////Window specific Functions below/////////////////////////////////////////////////////////////////////////

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

    var Ui = require('core/Ui'),
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
            // Help screen 
            //var appHelp = Alloy.createController('appHelp').getView();
            //appHelp.open();
        } else if (e.row.id === 4) {
            // Commit all assessments
            //Alloy.Globals.Util.submitCompletedAssessments();
            var responseGenerator = require('responseGenerator/responseGenerator');
            responseGenerator = new responseGenerator();
            responseGenerator.commitAllCompleted();

        } else if (e.row.id === 5) {
            // Reset the searching table 
            //$.searchTable.visible = false;
            //$.searchButton.title = 'Search';
            // Making table clickable!
            //$.searchTable.loading = false;
            // Log a user out
			User.logOut();
            Alloy.Globals.tabGroup.close();
            loginView = Alloy.createController('index').getView();
            loginView.open();      
        }
    });
};

riskAssessmentsTab.loadRiskAssessments();

riskAssessmentsTab.on("openRiskAssessment", function (e) {
    questionRendererTab.clear();
    $.tabGroup.setActiveTab($.questionRendererTab.getView());

    //activityIndicator.show();

    //questionRendererTab.setAssessment(interpreterModule.interpret(assessment), e.assessmentObject);
    questionRendererTab.setAssessment(e.assessmentObject);
    //activityIndicator.hide();
});

riskAssessmentsTab.on("openSearchTab", toggleSearch);

masterSearchTab.on("BackButtonClick", function (e) {
    $.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});

masterSearchTab.on("RefreshButtonClick", function (e) {
    masterSearchTab.setData();
});

function parseTrainData(xml_text) {

    if (xml_text !== null || typeof xml_text !== 'undefined') {
        var localParser = require('parser/localParser');
        var interpreter = require('interpreter/interpreterModule2');
        localParser = new localParser();

        var data = localParser.getQuestions(xml_text);
        if (typeof data === "undefined") {
            alert(L('no_data'));
            return;
        }
        var localDataHandler = require('localDataHandler/localDataHandler');
        var censusData = localDataHandler.addDefaultTrainInfo(curAssObj, data);

    } else {
        alert(L('no_data'));

    }
};

function parseCensusData(xml_text) {
    if (xml_text !== null || typeof xml_text !== 'undefined') {
        var localParser = require('parser/localParser');
        var interpreter = require('interpreter/interpreterModule2');
        localParser = new localParser();

        var data = localParser.getQuestions(xml_text);
        if (typeof data === "undefined") {
            alert(L('no_data'));
            return;
        }
        var localDataHandler = require('localDataHandler/localDataHandler');
        var censusData = localDataHandler.addDefaultCensus(curAssObj, data);

    } else {
        alert(L('no_data'));

    }
};

function parseData(xml_text, crosQues, crosAns, detaildID, crossingID, riskMap) {

    if (xml_text !== null || typeof xml_text !== 'undefined') {
        var localParser = require('parser/localParser');
        localParser = new localParser();
        var quesMap = [];
        var questionsData = localParser.getQuestions(xml_text);
        Ti.API.info("questionsData ==> " + JSON.stringify(questionsData));

        if (crosQues !== null || typeof crosQues !== 'undefined') {
            var crossingQuestions = localParser.getQuestions(crosQues);
            Ti.API.info("crossingQuestions ==> " + JSON.stringify(crossingQuestions));

            if (crosAns !== null || typeof crosAns !== 'undefined') {
                var crossingAnswers = localParser.getQuestions(crosAns);
                Ti.API.info("crossingAnswers ==> " + JSON.stringify(crossingAnswers));
                for (var i = 0; i < crossingAnswers[0].detailedData.length; i++) {
                    if (typeof crossingAnswers[0].detailedData[i]["ns7:parameterValue"] !== "undefined" &&
                        typeof crossingAnswers[0].detailedData[i]["ns7:parameterName"] !== "undefined") {

                        quesMap[crossingAnswers[0].detailedData[i]["ns7:parameterName"]["#text"]] = {
                            value: crossingAnswers[0].detailedData[i]["ns7:parameterValue"]["#text"]
                        };
                    }

                }
                Ti.API.info("crossingAnswers ==> " + JSON.stringify(crossingAnswers));
            }
        }


        if (typeof questionsData === "undefined") {
            alert(L('no_data'));
            Alloy.Globals.aIndicator.hide();
            return;
        }
        var localDataHandler = require('localDataHandler/localDataHandler');
        curAssObj = localDataHandler.addNewAssessment(crossingQuestions.concat(questionsData), Alloy.Globals.currentCrossingName, detaildID, crossingID, quesMap);


    } else {
        alert(L('no_data'));

    }
};

detailSearchTab.on("BackButtonClick", function (e) {
    $.tabGroup.setActiveTab(masterSearchTab.getView());
});

masterSearchTab.on("crossingSelected", function (crossingDetail) {
	
    Alloy.Globals.currentCrossingName = crossingDetail.name;
    Alloy.Globals.currentCrossingDetailID = crossingDetail.id;
    Alloy.Globals.aIndicator.show("Creating Risk Assessment...");
    
    var assData2 = [];
    var riskMap = {};
    
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
                    var xml2 = new XMLTools(xmlDocCrossAns);
                    var crossObj = JSON.stringify(xml2.toObject());

                    //get Assessment Question Set
                    Alloy.Globals.Soap.getQuestionsRequest({
                            crossingId: crossingDetail.id,
                            groupType: "Assessment"
                        },
                        function (xmlDoc) {
                            var riskMap = [];
                            var xml2 = new XMLTools(xmlDoc);
                            var assObj = JSON.stringify(xml2.toObject());
                            //Ti.API.info("assObj >>> "+assObj);
                            if (typeof assObj === "undefined") {
                                alert(L('no_data'));
                                Alloy.Globals.aIndicator.hide();
                                return;
                            } else {
                                parseData(xmlDoc, xmlDocCrossQues, xmlDocCrossAns, /*crossingDetail.detailId*/ 0, crossingDetail.id, riskMap);

                                //get Census Question Set
                                Alloy.Globals.Soap.getQuestionsRequest({
                                        crossingId: crossingDetail.id,
                                        groupType: "Census"
                                    },
                                    function (xmlDoc) {
                                        parseCensusData(xmlDoc, assObj);

                                    },
                                    function (xmlDoc) {});
                                //end of get census question set

                                //get Train Question Set
                                Alloy.Globals.Soap.getQuestionsRequest({
                                        crossingId: crossingDetail.id,
                                        groupType: "Train"
                                    },
                                    function (xmlDoc) {
                                        parseTrainData(xmlDoc, assObj);
                                        var localDataHandler = require('localDataHandler/localDataHandler');

                                        //DO THIS 3 TIMES Because as far we know they need 3 train info groups
                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);
                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);
                                        localDataHandler.addNewTrainGroupToAssessment(curAssObj, []);

                                        if (typeof curAssObj === "undefined") {
                                            alert(L('no_data'));

                                        } else {
                                            riskAssessmentsTab.loadRiskAssessments();
                                            questionRendererTab.setAssessment(curAssObj);
                                            $.tabGroup.setActiveTab(questionRendererTab.getView());
                                        }
                                        Alloy.Globals.aIndicator.hide();
                                    },
                                    function (xmlDoc) {});
                                //end of get Train Question Set
                            }
                        }, //end of get Question Request Success function
                        function (xmlDoc) {});
                    //end of get Question Request Failure function
                }, function () {});
        }, function () {});
});

questionRendererTab.on("saveAndExitClick", function (e) {
    riskAssessmentsTab.loadRiskAssessments();
    $.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});
questionRendererTab.on("openMenu", openMenu);