var args = arguments[0] || {};

Ti.App.addEventListener('closeLoginWin',function(){
		Ti.API.info("closeLoginWin is fired");
		$.window.close();
		$.destroy;
		Alloy.Globals.aIndicator.hide();
});