var args = arguments[0] || {};

/*************************************************************
 * closeLoginWin: deals with closing the current login window
 *************************************************************/
exports.closeLoginWin = function(){
	Alloy.Globals.aIndicator.hide();
	Alloy.Globals.Logger.log("closeLoginWin was fired", "info");
	$.loginWindow.close();
	$.destroy();
};

Alloy.Globals.Index.CloseLogin = exports.closeLoginWin;