//var Alloy.Globals.User = require('core/Alloy.Globals.User');
var currentAssessmentObject = null;
//var Alloy.Globals.localDataHandler = require('Alloy.Globals.localDataHandler/Alloy.Globals.localDataHandler');
//var interpreter = require('interpreter/interpreterModule2');
//var aIndicator = Alloy.createController('userNotificationWindows/Alloy.Globals.aIndicatorDialog');

Alloy.Globals.questionRenderer = null;
Alloy.Globals.questionRenderer = $.questionListView;

exports.getAssessment = function() {
    return currentAssessmentObject;
};

exports.setAssessment = function(assessmentObject) {
    Alloy.Globals.aIndicator.show();
    $.appTitle.text = assessmentObject.crossingName;
    currentAssessmentObject = assessmentObject;
    var sectionList = Alloy.Globals.localDataHandler.openAssessment(assessmentObject);
    $.questionListView.setAssessment(sectionList, assessmentObject);
    Alloy.Globals.aIndicator.hide();
};

exports.clear = function() {
    $.questionListView.clear();
};


function saveAndExitClick(e) {
    $.appTitle.text = ''; 
    if (currentAssessmentObject !== null) {
        Alloy.Globals.localDataHandler.updateQuestionCount(currentAssessmentObject);
    }
    $.trigger("saveAndExitClick");
}

var createCensus = function() {
    currentAssessmentObject;
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
        alert(L('max_census'));
        return;
    }
    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, []);
    //var censusDataInterpreted = interpreter.interpret(censusData);
    $.questionListView.appendSectionsToAssessment(censusData);
};

var createPastCensus = function(pastCensusData) {
    currentAssessmentObject;
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
        alert(L('max_census'));
        return;
    }
    Ti.API.info("pastCensusData >> " + JSON.stringify(pastCensusData));
    var cenMap = [];
    for (var t = 0; t < pastCensusData.length; t++) {
        if (typeof pastCensusData[t]["xsi:type"] !== "undefined") {
            cenMap[pastCensusData[t]["ns6:parameterName"]] = {
                value: pastCensusData[t]["ns6:values"]
            };
            Ti.API.info("paramName=" + pastCensusData[t]["ns6:parameterName"] + "type=" + pastCensusData[t]["xsi:type"]);
        } else {
            cenMap[pastCensusData[t]["ns6:parameterName"]] = {
                value: pastCensusData[t]["ns6:parameterValue"]
            };
        }
    }

    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, cenMap);
    $.questionListView.appendSectionsToAssessment(censusData);
};

var gotoQuestionSectionWindow = null;

/*
gotoQuestionSectionWindow.on("goToQuestion", function (data) {
	Ti.API.info("gotoQuestionSectionWindow : goToQuestion");
    $.questionListView.moveToQuestion(data.groupType, data.questionIndex);
});
*/

Ti.App.addEventListener("goToQuestion", function(e) {
    Ti.API.info("gotoQuestionSectionWindow : goToQuestion");
    $.questionListView.moveToQuestion(e.groupType, e.questionIndex);
});

/*
gotoQuestionSectionWindow.on("createCensus", function (data) {
	Ti.API.info("gotoQuestionSectionWindow : createCensus");
    Alloy.Globals.aIndicator.show();
	
    createCensus();
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    Alloy.Globals.aIndicator.hide();
});
*/

Ti.App.addEventListener("createCensus", function(e) {

    Alloy.Globals.aIndicator.show();
    createCensus();
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    Alloy.Globals.aIndicator.hide();
});

/*
gotoQuestionSectionWindow.on("addPastCensus", function (e) {
    //alert("addPastCensus back = "+JSON.stringify(e));
    Alloy.Globals.aIndicator.show();

    //createCensus();
    createPastCensus(e.questionList);
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    Alloy.Globals.aIndicator.hide();
});
*/

Ti.App.addEventListener("addPastCensus", function(e) {
    Alloy.Globals.aIndicator.show();

    //createCensus();
    createPastCensus(e.questionList);
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    Alloy.Globals.aIndicator.hide();
});

/*
gotoQuestionSectionWindow.on("censusDesktopComplete", function (e) {
     currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
     currentAssessmentObject.censusDesktopComplete = true;
     Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);
});
*/

Ti.App.addEventListener("censusDesktopComplete", function(e) {
	//Ti.App.fireEvent("createCensus");
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    currentAssessmentObject.censusDesktopComplete = true;
    Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);
    //alert("censusDesktopComplete = "+currentAssessmentObject.censusDesktopComplete);
});

