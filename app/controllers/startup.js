var args = arguments[0] || {};

/*************************************************************
 * closeLoginWin: deals with closing the current login window
 *************************************************************/
exports.closeLoginWin = function(){
		Alloy.Globals.aIndicator.hide();
		Ti.API.info("closeLoginWin was fired");
		$.loginWindow.close();
		$.destroy();
};
