
var args = arguments[0] || {};

exports.show = function(message){

	if(typeof message === "undefined"){
		$.activityIndicator.message = "Loading...";
	}
	else if(message == ""){
		$.activityIndicator.message = "Loading...";
	}
	else{
		$.activityIndicator.message = message;
	}
	
	$.activityIndicator.show();
	$.win.open();
};

exports.hide = function(){
	$.activityIndicator.hide();
	$.win.close();
};

