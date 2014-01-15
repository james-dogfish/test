/*
|---------------------------------------------------------------------------------
| File renders UI elements for the app
|---------------------------------------------------------------------------------
*/

function _Ui() {

	var self = this;


	// self.getFont = function(size, bold, icon){
	// 	var fontObject = {
	// 		fontFamily: icon ? 'dogfish' : 'Helvetica' ,
	// 		fontSize: size ? size : 15,
	// 		fontWeight: bold ? "bold" : "normal"
	// 	};
	// };

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

		if (evt) {
			var doneButton = Ti.UI.createButton({
				systemButton: Ti.UI.iPhone.SystemButton.DONE
			});

			popOver.rightNavButton = doneButton;

			doneButton.addEventListener('click', evt);
		}
		return self.parseArgs(popOver, args);
	};

	self.createTextField = function(args) {

		var textField = Ti.UI.createTextField({
			borderColor: '#bbb',
			borderRadius: 5,
			borderWidth: 2,
			color: '#000000',
			top: 5,
			left: 2,
			height: 45,
			font: {
				fontSize: 16
			},
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			paddingLeft: 10,
			paddingRight: 10
		});

		return self.parseArgs(textField, args);
	};

	self.createTextArea = function(args) {

		var textArea = Ti.UI.createTextArea({
			borderColor: '#bbb',
			borderRadius: 5,
			borderWidth: 2,
			textAlign: 'left',
			color: '#000000',
			top: 5,
			left: 2,
			height: 45,
			font: {
				fontSize: 16
			},
			paddingLeft: 10,
			paddingRight: 10,
			scrollable: false
		});

		return self.parseArgs(textArea, args);
	};

	self.createButton = function(args) {

		var uiElement = Ti.UI.createButton({
			height: 45,
			top: 5,
			bottom: 5,
			font: {
				fontSize: 15
			},
			color: '#000000',
			//backgroundColor: '#eeeeee',
			backgroundGradient: {
				type: 'linear',
				startPoint: {
					x: '100%',
					y: '0%'
				},
				endPoint: {
					x: '100%',
					y: '100%'
				},
				colors: ['#eeeeee', '#ababab']
			},
			backgroundImage: 'none',
			borderRadius: 6,
			borderWidth: 1,
			borderColor: '#9d9d9d'
		});

		return self.parseArgs(uiElement, args);
	};

	/*
	|---------------------------------------------------------------------------------
	| Renders section view for the multi view section of the app,
	| title sets the label for header
	|---------------------------------------------------------------------------------
	*/
	self.renderMultiViewSection = function(title) {

		// Create the header view for the table sections
		// and fill in section data
		var headerView = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: 40,
			backgroundColor: '#8a2132',
			borderRadius: 4,
			bottom: 10
			// backgroundGradient: {
			//              type: 'linear',
			//              startPoint: {
			//                  x: '100%',
			//                  y: '0%'
			//              },
			//              endPoint: {
			//                  x: '100%',
			//                  y: '100%'
			//              },
			//              colors: ['#b11616', '#871d1d']
			//          }
		});

		var headerLabel = Ti.UI.createLabel({
			text: title,
			color: '#ffffff',
			font: {
				fontSize: 16,
				fontWeight: 'bold'
			},
			top: 8,
			bottom: 8,
			left: 10,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});

		headerView.add(headerLabel);

		var tableSection = Ti.UI.createTableViewSection({
			headerView: headerView,
			top: 20
		});

		return tableSection;

	};

	/*
	|---------------------------------------------------------------------------------
	| Returns a tableviewrow object for a Question
	| @params - question text 
	|---------------------------------------------------------------------------------
	*/
	self.renderQuestion = function(questionText) {

		var questionRow = Ti.UI.createTableViewRow({
			width: Ti.UI.FILL,
			minRowHeight: 40, // Note this should be the same as headerView.height
			backgroundColor: '#ffffff',
			layout: 'vertical',
			selectionStyle: 'none',
			top: 5,
			text: questionText,
			borderRadius: 6,
			className: 'question'
		});

		var questionContainer = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			top: 5,
			bottom: 0,
			left: 2,
			right: 2,
			//backgroundColor: '#eeeeee',
			backgroundGradient: {
				type: 'linear',
				startPoint: {
					x: '100%',
					y: '0%'
				},
				endPoint: {
					x: '100%',
					y: '100%'
				},
				colors: ['#f0f0f0', '#D8D8D8']
			},
			borderRadius: 6,
			borderWidth: 1,
			borderColor: '#848484'
		});

		var questionLabel = Ti.UI.createLabel({
			text: questionText,
			color: '#000000',
			font: {
				fontSize: 15,
				fontWeight: 'bold'
			},
			top: 8,
			bottom: 8,
			left: 10,
			right: 40,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});

		questionContainer.add(questionLabel);

		var questionNote = Ti.UI.createButton({
			backgroundImage: 'images/questionNote.png',
			width: 30,
			height: 30,
			right: 10
		});

		questionNote.addEventListener('click', function() {
			// Get popover and pass in arguments about the current question
			var popOver = Alloy.createController('notes/question', {
				questionText: questionRow.questionText,
				questionIndex: questionRow.parentId,
				questionSubIndex: questionRow.branchedLevel
			}).getView();
			popOver.show({
				view: questionNote
			});
		});

		questionContainer.add(questionNote);

		questionRow.add(questionContainer);

		return questionRow;
	};

	/*
	|---------------------------------------------------------------------------------
	| Returns an object which has view proxies that can be added to a table view row
	| @params - config which will contain a load of configuration options
	|---------------------------------------------------------------------------------
	*/

	self.renderAnswer = function(config) {

		// Placeholders will hold all the labels for the fields
		// in the app 

		var textPlaceHolders = {
			pickDate: 'Pick Date',
			pickTime: 'Pick Time',
			pickDuration: 'Pick Duration',
			startCensus: 'Start Census',
			stopCensus: 'Stop Census'
		};

		var answerContainer = Ti.UI.createView({
			left: 2,
			top: 8,
			bottom: 5,
			height: Ti.UI.SIZE
		});

		switch (config.format) {

			case "date":

				// Text field added
				var dateAnswer = self.createTextField({
					width: 250,
					height: 45
				});

				answerContainer.add(dateAnswer);

				// Answer is of type date
				var dateButton = self.createButton({
					width: 100,
					left: 265,
					title: textPlaceHolders.pickDate
				});

				answerContainer.add(dateButton);

				return {
					container: answerContainer,
					answerField: dateAnswer,
					answerButton: dateButton
				};

				break;

			case "text":

				var textAnswer = self.createTextArea({
					width: Ti.UI.FILL,
					//height: Ti.UI.SIZE,
					height: 60,
					paddingTop: 5,
					paddingBottom: 5,
					returnKeyType: Ti.UI.RETURNKEY_DEFAULT
				});

				answerContainer.add(textAnswer);

				return {
					container: answerContainer,
					answerField: textAnswer
				};

				break;

			case "number":

				var numberAnswer = self.createTextArea({
					//left: 2,
					//right: 2,
					width: Ti.UI.FILL,
					height: 50,
					paddingTop: 5,
					paddingBottom: 5,
					returnKeyType: Ti.UI.RETURNKEY_DEFAULT,
					keyboardType: Ti.UI.KEYBOARD_PHONE_PAD
				});

				answerContainer.add(numberAnswer);

				return {
					container: answerContainer,
					answerField: numberAnswer
				};

				break;


			case "time":

				var timeAnswer = self.createTextField({
					width: 250
				});

				answerContainer.add(timeAnswer);

				// Answer is of type time
				var timeButton = self.createButton({
					width: 100,
					left: 265,
					title: textPlaceHolders.pickTime
				});

				answerContainer.add(timeButton);

				return {
					container: answerContainer,
					answerField: timeAnswer,
					answerButton: timeButton
				};

				break;

			case "census-timer":

			case "duration":

				// Using the same code for census and duration

				var durationAnswer = self.createTextField({
					width: 250
				});

				answerContainer.add(durationAnswer);

				// Answer is of type duration
				var durationButton = self.createButton({
					width: 110,
					left: 265,
					title: textPlaceHolders.pickDuration
				});

				answerContainer.add(durationButton);

				if (config.format === 'census-timer') {

					var startCensus = self.createButton({
						title: textPlaceHolders.startCensus,
						left: 388,
						width: 110
					});

					answerContainer.add(startCensus);

					var User = require('core/User');

					var timerOverlay = Ti.UI.createView({
						width: '100%',
						height: 55,
						bottom: 50,
						zIndex: 2,
						backgroundColor: '#efefef',
						opacity: 1
					});

					var timerStopButton = self.createButton({
						width: 300,
						top: 5,
						left: '30%',
						layout: 'horizontal'
					});

					var timerLabel = Ti.UI.createLabel({
						color: '#6d6d69',
						text: 'Timer:',
						font: {
							fontFamily: 'Arial',
							fontSize: 22,
							fontWeight: 'Bold'
						},
						top: 10,
						left: 15
					});

					timerStopButton.add(timerLabel);

					var timerCounter = Ti.UI.createLabel({
						color: '#000000',
						text: '    ',
						width: 58,
						font: {
							fontFamily: 'Arial',
							fontWeight: 'Bold',
							fontSize: 22
						},
						top: 10,
						left: 5
					});

					timerStopButton.add(timerCounter);

					var borderRight = Ti.UI.createView({
						backgroundColor: '#9d9d9d',
						width: 1,
						top: 2,
						bottom: 2,
						left: 10,
						right: 10
					});

					timerStopButton.add(borderRight);

					var stopCensusLabel = Ti.UI.createLabel({
						text: textPlaceHolders.stopCensus,
						color: '#000000',
						font: {
							fontFamily: 'Arial',
							fontWeight: 'Bold',
							fontSize: 18
						},
						top: 12,
						left: 5,
						right: 15
					});

					timerStopButton.add(stopCensusLabel);



					timerOverlay.add(timerStopButton);

					return {
						container: answerContainer,
						answerField: durationAnswer,
						answerButton: durationButton,
						censusButton: startCensus,
						censusElements: {
							censusTimerOverlay: timerOverlay,
							censusTimerCounter: timerCounter,
							censusTimerStop: timerStopButton
						}
					};

				} else {
					return {
						container: answerContainer,
						answerField: durationAnswer,
						answerButton: durationButton
					};
				}

				break;

			case "multi-list":

			case "list":

				// Note questionFormat is the variable that contains the the above case values

				var listAnswer = self.createTextField({
					right: 112,
					width: Ti.UI.FILL,
					editable: false
				});

				answerContainer.add(listAnswer);

				// Answer is of type duration
				var listChooseButton = self.createButton({
					width: 100,
					right: 2,
					title: 'Choose'
				});

				answerContainer.add(listChooseButton);

				return {
					container: answerContainer,
					answerField: listAnswer,
					answerButton: listChooseButton
				};

				break;



			case "toggle":

				// TabbedBar won't let us select color of font, so custom
				// implementation below

				// Create view for holding buttons

				var toggleView = Ti.UI.createView({
					backgroundColor: '#eeeeee',
					left: 2,
					top: 5,
					width: Ti.UI.SIZE,
					height: 45,
					borderRadius: 6,
					borderWidth: 1,
					borderColor: '#848484',
					layout: 'horizontal',
					isToggle: true // needed for finding out completed answers
				});

				// Toggle view will need to do some form of intelligent UI creation
				var answerOptions = config.options.split('\r\n'),
					toggleViewButtons = [];


				for (var i = 0; i < answerOptions.length; i++) {

					// Create a Button
					var toggleViewButton = self.createButton({
						width: Ti.UI.SIZE,
						borderRadius: 0,
						borderWidth: 0,
						backgroundImage: 'none',
						top: 0,
						bottom: 0,
						previouslySelected: null,
						optionText: answerOptions[i],
						clicked: false
					});

					// Caching to another variable so that events can be added later
					toggleViewButtons.push(toggleViewButton);

					var toggleViewButtonLabel = Ti.UI.createLabel({
						text: answerOptions[i],
						left: 20,
						right: 20,
						top: 5,
						bottom: 5,
						font: {
							fontSize: 16,
							fontWeight: 'normal',
							fontFamily: 'Arial'
						},
						color: '#000000',
						//width: 35
						width: Ti.UI.SIZE
					});

					toggleViewButton.add(toggleViewButtonLabel);

					toggleViewButton.label = toggleViewButtonLabel;

					toggleView.add(toggleViewButton);

					if (i !== answerOptions.length) {
						// Now add a 1 pixel view to emulate border
						var borderRight = Ti.UI.createView({
							backgroundColor: '#9d9d9d',
							width: 1,
							top: 0,
							bottom: 0,
							right: 0
						});

						toggleView.add(borderRight);
					}

				}

				answerContainer.add(toggleView);

				return {
					container: answerContainer,
					answerField: null,
					toggleView: toggleView, // added so that colours can be controlled by logic
					answerButtons: toggleViewButtons // Note answerbutton changed to buttons as multiple
				};

				break;


			case "number-increments":

				// Update - 11-06-2013 - Changing top and bottom to fit more census buttons in
				answerContainer.top = 2;
				answerContainer.bottom = -5;
				answerContainer.width = Ti.UI.SIZE;
				answerContainer.left = null;

				// Setting layout as horizontal to house all three views 

				answerContainer.layout = 'horizontal';

				// -5 Button
				var minusFiveButton = self.createButton({
					width: 140,
					left: 0,
					title: '-5',
					font: {
						fontSize: 20
					},
					height: 40
				});

				answerContainer.add(minusFiveButton);

				// - Button
				var minusButton = self.createButton({
					width: 70,
					left: 20,
					title: '-1',
					font: {
						fontSize: 20
					},
					height: 40
				});

				answerContainer.add(minusButton);

				var numberAnswer = self.createTextField({
					width: 100,
					left: 20,
					keyboardType: Ti.UI.KEYBOARD_NUMBER_PAD,
					enabled: false,
					textAlign: 'center',
					value: 0,
					nullValue: 0,
					height: 40
				});

				answerContainer.add(numberAnswer);

				// + Button
				var plusButton = self.createButton({
					width: 70,
					left: 20,
					title: '+1',
					font: {
						fontSize: 20
					},
					height: 40
				});

				answerContainer.add(plusButton);

				// -5 Button
				var plusFiveButton = self.createButton({
					width: 140,
					left: 20,
					title: '+5',
					font: {
						fontSize: 20
					},
					height: 40
				});

				answerContainer.add(plusFiveButton);

				return {
					container: answerContainer,
					plusButton: plusButton,
					minusButton: minusButton,
					minusFiveButton: minusFiveButton,
					plusFiveButton: plusFiveButton,
					answerField: numberAnswer
				};

				break;

		}
	};
	/*
	|---------------------------------------------------------------------------------
	| Renders the section for the left slider 
	|---------------------------------------------------------------------------------
	*/
	self.renderSliderSection = function(section) {
		var sliderSectionRow = Ti.UI.createTableViewRow({
			width: Ti.UI.FILL,
			height: 40,
			backgroundColor: '#0a5773',
			selectionStyle: 'none',
			isparent: true,
			opened: false,
			sub: []
		});
		var sliderSectionLabel = Ti.UI.createLabel({
			text: section,
			color: '#ffffff',
			font: {
				fontSize: 16,
				fontWeight: 'bold'
			},
			top: 8,
			bottom: 8,
			left: 10,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});
		sliderSectionRow.add(sliderSectionLabel);
		return sliderSectionRow;
	};

	/*
	|---------------------------------------------------------------------------------
	| Renders the section row for the left slider 
	|---------------------------------------------------------------------------------
	*/
	self.renderSliderRow = function(questionId, title) {

		var sliderRow = Ti.UI.createTableViewRow({
			width: Ti.UI.FILL,
			minRowHeight: 40, // Note this should be the same as headerView.height
			backgroundColor: '#053e57',
			layout: 'vertical',
			selectionStyle: 'none',
			sliderIndex: questionId
		});

		var sliderRowLabel = Ti.UI.createLabel({
			text: title,
			color: '#ffffff',
			font: {
				fontSize: 16
			},
			top: 8,
			bottom: 8,
			left: 20,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});

		sliderRow.add(sliderRowLabel);
		return sliderRow;
	};

	return self;

};

module.exports = new _Ui();