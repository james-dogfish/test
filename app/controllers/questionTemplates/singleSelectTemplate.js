function selectButtonClicked(e) {

	if (Alloy.Globals.dialogWindowOpen == true) return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;
	if (item.readOnly == true) {
		return;
	}
	
	Alloy.createController("questionDialogs/modalPicker", {
		currentValue: {displayValue : item.displayValue.value, value :item.value[0]},
		valueList: item.selections,
		closeCallBack: function(data) {
			item.displayValue = {
				value: data.displayValue
			};
			item.value = [data.value];

			if (item.value[0] === "") {
				item.questionResponse = null;
			} else {
				item.questionResponse =
					"<ques:parameterName>" + item.alcrmQuestionID + "</ques:parameterName>" +
					"<ques:parameterValue>" + data.value + "</ques:parameterValue>";
			}

			var showSpiner = false;
			var activityIndicator;
			if (item.renderDependencyList.length > 0) {
				showSpiner = true;
				activityIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
				activityIndicator.show();
			}

			item = Alloy.Globals.questionRenderer.questionValueChange({
				questionObject: item,
				questionIndex: e.itemIndex,
				section: section
			});

			if (showSpiner == true) {
				activityIndicator.hide();
			}
		},
		closeWithNoValueCallBack: function() {

			Alloy.Globals.questionRenderer.questionValueChange({
				questionObject: item,
				questionIndex: e.itemIndex,
				section: section
			});
		}

	});

	item = Alloy.Globals.questionRenderer.selectQuestion(item, e.section);

};

function onNotesClick(e) {
	if (Alloy.Globals.dialogWindowOpen == true) return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);

	Alloy.createController("questionDialogs/userNotesDialog", {
		notes: item.notes,
		title: "Question Notes",
		closeCallBack: function(notes) {

			if (notes != "") {
				item.notesBackground = {
					backgroundImage: 'images/questionSelectedNote.png'
				};
				item.notes = notes;
			} else {
				item.notesBackground = {
					backgroundImage: 'images/questionNote.png'
				};
				item.notes = "";
			}
			e.section.updateItemAt(e.itemIndex, item);

			Alloy.Globals.localDataHandler.updateQuestion(item);
		}
	});
};


function onTitleClick(e) {
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
	Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
};