/*
gotoQuestionSectionWindow.on("goToFirstUnanswered", function (data) {
    $.questionListView.goToFirstUnanswered();
});
*/

Ti.App.addEventListener("goToFirstUnanswered", function(e) {
    $.questionListView.goToFirstUnanswered();
});

/*
gotoQuestionSectionWindow.on("goToLastPositiond", function (e) {
    $.questionListView.goToLastPositiond();
});*/

Ti.App.addEventListener("goToLastPositiond", function(e) {
    $.questionListView.goToLastPositiond();
});

/*
gotoQuestionSectionWindow.on("deletePage", function (e) {
    //alert("delete associatedFileName = "+e.associatedFileName);
    Alloy.Globals.aIndicator.show();

    if (Alloy.Globals.localDataHandler.deleteAssociatedFileNameFromAssessment(currentAssessmentObject, e.associatedFileName) == true) {
        var sectionList = Alloy.Globals.localDataHandler.openAssessment(currentAssessmentObject);
        $.questionListView.setAssessment(sectionList, currentAssessmentObject);
        gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());
    }

    Alloy.Globals.aIndicator.hide();
});
*/


Ti.App.addEventListener("deletePage", function(e) {

    var deletingRow = e;

    var alertYesNo = Titanium.UI.createAlertDialog({
        message: L('delete_census'),
        buttonNames: ['Yes', 'No']
    });

    alertYesNo.addEventListener('click', function(e) {
        if (e.index == 0) {
            /*
             * YES was clicked.
             */
            Ti.API.info("gotoQuestionSectionWindow : deletePage");
            Alloy.Globals.aIndicator.show();

            if (Alloy.Globals.localDataHandler.deleteAssociatedFileNameFromAssessment(currentAssessmentObject, deletingRow.associatedFileName) == true) {
                var sectionList = Alloy.Globals.localDataHandler.openAssessment(currentAssessmentObject);
                $.questionListView.setAssessment(sectionList, currentAssessmentObject);
                gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());
            }

            Alloy.Globals.aIndicator.hide();
        } else if (e.index == 1) {

        }
    });

    alertYesNo.show();


});

var showGoto = function() {
    gotoQuestionSectionWindow = Alloy.createController('gotoQuestionSectionWindow/gotoQuestionSectionWindow');
    gotoQuestionSectionWindow.setAssessmentObject(currentAssessmentObject);
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    gotoQuestionSectionWindow.show();
};


// Setting up menu item for home screen
var openMenu = function() {

    // Check whether settings are filled 
    if (!Alloy.Globals.User.hasPreferences()) {
        // Open setting screen
        var userSettings = Alloy.createController('userSettings', {
            message: true
        }).getView();
        userSettings.open();
        return false;
    }

    //var Ui = require('core/Ui'),
    popOver = Alloy.Globals.Ui.renderPopOver({
        width: 250
    }),
    menuTable = Ti.UI.createTableView({
        width: 250,
        height: Ti.UI.SIZE
    }),
    data = [{
            title: 'GoTo',
            id: 2
        }, {
            title: 'Help',
            id: 3
        }, {
            title: 'Table Lock',
            id: 7
        }, {
            title: 'Save & Exit',
            id: 6
        }
        /*{
            title: 'Cheat Sheet',
            id: 4
        }, {
            title: 'Logout',
            id: 5
        }*/
    ];
    /*var userPreferences = Alloy.Globals.Alloy.Globals.User.getPreferences();
	if(userPreferences.singleView == false || userPreferences.singleView == "false")
	{
	   data.push({
            title: 'GoTo',
            id: 2
       });
	}*/

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
            showGoto();
        } else if (e.row.id === 3) {
            // Help screen 
            var appHelp = Alloy.createController('appHelp').getView();
            appHelp.open();
        } else if (e.row.id === 4) {
            var cheatSheet = Alloy.createController('cheatSheet').getView();
            cheatSheet.open();
        } else if (e.row.id === 5) {

            Alloy.Globals.tabGroup.close();
            loginView = Alloy.createController('index').getView();
            loginView.open();
            Alloy.Globals.User.logOut();
        } else if (e.row.id === 6) {
            if (currentAssessmentObject !== null) {
                Alloy.Globals.localDataHandler.updateQuestionCount(currentAssessmentObject);
            }
            $.trigger("saveAndExitClick");
        } else if (e.row.id === 7) {
            $.questionListView.toggleScrollLock();
        }
    });
};