var args = arguments[0] || {};
exports.closeLoginWin = function(){
		$.loginWindow.close();
		//$.window.close();
		//$.destroy;
		Alloy.Globals.aIndicator.hide();
			//Alloy.Globals.aIndicator.hide();
		Ti.API.info("closeLoginWin was fired");
};
