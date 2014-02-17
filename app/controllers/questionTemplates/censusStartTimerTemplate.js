function onTextFieldBlur(e){
	var item = e.section.getItemAt(e.itemIndex);
};

function onStartButtonClick(e){
	var question = e.section.getItemAt(e.itemIndex);
	
	question = Alloy.Globals.questionRenderer.selectQuestion(question);
	
	if(question.readOnly == true){
		e.section.updateItemAt(e.itemIndex, question);
		return;
	}
	
	Alloy.Globals.questionRenderer.startCensesTimer(question);
	/*
	Ti.App.fireEvent("startCensesTimer", {
		question : question,
	}); 
	*/
};

function onTextFieldFocus(e){
	var question = e.section.getItemAt(e.itemIndex);
	question = Alloy.Globals.questionRenderer.selectQuestion(question);
}

function textFieldClick(e){
	var question = e.section.getItemAt(e.itemIndex);
	question = Alloy.Globals.questionRenderer.selectQuestion(question);
}

function onNotesClick(e){
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);
	
	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, title : "Question Notes", 
		closeCallBack : function(notes){
			
			if(notes != ""){
				item.notesBackground = {backgroundImage: 'images/questionSelectedNote.png'};
				item.notes = notes; 
			}
			else{
				item.notesBackground = {backgroundImage: 'images/questionNote.png'};
				item.notes = ""; 
			}
			e.section.updateItemAt(e.itemIndex, item);
			
			Alloy.Globals.localDataHandler.updateQuestion(item);
		}
	});
};

function onTitleClick(e){
	if(Alloy.Globals.isDebugOn == false)return;
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.currentlyFocusedTF && Alloy.Globals.currentlyFocusedTF.blur();
	Alloy.Globals.questionRenderer.selectQuestion(item);
}

