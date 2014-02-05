if (arguments && arguments[0]) {
	
	var fontawesome = arguments[0].fontawesome;
	
	Ti.API.info("arguments[0].success = "+arguments[0].success);
	
	if(arguments[0].success == true){
		Ti.API.info("commitResponseCode = 1");
		$.container.backgroundColor = "#DBFFE1";
		$.commitIcon.text = fontawesome.icon('icon-ok');
		$.commitIcon.color = "#0f0"; 
	}
	//not submited risk assessment not complete
	else if(arguments[0].success == false){
		Ti.API.info("commitResponseCode = 2");
		$.container.backgroundColor = "#FFDBE0";
		$.commitIcon.text = fontawesome.icon('icon-remove');
		$.commitIcon.color = "#f00"; 
	}
	
	$.commitStatusLabel.text = arguments[0].message;

}