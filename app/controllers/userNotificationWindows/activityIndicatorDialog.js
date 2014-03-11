
var args = arguments[0] || {};

var self = this;

this.cancelCallback = null;

exports.show = function(message, cancelCallback){

	if(typeof cancelCallback !== "undefined"){
		self.cancelCallback = cancelCallback;
		$.cancelButton.height = Ti.UI.SIZE;
		$.cancelButton.top = 20;
		$.cancelButton.visible = true;
	}
	else{
		self.cancelCallback = null;
		$.cancelButton.height = 0;
		$.cancelButton.top = 0;
		$.cancelButton.visible = false;
	}
	
	
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

function cancelButtonClick(e){
	if(self.cancelCallback !== null){
			
		Ti.API.error("cancel button clicked ====================================");
		self.cancelCallback();
		
		$.activityIndicator.hide();
		$.win.close();	
	}
}
