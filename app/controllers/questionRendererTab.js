var currentAssessmentObject = null;

Alloy.Globals.questionRenderer = null;
Alloy.Globals.questionRendererTab = this;

/**
`getAssessment` gets the assessmentObject the questionRender is displaying

@method getAssessment

@return {JSON_obejct} assessmentObject
*/
exports.getAssessment = function() {
    return currentAssessmentObject;
};

/**
`setAssessment` use the assessmentObject to to populate the list view. first 

@method setAssessment

@param {JSON_obejct} assessmentObject

@return {} n/a
*/
exports.setAssessment = function(assessmentObject) {
	Alloy.Globals.aIndicator.show();
	if(Alloy.Globals.questionRenderer != null){
    	$.window.remove(Alloy.Globals.questionRenderer.getView());
    	Alloy.Globals.questionRenderer.destroy();
    	Alloy.Globals.questionRenderer = null;
    }
        
        
	Alloy.Globals.questionRenderer = Alloy.createController("questionRenderer");
	$.window.add(Alloy.Globals.questionRenderer.getView());
	
    
    $.appTitle.text = assessmentObject.crossingName;
    currentAssessmentObject = assessmentObject;
    var sectionList = Alloy.Globals.localDataHandler.openAssessment(assessmentObject);
    
    Alloy.Globals.questionRenderer.setAssessment(sectionList, assessmentObject);
    Alloy.Globals.aIndicator.hide();
    // Call analytics functions here
    Alloy.Globals.Analytics.trackNav('Home', 'Assessment Form', 'ra:open');
    Alloy.Globals.Analytics.trackFeature('RiskAssessment:Opened');
};


/**
`clear` clear all questions in the QuestionRenderer

@method clear

@return {} n/a
*/
exports.clear = function() {
	if(Alloy.Globals.questionRenderer != null){
    	Alloy.Globals.questionRenderer.clear();
   	}
};


var gotoQuestionSectionWindow = null;

Ti.App.addEventListener("goToQuestion", function(e) {
    Alloy.Globals.Logger.log("gotoQuestionSectionWindow : goToQuestion","info");
    if(Alloy.Globals.questionRenderer != null){
    	Alloy.Globals.questionRenderer.moveToQuestion(e.groupType, e.questionIndex);
    }
});


var createCensus= function(){
	
	try{
		
		if(currentAssessmentObject === null){
			Alloy.Globals.Logger.log("questionRendererTab createCensus :  currentAssessmentObject == null","error");
			return;
		}
		Alloy.Globals.aIndicator.show();
		
	    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
	    if (currentAssessmentObject.censusQuestionsfileNameList.length >= 2) {
	    	Alloy.Globals.aIndicator.hide();
	        alert(L('max_census'));
	        return;
	    }
	    var censusData = Alloy.Globals.localDataHandler.addNewCensusToAssessment(currentAssessmentObject, []);
	    
	    if(Alloy.Globals.questionRenderer != null){
	    	Alloy.Globals.questionRenderer.appendSectionsToAssessment(censusData);
	   		gotoQuestionSectionWindow.setContentsDetails(Alloy.Globals.questionRenderer.getGoToContentsDetails());
	    }
	
	    Alloy.Globals.aIndicator.hide();
   }catch(e){
   		Alloy.Globals.Logger.logException(e);
   		Alloy.Globals.aIndicator.hide();
   }
};
exports.createCensus= createCensus;

Ti.App.addEventListener("addPastCensus", function(e) {
	
	try{
		
	if(currentAssessmentObject === null){
		Alloy.Globals.Logger.log("questionRendererTab createCensus :  currentAssessmentObject == null","error");
		return;
	}
		
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
    
    if(Alloy.Globals.questionRenderer != null){
    	Alloy.Globals.questionRenderer.appendSectionsToAssessment(censusData);
    	
    	gotoQuestionSectionWindow.setContentsDetails(Alloy.Globals.questionRenderer.getGoToContentsDetails());
    }

    Alloy.Globals.aIndicator.hide();
    }catch(e){
    	Alloy.Globals.Logger.logException(e);
    	Alloy.Globals.aIndicator.hide();
    }
});

