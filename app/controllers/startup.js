var args = arguments[0] || {};

exports.closeLoginWin = function(){
		Ti.API.info("closeLoginWin is fired");
		$.window.close();
		$.destroy;
		Alloy.Globals.aIndicator.hide();
};
