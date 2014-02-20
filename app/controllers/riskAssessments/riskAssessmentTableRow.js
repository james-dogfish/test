var assessmentID = null;

if (arguments && arguments[0]) {

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
		$.row.editable = false;
		$.alcrmStatusLabel.text = 'Submitted - Read Only';
	} else {
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Not Sent';
	}

	$.commitIcon.text = fontawesome.icon('icon-cloud-upload');
}

var commitError = false;

var currentCommitMessageView = null;

exports.clearCommitResponseMessages = function() {
	$.commitResponse.height = 0;
	commitError = false;

	if (currentCommitMessageView != null) {
		$.commitStatusLabelList.remove(currentCommitMessageView);
	}
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


exports.commitResponse = function(success, message) {
	//icon-times icon-check
	$.commitResponseView.height = Ti.UI.SIZE;
	
	currentCommitMessageView = Alloy.createController('riskAssessments/commitMessageView', {
		success : success,
		message : message,
		fontawesome : fontawesome
	}).getView();
	$.commitStatusLabelList.add(currentCommitMessageView);
}; 