Ti.App.addEventListener("censusDesktopComplete", function(e) {
	
	if(currentAssessmentObject === null){
		Alloy.Globals.Logger.log("questionRendererTab censusDesktopComplete :  currentAssessmentObject == null","error");
		return;
	}
		
    currentAssessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(currentAssessmentObject);
    currentAssessmentObject.censusDesktopComplete = true;
    Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(currentAssessmentObject);

});

Ti.App.addEventListener("goToFirstUnanswered", function(e) {
	if(Alloy.Globals.questionRenderer != null){
    	Alloy.Globals.questionRenderer.goToFirstUnanswered();
   	}
});

Ti.App.addEventListener("goToLastPositiond", function(e) {
	if(Alloy.Globals.questionRenderer != null){
    	Alloy.Globals.questionRenderer.goToLastPositiond();
    }
});

Ti.App.addEventListener("deletePage", function(e) {

	if(currentAssessmentObject === null){
		Alloy.Globals.Logger.log("questionRendererTab deletePage :  currentAssessmentObject == null","error");
		return;
	}
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
               
               if(Alloy.Globals.questionRenderer != null){
	                Alloy.Globals.questionRenderer.pageDeletedEvent(deletingRow.associatedFileName);
	                Alloy.Globals.questionRenderer.setAssessment(sectionList, currentAssessmentObject);
	                gotoQuestionSectionWindow.setContentsDetails(Alloy.Globals.questionRenderer.getGoToContentsDetails());
               }
            }

            Alloy.Globals.aIndicator.hide();
        } else if (e.index == 1) {

        }
    });

    alertYesNo.show();
});

var showGoto = function() {
	
	if(currentAssessmentObject === null){
		Alloy.Globals.Logger.log("questionRendererTab showGoto :  currentAssessmentObject == null","error");
		return;
	}
	
    gotoQuestionSectionWindow = Alloy.createController('gotoQuestionSectionWindow/gotoQuestionSectionWindow');
    gotoQuestionSectionWindow.setAssessmentObject(currentAssessmentObject);
    
    if(Alloy.Globals.questionRenderer != null){
    	gotoQuestionSectionWindow.setContentsDetails(Alloy.Globals.questionRenderer.getGoToContentsDetails());
    }

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
    
    if(Alloy.CFG.debug == true){
    	data.push({title : "auto complete", id : 8});
    }
    
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
        	if(currentAssessmentObject === null){
				Alloy.Globals.Logger.log("questionRendererTab openMenu item click Save & Exit:  currentAssessmentObject == null","error");
				return;
			}
	
			$.appTitle.text = "";
            Alloy.Globals.localDataHandler.updateQuestionCount(currentAssessmentObject);
            if(Alloy.Globals.questionRenderer != null){
            	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
            	Alloy.Globals.questionRenderer.saveCurrentlySelectedQuestion();
	        	$.window.remove(Alloy.Globals.questionRenderer.getView());
	        	Alloy.Globals.questionRenderer.destroy();
	        	Alloy.Globals.questionRenderer = null;
	        }
            
            currentAssessmentObject = null;
            $.trigger("saveAndExitClick");
            
        } else if (e.row.id === 7) {
        	if(Alloy.Globals.questionRenderer != null){
            	Alloy.Globals.questionRenderer.toggleScrollLock();
           	}
        }else if (e.row.id === 8) {
        	if(Alloy.Globals.questionRenderer != null){
        		Alloy.Globals.aIndicator.show();
            	Alloy.Globals.questionRenderer.autoComplteAllQuestion();
            	Alloy.Globals.aIndicator.hide();
           	}
        }
    });
};