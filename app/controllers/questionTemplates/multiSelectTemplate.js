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

function LookUpSelections(parentQuestion, parentQuestionVale, childQuestion){
	for(var parentSelectionIndex =0; parentSelectionIndex< parentQuestion.selections.length; parentSelectionIndex++){
		if(parentQuestion.selections[parentSelectionIndex].value === parentQuestionVale){
			var displayValue = parentQuestion.selections[parentSelectionIndex].displayValue;
			for(var childSelectionIndex =0; childSelectionIndex< childQuestion.selections.length; childSelectionIndex++){
				if(childQuestion.selections[childSelectionIndex].displayValue == displayValue){
					return childQuestion.selections[childSelectionIndex];
				}
			}
		}
	}
	return null;
};


function multiSelectButtonClicked(e) {
	if (Alloy.Globals.dialogWindowOpen == true) return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;

	if (item.readOnly == true) {
		return;
	}
	
	var selections = item.selections;
	if(item.alcrmQuestionID === "I_SELECTED_STAKEHOLDER_INFO"){
		var selections = [];
		var stakeholderQuestion =  Alloy.Globals.questionRenderer.findQuestionByAlcrmGroupAndName("I_STAKEHOLDER_INFO", "RiskAssessmentInfo");
		if(stakeholderQuestion != null){
			for(var i=0; i < stakeholderQuestion.value.length; i++){
				var newvalue = LookUpSelections(stakeholderQuestion, stakeholderQuestion.value[i], item);
				if(newvalue != null){
					selections.push(newvalue);
				}
			}
			
		}
	}
	

	Alloy.createController("questionDialogs/modalMultiPicker", {
		valueList: selections,
		valuesSelected: item.value,
		closeCallBack: function(returnValue) {
			if(typeof returnValue !== "undefined")
			{
				if(typeof returnValue.singleStringValue !== "undefined")
				{
					item.displayValue = {
						value: returnValue.singleStringValue
					};
				}
			}
			
			item.value = returnValue.valueList;

			var values = "";
			for (var i = 0; i < returnValue.valueList.length; i++) {
				values = values + "<ques:values>" + returnValue.valueList[i] + "</ques:values>";
			}
			
				item.questionResponse = 
					"<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ values;
		    
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
	item = Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
};