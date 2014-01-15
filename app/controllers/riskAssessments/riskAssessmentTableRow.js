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