//var User = require('core/User');
// Trying out fontawesome
var fontawesome = require('tools/fonts/IconicFont').IconicFont({
	font: 'tools/fonts/FontAwesome',
	ligature: false // optional
});

Alloy.Globals.fontawesome = {
	fontfamily: fontawesome.fontfamily()
};

Alloy.Globals.riskAssessmentWindow = this;

var assessmentRowControllerList = [];

var getAssessmentRowController = function(assessmentID){
	var assessmentRow = null;
	for(var i=0; i < assessmentRowControllerList.length; i++){
		
		if(assessmentRowControllerList[i].getAssessmentID() == assessmentID){
			Ti.API.info("found assessmentRow = "+JSON.stringify(assessmentRowControllerList[i]));
			assessmentRow = assessmentRowControllerList[i];
			break;
		}
	}
	return assessmentRow;
};

var clearAllSubmitMessages = function(assessmentID){

	for(var i=0; i < assessmentRowControllerList.length; i++){
		assessmentRowControllerList[i].clearCommitResponseMessages();
	}

};


exports.assessmentIncomplete = function(assObj){
	//alert("assessmentIncomplete called");
	//alert("assessmentIncomplete e="+JSON.stringify(e));
	Ti.API.error("assessmentIncomplete >> "+assObj.assessmentID);
	Ti.API.error("assessmentIncomplete assObj>> "+JSON.stringify(assObj));
	var assessmentRow = getAssessmentRowController(assObj.assessmentID);
	if(assessmentRow != null){
		assessmentRow.commitResponseAssessmentIncomplete();
	}
};

exports.assessmentSubmitMessage = function(assObj,success){
	Ti.API.info("AssessmentSubmitMessage called");
	var assessmentRow = getAssessmentRowController(assObj.assessmentID);
	if(assessmentRow != null){
		Ti.API.info("AssessmentSubmitMessage commitResponse = "+success);
		assessmentRow.commitResponse(success);
	}
};



//var localDataHandler = require('localDataHandler/localDataHandler');

var activeAssessments = [];

// Setting up menu item for home screen
var openMenu = function() {

	
	// Check whether settings are filled 
	/*if (!Alloy.Globals.User.hasPreferences()) {
		// Open setting screen
		var userSettings = Alloy.createController('userSettings', {
			message: true
		}).getView();
		userSettings.open();
		return false;
	}*/

	//var Ui = require('core/Ui'),
	popOver = Alloy.Globals.Ui.renderPopOver({
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
		}  else if (e.row.id === 3) {
			// Help screen 
			var appHelp = Alloy.createController('appHelp').getView();
			appHelp.open();
		} else if (e.row.id === 4) {
			// Commit all assessments
			//var responseGenerator = require('responseGenerator/responseGenerator');
			//responseGenerator  = new responseGenerator();
			if(Alloy.Globals.User.hasPreferences())
			{
				clearAllSubmitMessages();
				Alloy.Globals.responseGenerator.commitAllCompleted();
			}else{
				var userSettings = Alloy.createController('userSettings', {
					message : true
				}).getView();
				userSettings.open();
			}
			
			
		} else if (e.row.id === 5) {
			// Reset the searching table 
			//$.searchTable.visible = false;
			//$.searchButton.title = 'Search';
			// Making table clickable!
			//$.searchTable.loading = false;
			// Log a user out
			Alloy.Globals.User.logOut();
			Alloy.Globals.localDataHandler.clearCachedCrossing();
			Alloy.Globals.tabGroup.close();
			$.destroy;
			Alloy.createController('startup').getView().open();
		}
	});
};

exports.loadRiskAssessments = function() {
	
	activeAssessments = Alloy.Globals.localDataHandler.getAllSavedAssessments();
		
	var data = [];
	assessmentRowControllerList = [];
	
	
	for(var i=0; i < activeAssessments.length; i++){
		assessmentRowControllerList.push(Alloy.createController("riskAssessments/riskAssessmentTableRow",{
				thisRA: activeAssessments[i],
				fontawesome: fontawesome
			}));
			
			
		data.push(assessmentRowControllerList[i].getView());
		
			
		if(i == 1){
			//assessmentRowControllerList[i].commitResponse(true, "train Info 1");
			//assessmentRowControllerList[i].commitResponse(true, "train Info 2");
			//assessmentRowControllerList[i].commitResponse(true, "train Info 3");
			//assessmentRowControllerList[i].commitResponse(false, "train Info 4");
		}

	}
	$.tableVeiw.setData(data);
	
	return true;
};

var confirmDeleteRA = Titanium.UI.createAlertDialog({ title: 'Delete RA', message: L('delete_ra'), buttonNames: ['Yes', 'No'], cancel: 1 });
confirmDeleteRA.addEventListener('click', function(e) { Titanium.API.info('e = ' + JSON.stringify(e));
   //Clicked cancel, first check is for iphone, second for android
   if (e.cancel === e.index || e.cancel === true) {
      return;
   }

    //now you can use parameter e to switch/case

   switch (e.index) {
      case 0: Titanium.API.info('Clicked button 0 (YES)');
      		  Alloy.Globals.localDataHandler.removeAssessment(e.rowData.customData);
      break;

      //This will never be reached, if you specified cancel for index 1
      case 1: Titanium.API.info('Clicked button 1 (NO)');
      break;

      default:
      break;

  }
});

function onDeleteRow(e){
  var deletingRow = e;
  
  var alertYesNo = Titanium.UI.createAlertDialog({
    message: L('delete_ra'),
    buttonNames: ['Yes','No']
  });
 
  alertYesNo.addEventListener('click', function(e) {
    if (e.index == 0) { 
      /*
       * YES was clicked.
       */
       Alloy.Globals.localDataHandler.removeAssessment(deletingRow.rowData.customData);
    } else if (e.index == 1) { 
      /*
       * Put the row back since it will be removed from the view even if NO is clicked.
       */
       activeAssessments = Alloy.Globals.localDataHandler.getAllSavedAssessments();
		
		var data = [];	
		for(var i=0; i < activeAssessments.length; i++){
			data.push(Alloy.createController("riskAssessments/riskAssessmentTableRow",
				{
					thisRA: activeAssessments[i],
					fontawesome: fontawesome
				}).getView());
		}
		$.tableVeiw.setData(data);
    }	 
  });
 
  alertYesNo.show();
};




var openSearchClick = function(e){
	if(Alloy.Globals.User.hasPreferences())
	{
		$.trigger("openSearchTab");
	}else{
		var userSettings = Alloy.createController('userSettings', {
			message : true
		}).getView();
		userSettings.open();
	}
};

function onRowClick(e){
	$.trigger("openRiskAssessment", {assessmentObject : activeAssessments[e.index]});
	//var assessment = Alloy.Globals.localDataHandler.openAssessment(activeAssessments[e.index].fileName);
	//Ti.API.info(assessment);
	/*
	var assessment = Alloy.Globals.localDataHandler.openAssessment(activeAssessments[e.index].fileName);
	if(assessment.length == 0){
		return;
	}
	
	if(assessment.length > 0){
		alert(assessment[0].name);
	}
	*/
	
};
