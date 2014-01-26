var args = arguments[0] || {};

Ti.App.addEventListener('closeLoginWin',function(){
	$.window.close();
	$.destroy;
	Alloy.Globals.aIndicator.hide();
});