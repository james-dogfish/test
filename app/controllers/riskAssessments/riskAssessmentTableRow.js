if (arguments && arguments[0]) {

	var fontawesome = arguments[0].fontawesome,
		thisRA = arguments[0].thisRA;
		
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
	
	

}


exports.commitResponse = function (commitResponseCode) {
	//icon-times icon-check
	
	//has been summited no change
	if(commitResponseCode == 0){
		$.commitResponse.height = 0;
	}
	//submited with out errer
	else if(commitResponseCode == 1){
		Ti.API.info("commitResponseCode = 1");
		$.commitResponseView.height = Ti.UI.SIZE;
		$.commitResponseView.backgroundColor = "#DBFFE1";
		$.commitIcon.text = fontawesome.icon('icon-ok');
		$.commitIcon.color = "#0f0"; 
		$.commitStatusLabel.text = "Commit Succeed";
	}
	//not submited risk assessment not complete
	else if(commitResponseCode == 2){
		Ti.API.info("commitResponseCode = 2");
		$.commitResponseView.height = Ti.UI.SIZE;
		$.commitResponseView.backgroundColor = "#FFDBE0";
		$.commitIcon.text = fontawesome.icon('icon-remove');
		$.commitIcon.color = "#f00"; 
		$.commitStatusLabel.text = "Commit Failed : Assessment Not finsihed ";
	}
};