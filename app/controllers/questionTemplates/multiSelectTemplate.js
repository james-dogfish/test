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
	Alloy.Globals.questionRenderer.selectQuestion(item);
};


function multiSelectButtonClicked(e) {
	if (Alloy.Globals.dialogWindowOpen == true) return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;

	if (item.readOnly == true) {
		// section.updateItemAt(e.itemIndex, item);
		return;
	}

	Alloy.createController("questionDialogs/modalMultiPicker", {
		valueList: item.selections,
		valuesSelected: item.value,
		closeCallBack: function(returnValue) {
			item.displayValue = {
				value: returnValue.singleStringValue
			};
			item.value = returnValue.valueList;
			// section.updateItemAt(e.itemIndex, item);

			var values = "";
			for (var i = 0; i < returnValue.valueList.length; i++) {
				values = values + "<ques:values>" + returnValue.valueList[i] + "</ques:values>";
			}
			var questionResponse =
				"<ques:parameterName>" + item.alcrmQuestionID + "</ques:parameterName>" + values /*+ "<ques:notes>"+item.notes+"</ques:notes>"*/ ;

			item.questionResponse = questionResponse;

			item = Alloy.Globals.questionRenderer.questionValueChange({
				questionObject: item,
				questionIndex: e.itemIndex,
				section: section
			});
		},
		closeWithNoValueCallBack: function() {

			Alloy.Globals.questionRenderer.questionValueChange({
				questionObject: item,
				questionIndex: e.itemIndex,
				section: section
			});
		}
	});
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
};