
var args = arguments[0] || {};

this.showCancel = false;

exports.show = function(message, showCancel){

	if(typeof showCancel === "undefined"){
		if(showCancel == true){
			this.showCancel = true;
			$.cancelButton.height = Ti.UI.SIZE;
			$.cancelButton.top = 20;
			$.cancelButton.visible = true;
		}
		else{
			this.showCancel = false;
			$.cancelButton.height = 0;
			$.cancelButton.top = 0;
			$.cancelButton.visible = false;
		}
	}
	else{
		this.showCancel = false;
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
	if(this.showCancel == true){
		Alloy.Globals.Soap.stopRequest();
	}
}
