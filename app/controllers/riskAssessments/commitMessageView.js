if (arguments && arguments[0]) {

	var savedMessageID = null;

}

exports.getMessageID = function(){
	return savedMessageID;
};

var updateMessgae = function(success, message, messageID, fontawesome){
	
	savedMessageID = messageID;
	
	if(success == true){
		$.container.backgroundColor = "#DBFFE1";
		$.commitIcon.text = fontawesome.icon('icon-ok');
		$.commitIcon.color = "#0f0"; 
	}
	//not submited risk assessment not complete
	else if(success == false){
		$.container.backgroundColor = "#FFDBE0";
		$.commitIcon.text = fontawesome.icon('icon-remove');
		$.commitIcon.color = "#f00"; 
	}
	
	$.commitStatusLabel.text = message;
};
exports.updateMessgae = updateMessgae;

updateMessgae(arguments[0].success, arguments[0].message, arguments[0].messageID, arguments[0].fontawesome);
