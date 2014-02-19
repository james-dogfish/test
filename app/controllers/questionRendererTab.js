var currentAssessmentObject = null;

Alloy.Globals.questionRenderer = null;
Alloy.Globals.questionRenderer = $.questionListView;
Alloy.Globals.questionRendererTab = this;

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
    // Call analytics functions here
    Alloy.Globals.Analytics.trackNav('Home', 'Assessment Form', 'ra:open');
    Alloy.Globals.Analytics.trackFeature('RiskAssessment:Opened');
};

exports.clear = function() {
    $.questionListView.clear();
};


function saveAndExitClick(e) {
    $.appTitle.text = ''; 
    if (currentAssessmentObject !== null) {
        Alloy.Globals.localDataHandler.updateQuestionCount(currentAssessmentObject);
    }
    $.trigger("saveAndExitClick"); // TODO - Why is this being clicked multiple times ??
}

/*var createCensus = function() {
    currentAssessmentObject;
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
        alert(L('max_census'));
        return;
    }
    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, []);
    $.questionListView.appendSectionsToAssessment(censusData);
};*/

/*var createPastCensus = function(pastCensusData) {
    currentAssessmentObject;
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
        alert(L('max_census'));
        return;
    }
    Alloy.Globals.Logger.log("pastCensusData >> " + JSON.stringify(pastCensusData),"info");
    var cenMap = [];
    for (var t = 0; t < pastCensusData.length; t++) {
        if (typeof pastCensusData[t]["xsi:type"] !== "undefined") {
            cenMap[pastCensusData[t]["ns6:parameterName"]] = {
                value: pastCensusData[t]["ns6:values"]
            };
            Alloy.Globals.Logger.log("paramName=" + pastCensusData[t]["ns6:parameterName"] + "type=" + pastCensusData[t]["xsi:type"],"info");
        } else {
            cenMap[pastCensusData[t]["ns6:parameterName"]] = {
                value: pastCensusData[t]["ns6:parameterValue"]
            };
        }
    }

    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, cenMap);
    $.questionListView.appendSectionsToAssessment(censusData);
};*/

var gotoQuestionSectionWindow = null;

Ti.App.addEventListener("goToQuestion", function(e) {
    Alloy.Globals.Logger.log("gotoQuestionSectionWindow : goToQuestion","info");
    $.questionListView.moveToQuestion(e.groupType, e.questionIndex);
});


var createCensus= function(){
	
	try{
		Alloy.Globals.aIndicator.show();
		
	    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
	    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
	    	Alloy.Globals.aIndicator.hide();
	        alert(L('max_census'));
	        return;
	    }
	    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, []);
	    $.questionListView.appendSectionsToAssessment(censusData);
	    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());
	
	    Alloy.Globals.aIndicator.hide();
   }catch(e){
   		alert("DEBUG: An exception occured!!!! Details for dev: "+JSON.stringify(e));
   		Alloy.Globals.aIndicator.hide();
   }
};
exports.createCensus= createCensus;

Ti.App.addEventListener("addPastCensus", function(e) {
	
	try{
    Alloy.Globals.aIndicator.show();

     currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
    	Alloy.Globals.aIndicator.hide();
        alert(L('max_census'));
        return;
    }
    Alloy.Globals.Logger.log("pastCensusData >> " + JSON.stringify(e.questionList),"info");
    var cenMap = [];
   
    for (var t = 0; t < e.questionList.length; t++) {
    	//alert(e.questionList[t].parameterName);
        if (typeof e.questionList[t].type !== "undefined") {
            cenMap[e.questionList[t].parameterName] = {
                value: e.questionList[t].values
            };
        } else {
            cenMap[e.questionList[t].parameterName] = {
                value: e.questionList[t].parameterValue
            };
        }
        
        
    }

    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, cenMap);
    $.questionListView.appendSectionsToAssessment(censusData);
    
    gotoQuestionSectionWindow.setContentsDetails($.questionListView.getGoToContentsDetails());

    Alloy.Globals.aIndicator.hide();
    }catch(e){
    	Alloy.Globals.aIndicator.hide();
    }
});

Ti.App.addEventListener("censusDesktopComplete", function(e) {
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    currentAssessmentObject.censusDesktopComplete = true;
    Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);
});

Ti.App.addEventListener("goToFirstUnanswered", function(e) {
    $.questionListView.goToFirstUnanswered();
});

Ti.App.addEventListener("goToLastPositiond", function(e) {
    $.questionListView.goToLastPositiond();
});

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
            Alloy.Globals.Logger.log("gotoQuestionSectionWindow : deletePage","info");
            Alloy.Globals.aIndicator.show();

            if (Alloy.Globals.localDataHandler.deleteAssociatedFileNameFromAssessment(currentAssessmentObject, deletingRow.associatedFileName) == true) {
                var sectionList = Alloy.Globals.localDataHandler.openAssessment(currentAssessmentObject);
                $.questionListView.pageDeletedEvent(deletingRow.associatedFileName);
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
    ];
    
    menuTable.setData(data);

    popOver.add(menuTable);

    popOver.show({
        view: $.menuButton
    });

    menuTable.addEventListener('click', function(e) {
        popOver.hide();
        if (e.row.id === 2) {
            // GoTo screen
            showGoto();
        } else if (e.row.id === 3) {
            // Help screen 
            var appHelp = Alloy.createController('appHelp').getView();
            appHelp.open();
        } else if (e.row.id === 6) {
            if (currentAssessmentObject !== null) {
                Alloy.Globals.localDataHandler.updateQuestionCount(currentAssessmentObject);
            }
            Alloy.Globals.questionRenderer.saveCurrentlySelectedQuestion();
            $.trigger("saveAndExitClick");
        } else if (e.row.id === 7) {
            $.questionListView.toggleScrollLock();
        }
    });
};