var assessmentID = null;

if (arguments && arguments[0]) {
	
	/*
	var fontawesome = arguments[0].fontawesome, 
	thisRA = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(arguments[0].thisRA);

	assessmentID = thisRA.assessmentID;

	$.row.filter = thisRA.crossingName;
	$.row.customData = thisRA;
	$.crossingIcon.text = fontawesome.icon('icon-book');
	//$.crossingLabel.text = thisRA.crossingName.toLowerCase().capitalize();
	$.crossingLabel.text = thisRA.crossingName;

	$.statusIcon.text = fontawesome.icon('icon-time');
	$.statusLabel.text = '(' + (thisRA.questionsCompleted === 0 ? 'New' : (thisRA.questionsCompleted + '/' + thisRA.questionCount)) + ')';
	if ($.statusLabel.text.search('New') === -1) {
		$.statusLabel.text = $.statusLabel.text + " Mandatory Questions";
	}
	$.alcrmIcon.text = fontawesome.icon('icon-cloud');

	if (thisRA.alcrmStatus === 'sent' || thisRA.isSubmitted == true) {
		//$.row.nonClickable = false;
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Submitted - Read Only';
	} else {
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Not Sent';
	}

	$.commitIcon.text = fontawesome.icon('icon-cloud-upload');
	*/
}

var update = function(assessmentObject, fontawesome){
	//var fontawesome = arguments[0].fontawesome, 
	assessmentObject = Alloy.Globals.localDataHandler.getMostUpTodateAssessmentObject(assessmentObject);

	assessmentID = assessmentObject.assessmentID;

	$.row.filter = assessmentObject.crossingName;
	$.row.customData = assessmentObject;
	$.crossingIcon.text = fontawesome.icon('icon-book');
	//$.crossingLabel.text = assessmentObject.crossingName.toLowerCase().capitalize();
	$.crossingLabel.text = assessmentObject.crossingName;

	$.statusIcon.text = fontawesome.icon('icon-time');
	$.statusLabel.text = '(' + (assessmentObject.questionsCompleted === 0 ? 'New' : (assessmentObject.questionsCompleted + '/' + assessmentObject.questionCount)) + ')';
	if ($.statusLabel.text.search('New') === -1) {
		$.statusLabel.text = $.statusLabel.text + " Mandatory Questions";
	}
	$.alcrmIcon.text = fontawesome.icon('icon-cloud');

	if (assessmentObject.alcrmStatus === 'sent' || assessmentObject.isSubmitted == true) {
		//$.row.nonClickable = false;
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Submitted - Read Only';
	} else {
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Not Sent';
	}

	$.commitIcon.text = fontawesome.icon('icon-cloud-upload');
};
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