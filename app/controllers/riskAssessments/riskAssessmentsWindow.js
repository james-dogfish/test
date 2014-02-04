//var User = require('core/User');
// Trying out fontawesome
var fontawesome = require('tools/fonts/IconicFont').IconicFont({
	font: 'tools/fonts/FontAwesome',
	ligature: false // optional
});

Alloy.Globals.fontawesome = {
	fontfamily: fontawesome.fontfamily()
};

//var localDataHandler = require('localDataHandler/localDataHandler');

var activeAssessments = [];

// Setting up menu item for home screen
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
			responseGenerator.commitAllCompleted();
			
			
		} else if (e.row.id === 5) {
			// Reset the searching table 
			//$.searchTable.visible = false;
			//$.searchButton.title = 'Search';
			// Making table clickable!
			//$.searchTable.loading = false;
			// Log a user out
			User.logOut();
			localDataHandler.clearCachedCrossing();
			Alloy.Globals.tabGroup.close();
			$.destroy;
			Alloy.createController('startup').getView().open();
		}
	});
};

exports.loadRiskAssessments = function() {
	/*
	activeAssessments = Util.getActiveAssessments();
	if (!activeAssessments && !activeAssessments.length) {
		return false;
	}
	*/
	
	/*
	activeAssessments = [
			{crossingName : "Golborne", questionsCompleted : 10, questionCount : 10, alcrmStatus : "Sent"},
			{crossingName : "Power House No.1 (sleeping do)", questionsCompleted : 8, questionCount : 10, alcrmStatus : "not sent"},
			{crossingName : "Hammerwich", questionsCompleted : 50, questionCount : 100, alcrmStatus : "not sent"},
			{crossingName : "Twyford No.3", questionsCompleted : 3, questionCount : 20, alcrmStatus : "not sent"}
		];*/
		
	
	/*
	localDataHandler.clearAllSavedAssessments();
	localDataHandler.addNewAssessment(Alloy.Globals.parsedData, "Golborne");
	localDataHandler.addNewAssessment(Alloy.Globals.parsedData, "Power House No.1 (sleeping do)");
	localDataHandler.addNewAssessment(Alloy.Globals.parsedData, "Hammerwich");
	localDataHandler.addNewAssessment(Alloy.Globals.parsedData, "Twyford No.3");
	*/
	
	/*
	var xml_text = 
		"<ass:CreateAssessmentRequest>"+
        "<ass:assessment>"+
            "<ass1:crossingID>${#TestCase#crossing.id}</ass1:crossingID>"+
            "<ass1:detailId>${#TestCase#crossing.detailId}</ass1:detailId>"+
            "<ass1:riskData>"+
               "<ques:parameterName>I_CONDUCTOR</ques:parameterName>"+
               "<ques:parameterValue>405</ques:parameterValue>"+
            "</ass1:riskData>"+
            "<ass1:riskData>"+
               "<ques:parameterName>I_CONDUCTOR2</ques:parameterName>"+
               "<ques:values>604</ques:values>"+
               "<ques:values>603</ques:values>"+
            "</ass1:riskData>"+
           "</ass:assessment>"+
         "</ass:CreateAssessmentRequest>";
         

	var XMLTools = require('tools/XMLTools');
	XMLTools = new XMLTools(xml_text);
	var jsonObject = XMLTools.xmlToJson(XMLTools.getDocument());
	
	Ti.API.info("jsonObject = "+JSON.stringify(jsonObject));
	
	var responseGenerator = require('responseGenerator/responseGenerator');
	responseGenerator = new responseGenerator();
	
	responseGenerator.buildAssessmentResponse();
	*/
	
	
	
	
	
	activeAssessments = localDataHandler.getAllSavedAssessments();
		
	var data = [];
	var dataControllersList = [];	
	for(var i=0; i < activeAssessments.length; i++){
		dataControllersList.push(Alloy.createController("riskAssessments/riskAssessmentTableRow",{
				thisRA: activeAssessments[i],
				fontawesome: fontawesome
			}));
			
			
		data.push(dataControllersList[i].getView());
		
			
		if(i == 1){
			dataControllersList[i].commitResponse(1);
		}
		else if(i == 2){
			dataControllersList[i].commitResponse(2);
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
      		  localDataHandler.removeAssessment(e.rowData.customData);
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
       localDataHandler.removeAssessment(deletingRow.rowData.customData);
    } else if (e.index == 1) { 
      /*
       * Put the row back since it will be removed from the view even if NO is clicked.
       */
       activeAssessments = localDataHandler.getAllSavedAssessments();
		
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
	$.trigger("openSearchTab");
};

function onRowClick(e){
	$.trigger("openRiskAssessment", {assessmentObject : activeAssessments[e.index]});
	//var assessment = localDataHandler.openAssessment(activeAssessments[e.index].fileName);
	//Ti.API.info(assessment);
	/*
	var assessment = localDataHandler.openAssessment(activeAssessments[e.index].fileName);
	if(assessment.length == 0){
		return;
	}
	
	if(assessment.length > 0){
		alert(assessment[0].name);
	}
	*/
	
};
