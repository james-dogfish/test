
var args = arguments[0] || {};

exports.show = function(message){

	if(typeof message === "undefined"){
		$.activityIndicator.message = L('spinner_text');
	}
	else if(message == ""){
		$.activityIndicator.message = L('spinner_text');
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

