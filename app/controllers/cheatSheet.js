var closeWindow = function() {
	$.window.close();
	$.destroy();
};
$.webview.setUrl(Ti.Filesystem.getApplicationDataDirectory()+"pdf.pdf");
