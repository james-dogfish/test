function onTextFieldBlur(e){

	Alloy.Globals.Logger.log("onTextFieldBlur");
	Alloy.Globals.currentlyFocusedTF = {TextField : null, questionObject : null};
	
	
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
	
	if(item.value[0] === ""){
		item.questionResponse = null;
	}
	else{
		item.questionResponse = 
		"<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ 
   		"<ques:parameterValue>"+Alloy.Globals.Util.escapeXML(e.value)+"</ques:parameterValue>";
	}
	
    if(Alloy.Globals.questionRenderer != null){
    	item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
    }   
	
};

function onNotesClick(e){
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;
	
	var item = e.section.getItemAt(e.itemIndex);

	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, title : "Question Notes",closeCallBack : function(notes){
		var item = e.section.getItemAt(e.itemIndex);
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
	Alloy.Globals.Logger.log("onTextFieldFocus");
	
	var item = e.section.getItemAt(e.itemIndex);
		
	if(typeof item === "undefined"){
		return;
	}
	if(item.readOnly == true){
		e.source.blur();
		return;
	}
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
	Alloy.Globals.currentlyFocusedTF = {TextField : e.source, questionObject : item};
};

function onTitleClick(e){

	var item = e.section.getItemAt(e.itemIndex);
	
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();

	Alloy.Globals.questionRenderer.selectQuestion(item,e.section);
}

