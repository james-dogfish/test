function onTextFieldBlur(e){
	//Alloy.createController("userNotificationWindows/activityIndicatorDialog").show(); 
	
	//alert("e.itemIndex : "+e.itemIndex);
	var item = e.section.getItemAt(e.itemIndex);

};

function onStartButtonClick(e){
	var question = e.section.getItemAt(e.itemIndex);
	
	question = Alloy.Globals.questionRenderer.selectQuestion(question);
	
	if(question.readOnly == true){
		e.section.updateItemAt(e.itemIndex, question);
		return;
	}
	
	Ti.App.fireEvent("startCensesTimer", {
		question : question,
	}); 
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
	var item = e.section.getItemAt(e.itemIndex);
	
	//notesBackground : {backgroundImage: 'images/questionNote.png'}
	//{backgroundImage: 'images/questionNote.png'}
	//{backgroundImage: 'images/questionSelectedNote.png'},
	
	
	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, title : "Question Notes", closeCallBack : function(notes){
		
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
	}});
};

function onTitleClick(e){
	if(Alloy.Globals.isDebugOn == false)return;
	var item = e.section.getItemAt(e.itemIndex);
	//alert("name = "+item.name);
}

