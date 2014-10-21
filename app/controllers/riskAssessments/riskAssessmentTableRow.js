var assessmentID = null;

var update = function(assessmentObject, fontawesome){

	assessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(assessmentObject);

	assessmentID = assessmentObject.assessmentID;

	$.row.filter = assessmentObject.crossingName;
	$.row.customData = assessmentObject;
	$.crossingIcon.text = fontawesome.icon('icon-book');
	$.crossingLabel.text = assessmentObject.crossingName;

	$.statusIcon.text = fontawesome.icon('icon-time');
	$.statusLabel.text = '(' + (assessmentObject.questionsCompleted === 0 ? 'New' : (assessmentObject.questionsCompleted + '/' + assessmentObject.questionCount)) + ')';
	if ($.statusLabel.text.search('New') === -1) {
		$.statusLabel.text = $.statusLabel.text + " Mandatory Questions";
	}
	$.alcrmIcon.text = fontawesome.icon('icon-cloud');

	if (assessmentObject.alcrmStatus === 'sent' || assessmentObject.isSubmitted == true) {
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Submitted - Read Only';
		$.regenerateView.visible = true;
	} else {
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Not Sent';
		$.regenerateView.visible = false;
	}

	$.regeneratePDF.assessmentObject = assessmentObject;
	$.regeneratePDF.clickEnabled = true;
	
	$.commitIcon.text = fontawesome.icon('icon-cloud-upload');
	
	$.pdfIcon.text = fontawesome.icon('icon-file');
};

$.regeneratePDF.addEventListener('click', function(e){
	if(!$.regeneratePDF.clickEnabled) return false;
	e.cancelBubble = true;
	Alloy.Globals.aIndicator.show("Loading...");
	var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse($.regeneratePDF.assessmentObject);
	Alloy.Globals.Util.emailNotes(newAssessmentForPDF,$.regeneratePDF.assessmentObject.crossingName);
	Alloy.Globals.aIndicator.hide();
});


exports.update = update;

if (arguments && arguments[0]) {
	update(arguments[0].thisRA, arguments[0].fontawesome);
}

var commitError = false;

var currentCommitMessageView = null;
var commitMessageViewList = [];

exports.clearCommitResponseMessages = function() {
	$.commitResponse.height = 0;
	commitError = false;

	if (currentCommitMessageView != null) {
		$.commitStatusLabelList.remove(currentCommitMessageView);
	}
	messageListLength = [];

};

exports.getAssessmentID = function() {
	return assessmentID;
};

exports.showNoCensusMessage = function() {
	if (currentCommitMessageView != null) {
		$.commitStatusLabelList.remove(currentCommitMessageView);
	}
	commitError = true;
	currentCommitMessageView = Alloy.createController('riskAssessments/commitMessageView', {
		success : false,
		message : L("noCensusMessage"),
		fontawesome : fontawesome
	}).getView();
	$.commitStatusLabelList.add(currentCommitMessageView);
};


exports.commitResponse = function(success, message, messageID, fontawesome) {
	//icon-times icon-check
	$.commitResponseView.height = Ti.UI.SIZE;
	
	var messageListLength = commitMessageViewList.length;
	
	for(var i=0; i < messageListLength; i++){
		if(commitMessageViewList[i].getMessageID() == null) continue;
		if(commitMessageViewList[i].getMessageID() == messageID){
			commitMessageViewList[i].updateMessgae(
				success, 
				message, 
				(( typeof messageID === "undefined") ? null : messageID), 
				fontawesome
			);
			return;
		}
	}
	
	currentCommitMessage = Alloy.createController('riskAssessments/commitMessageView', {
		success : success,
		message : message,
		messageID : (( typeof messageID === "undefined") ? null : messageID),
		fontawesome : fontawesome
	});
	commitMessageViewList.push(currentCommitMessage);


	$.commitStatusLabelList.add(currentCommitMessage.getView());
}; 