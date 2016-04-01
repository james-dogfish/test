/*
|---------------------------------------------------------------------------------
| File renders UI elements for the app
|---------------------------------------------------------------------------------
*/

function _Ui() {

	var self = this;

	/*
	|---------------------------------------------------------------------------------
	| Function accepts list of arguments and a ui object and then applies them to it
	|---------------------------------------------------------------------------------
	*/
	self.parseArgs = function(ui, args) {
		if (!args) {
			return;
		}
		for (arg in args) {
			ui[arg] = args[arg];
		}
		return ui;
	};

	/*
	|---------------------------------------------------------------------------------
	| Renders Popover for the app and attaches event listener
	|---------------------------------------------------------------------------------
	*/
	self.renderPopOver = function(args, evt) {

		var popOver = Ti.UI.iPad.createPopover({
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE
		});

        if(args){
           popOver.applyProperties(args); 
        }
		if (evt) {
			var doneButton = Ti.UI.createButton({
				systemButton: Ti.UI.iPhone.SystemButton.DONE
			});

			popOver.rightNavButton = doneButton;

			doneButton.addEventListener('click', evt);
		}
		return popOver;
	};

	return self;
};

module.exports = new _Ui();