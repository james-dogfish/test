var args = arguments[0] || {};
exports.closeLoginWin = function(){
		
		//$.window.close();
		//$.destroy;
		Alloy.Globals.aIndicator.hide();
			//Alloy.Globals.aIndicator.hide();
		Ti.API.info("closeLoginWin was fired");
		$.loginWindow.close();
		$.loginWindow.hide();
		$.destroy();
};
