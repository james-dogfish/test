var User = require('core/User');
var loginView;
var Util = require('core/Util');

// Set current tab globally so that other windows can be opened
Alloy.Globals.currentTab = $.tab1;
Alloy.Globals.tabGroup = $.tabGroup;

var activityIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
var localDataHandler = require('localDataHandler/localDataHandler');

var interpreterModule = require('interpreter/interpreterModule2');

var riskAssessmentsTab = $.riskAssessmentsTab;
var questionRendererTab = $.questionRendererTab;
Alloy.Globals.questionRendererTab = questionRendererTab;
var masterSearchTab = $.masterSearchTab;
var detailSearchTab = $.detailSearchTab;

var curAssObj = null;


var xmlTestFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "testFiles/test_question_set.xml");
var xmltext = xmlTestFile.read().text;
var JASON_question_list = Alloy.Globals.localParser.getQuestions(xmltext);

var interpreterModule2 = require('interpreter/interpreterModule2');
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
var windowFocused = function () {
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
        data = [{
            title: 'Settings',
            id: 1
        }, {
            title: 'GoTo',
            id: 2
        }, {
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

            Alloy.Globals.tabGroup.close();
            loginView = Alloy.createController('index').getView();
            loginView.open();
            User.logOut();
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

/*masterSearchTab.on("crossingSelected", function (crossingObject) {
    //alert("crossing name : "+crossingObject.name);
    $.tabGroup.setActiveTab(detailSearchTab.getView());
    Alloy.Globals.currentCrossingName = crossingObject.name;
    Alloy.Globals.aIndicator.show("Loading...");
    detailSearchTab.setData(crossingObject);

});*/
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
		if(typeof data === "undefined")
		{
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
		if(typeof data === "undefined")
		{
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
        Ti.API.info("questionsData ==> "+JSON.stringify(questionsData));
        
        if (crosQues !== null || typeof crosQues !== 'undefined') {
        	var crossingQuestions = localParser.getQuestions(crosQues);
       		 Ti.API.info("crossingQuestions ==> "+JSON.stringify(crossingQuestions));
       		 
       		 	if (crosAns !== null || typeof crosAns !== 'undefined') {
        			var crossingAnswers = localParser.getQuestions(crosAns);
        			for(var i = 0; i< crossingAnswers.detailedData.length; i++)
        			{
        				if(typeof crossingAnswers.detailedData[i]["ns7:parameterValue"] !== "undefined" &&
        					typeof crossingAnswers.detailedData[i]["ns7:parameterName"] !== "undefined")
        				{
        					
							quesMap[crossingAnswers.detailedData[i]["ns7:parameterName"]["#text"]] = {
                					value: crossingAnswers.detailedData[i]["ns7:parameterValue"]["#text"]
           					 };
        				}
        				
        			}
       				 Ti.API.info("crossingAnswers ==> "+JSON.stringify(crossingAnswers));
       			}
       	}
       
       	
		if(typeof questionsData === "undefined")
		{
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
	//alert(JSON.stringify(crossingDetail));
    //alert("crossing name : "+crossingObject.name);
    Alloy.Globals.currentCrossingName = crossingDetail.name;
    
    //alert(JSON.stringify(crossingDetail));
    Alloy.Globals.aIndicator.show("Loading...");
    var assData2 = [];
    var riskMap = {};
    Alloy.Globals.currentCrossingDetailID = crossingDetail.id;

    /*Alloy.Globals.Soap.getAssessment({
            assessmentId: crossingDetail.id
        },
        function (xmlDoc) {

            var XMLTools = require("tools/XMLTools");
            var xml2 = new XMLTools(xmlDoc);
            var assObj = JSON.stringify(xml2.toObject());

            var data2 = JSON.parse(assObj);
            var results = data2["soapenv:Body"]["ns9:GetAssessmentResponse"]["ns9:assessment"]["ns5:riskData"];
            if (typeof results === undefined || results === "undefined") {
                Alloy.Globals.aIndicator.hide();
                var Util = require('core/Util');
                Util.showAlert("No Results");

            } else {
                //alert('getAssessment Success response >> ' + JSON.stringify(results));
                for (var i = 0; i < results.length; i++) {
                    riskMap[results[i]["ns6:parameterName"]] = null;
                    var paramDetails = new Array();
                    paramDetails.push({
                        paramValue: results[i]["ns6:parameterValue"],
                        displayValue: results[i]["ns6:displayValue"]
                    });
                    riskMap[results[i]["ns6:parameterName"]] = paramDetails;
                }*/
                Alloy.Globals.Soap.getQuestionsRequest({
			                        crossingId: crossingDetail.id,
			                        groupType: "Crossing"
			    },
			    function (xmlDocCrossQues){
				                Alloy.Globals.Soap.getCrossingRequest({
				                        crossingId: crossingDetail.id
				                    },
				                     function (xmlDocCrossAns){
				                    	 var riskMap = [];
				                    	 var XMLTools = require("tools/XMLTools");
				            			 var xml2 = new XMLTools(xmlDocCrossAns);
				                    	 var crossObj = JSON.stringify(xml2.toObject());
				                    	 //Ti.API.info("crssoObj >>> "+crossObj);
							                     
							                //get Assessment Question Set
							                Alloy.Globals.Soap.getQuestionsRequest({
							                        crossingId: crossingDetail.id,
							                        groupType: "Assessment"
							                    },
							                    function (xmlDoc){
							                    	 var riskMap = [];
							                    	 var XMLTools = require("tools/XMLTools");
							            			 var xml2 = new XMLTools(xmlDoc);
							                    	 var assObj = JSON.stringify(xml2.toObject());
							                    	 Ti.API.info("assObj >>> "+assObj);
							                    	 if(typeof assObj === "undefined")
							               			 {
							               					 	alert(L('no_data'));
							               					 	Alloy.Globals.aIndicator.hide();
							               					 	return;
							               			 }else{
							               					 	
							               					 
									                         parseData(xmlDoc, xmlDocCrossQues,xmlDocCrossAns,/*crossingDetail.detailId*/ 0, crossingDetail.id, riskMap);
									
									                        	//get Census Question Set
									                        	Alloy.Globals.Soap.getQuestionsRequest({
									                                crossingId: crossingDetail.id,
									                                groupType: "Census"
									                            },
									                            function (xmlDoc) {
									                                parseCensusData(xmlDoc, assObj);
									     
									                            },
									                            function (xmlDoc) {
									                                var XMLTools = require("tools/XMLTools");
									                                var xml = new XMLTools(xmlDoc);
									                                Alloy.Globals.aIndicator.hide();
									                                Ti.API.info('getQuestionReqeust Error response >> ' + xml.toJSON());
									
									                            });//end of get census question set
									
									                        	//get Train Question Set
									                        	Alloy.Globals.Soap.getQuestionsRequest({
									                                crossingId: crossingDetail.id,
									                                groupType: "Train"
									                            },
									                            function (xmlDoc) {
									                                parseTrainData(xmlDoc, assObj);
									                                var localDataHandler = require('localDataHandler/localDataHandler');
									                                
									                                //DO THIS 4 TIMES Because as far we know they need 4 train info groups
									                                localDataHandler.addNewTrainGroupToAssessment(curAssObj,[]);
									                                localDataHandler.addNewTrainGroupToAssessment(curAssObj,[]);
									                                localDataHandler.addNewTrainGroupToAssessment(curAssObj,[]);
									                               // localDataHandler.addNewTrainGroupToAssessment(curAssObj,[]);
									                                 //Alloy.Globals.aIndicator.hide();
									               					 //detailSearchTab.setData(crossingDetail);
									               					 
									               					 if(typeof curAssObj === "undefined")
									               					 {
									               					 	alert(L('no_data'));
									               					 	
									               					 }else{
									               					 	riskAssessmentsTab.loadRiskAssessments();
									               					 	questionRendererTab.setAssessment(curAssObj);
																     	$.tabGroup.setActiveTab(questionRendererTab.getView());	
									               					 }
									               					
																    
																     
																      Alloy.Globals.aIndicator.hide();
									                            },
									                            function (xmlDoc) {
									                                var XMLTools = require("tools/XMLTools");
									                                var xml = new XMLTools(xmlDoc);
									                                Alloy.Globals.aIndicator.hide();
									                                Ti.API.info('getQuestionReqeust Error response >> ' + xml.toJSON());
																});//end of get Train Question Set
									                  }
							                            
							                            
							                      
							                    },//end of get Question Request Success function
							                    function (xmlDoc) {
							                        var XMLTools = require("tools/XMLTools");
							                        var xml = new XMLTools(xmlDoc);
							                        Alloy.Globals.aIndicator.hide();
							                        Ti.API.info('getQuestionReqeust Error response >> ' + xml.toJSON());
							
							                    });//end of get Question Request Failure function
							                },function(){});
							  },function(){});
			      });
        /*},
        function (xmlDoc) {
            var XMLTools = require("tools/XMLTools");
            var xml2 = new XMLTools(xmlDoc);
        });
});*/

questionRendererTab.on("BackButtonClick", function (e) {
	riskAssessmentsTab.loadRiskAssessments();
    $.tabGroup.setActiveTab($.riskAssessmentsTab.getView());
});
questionRendererTab.on("openMenu", openMenu);