var assessmentID = null;

if (arguments && arguments[0]) {
	
	

	var fontawesome = arguments[0].fontawesome,
		thisRA = arguments[0].thisRA;
		
	assessmentID = thisRA.assessmentID;
		
	$.row.filter = thisRA.crossingName;
	$.row.customData = thisRA;
	$.crossingIcon.text = fontawesome.icon('icon-book');
	//$.crossingLabel.text = thisRA.crossingName.toLowerCase().capitalize();
	$.crossingLabel.text = thisRA.crossingName;
	
	
	$.statusIcon.text = fontawesome.icon('icon-time');
	$.statusLabel.text = '(' + (thisRA.questionsCompleted === 0 ? 'New' : (thisRA.questionsCompleted + '/' + thisRA.questionCount)) + ')';
	if($.statusLabel.text.search('New') === -1)
	{
		$.statusLabel.text = $.statusLabel.text + " mandatory questions";
	}
	$.alcrmIcon.text = fontawesome.icon('icon-cloud');
	
	if(thisRA.alcrmStatus === 'Sent'){
		$.row.editable = false;
		$.alcrmStatusLabel.text = 'Submitted - Read Only';
	}
	else{
		$.row.editable = true;
		$.alcrmStatusLabel.text = 'Not Sent';
	}
	
	$.commitIcon.text = fontawesome.icon('icon-cloud-upload');
}


var commitError = false;

var currentCommitMessageView = null;


exports.clearCommitResponseMessages = function () {
	$.commitResponse.height = 0;
	commitError = false;
	
	if(currentCommitMessageView != null){
		$.commitStatusLabelList.remove(currentCommitMessageView);
	}
};


exports.getAssessmentID = function(){
	return assessmentID;
};

exports.commitResponseAssessmentIncomplete = function(){
	
	$.commitResponseView.height = Ti.UI.SIZE;
	
	if(currentCommitMessageView != null){
		$.commitStatusLabelList.remove(currentCommitMessageView);
	}
	
	currentCommitMessageView= Alloy.createController('riskAssessments/commitMessageView',{
		success : false,
		message : L("assessmentIncomplete"),
		fontawesome : fontawesome
	}).getView();
	
	$.commitStatusLabelList.add(currentCommitMessageView);
};

exports.commitResponse = function (success, pageType) {
	//icon-times icon-check
	$.commitResponseView.height = Ti.UI.SIZE;
	
	
	
	if(success == true && commitError == false){

		if(currentCommitMessageView != null){
			$.commitStatusLabelList.remove(currentCommitMessageView);
		}
	
		currentCommitMessageView= Alloy.createController('riskAssessments/commitMessageView',{
			success : true,
			message : L("assessmentSubmitted"),
			fontawesome : fontawesome
		}).getView();
		$.commitStatusLabelList.add(currentCommitMessageView);
		
	}
	else if(success == false && commitError == false){
		commitError = true;
		
		if(currentCommitMessageView != null){
			$.commitStatusLabelList.remove(currentCommitMessageView);
		}
		
		currentCommitMessageView= Alloy.createController('riskAssessments/commitMessageView',{
			success : false,
			message : L("assessmentFailedSubmit"),
			fontawesome : fontawesome
		}).getView();
		$.commitStatusLabelList.add(currentCommitMessageView);
		
	}	
};