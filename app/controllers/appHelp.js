var closeWindow = function() {
	$.window.close();
	$.destroy();
};

var helpText = Ti.App.Properties.getString('helpContent', '');

if (helpText) {
	// Go through and split everything between # 
	var blocks = helpText.split('#');
	blockLength = blocks.length;
	for (var i = 0; i < blockLength; i++) {
		if (blocks[i]) {
			// Now split each block into sub-blocks
			var subBlock = blocks[i].split('*'),
				heading = subBlock[0],
				para = subBlock[1];

				if(heading) {
					var header = Ti.UI.createLabel({
						color: '#000000',
						top: 20,
						left: 20,
						bottom: 10,
						height: Ti.UI.SIZE,
						font: {
							fontSize: 18,
							fontWeight: 'bold'
						},
						text: heading
					});
					$.borderedView.add(header);
				}
				if(para) {
					var para = Ti.UI.createLabel({
						color: '#000000',
						top: 10,
						left: 20,
						bottom: 20,
						height: Ti.UI.SIZE,
						font: {
							fontSize: 16,
							fontWeight: 'normal'
						},
						text: para
					});
					$.borderedView.add(para);
				}
		}

	}
} else {
	Alloy.Globals.Util.showAlert('No help content available!');
}