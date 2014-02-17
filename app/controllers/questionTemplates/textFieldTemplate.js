function onTextFieldChange(e){
	var item = e.section.getItemAt(e.itemIndex);
	item.value[0] = e.value;
	
	Alloy.Globals.questionRenderer.questionRealTimeValidation({questionObject : item, questionIndex : e.itemIndex, section : e.section});
};

function onTextFieldBlur(e){
	var item = e.section.getItemAt(e.itemIndex);
	
	if(typeof item === "undefined"){
		return;
	}
	
	if(item.readOnly == true){
		e.section.updateItemAt(e.itemIndex, item);
		return;
	}

	var section = e.section; 
	item.displayValue.value =  e.value;
	item.value = [e.value];
	
	var questionResponse = 
   "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ 
   "<ques:parameterValue>"+e.value+"</ques:parameterValue>";
   //"<ques:notes>"+item.notes+"</ques:notes>";  //TODO: TBC with Ben for actual param name

    item.questionResponse = questionResponse;
    e.source.value = "";
    item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	
	section.updateItemAt(e.itemIndex, item);
};

function onNotesClick(e){
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;
	
	var item = e.section.getItemAt(e.itemIndex);

	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, title : "Question Notes",closeCallBack : function(notes){
		
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

function onTextFieldFocus(e){
	
	Alloy.Globals.currentlyFocusedTF = e.source;
	

	var item = e.section.getItemAt(e.itemIndex);
	
	if(typeof item === "undefined"){
		return;
	}
	if(item.readOnly == true){
		e.source.blur();
		return;
	}
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	e.source.value = item.displayValue.value;

};

function onTitleClick(e){

	var item = e.section.getItemAt(e.itemIndex);
	//alert("question value = "+item.displayValue.value);
	
	Alloy.Globals.currentlyFocusedTF && Alloy.Globals.currentlyFocusedTF.blur();
	Alloy.Globals.questionRenderer.selectQuestion(item);
}

