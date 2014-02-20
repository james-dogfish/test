
var args = arguments[0] || {};

this.cancelCallBack = null;

exports.show = function(message, cancelCallBack){

	if(typeof cancelCallBack === "undefined"){
		this.cancelCallBack = null;
		$.cancelButton.height = 0;
		$.cancelButton.top = 0;
		$.cancelButton.visible = false;
	}
	else{
		this.cancelCallBack = cancelCallBack;
		$.cancelButton.height = Ti.UI.SIZE;
		$.cancelButton.top = 20;
		$.cancelButton.visible = true;
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
	if(this.cancelCallBack != null){
		this.cancelCallBack();
	}
}
