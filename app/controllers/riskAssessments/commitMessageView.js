if (arguments && arguments[0]) {
	
	var fontawesome = arguments[0].fontawesome;
	
	Alloy.Globals.Logger.log("arguments[0].success = "+arguments[0].success, "info");
	
	if(arguments[0].success == true){
		Alloy.Globals.Logger.log("commitResponseCode = 1", "info");
		$.container.backgroundColor = "#DBFFE1";
		$.commitIcon.text = fontawesome.icon('icon-ok');
		$.commitIcon.color = "#0f0"; 
	}
	//not submited risk assessment not complete
	else if(arguments[0].success == false){
		Alloy.Globals.Logger.log("commitResponseCode = 2", "info");
		$.container.backgroundColor = "#FFDBE0";
		$.commitIcon.text = fontawesome.icon('icon-remove');
		$.commitIcon.color = "#f00"; 
	}
	
	$.commitStatusLabel.text = arguments[0].message;

}