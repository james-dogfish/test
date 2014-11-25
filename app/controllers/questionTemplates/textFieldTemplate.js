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
	item.displayValue.value =  String(e.value).trim();
	item.value = [String(e.value).trim()];
	
	if(item.value[0] === ""){
		item.questionResponse = null;
	}
	else{
		item.questionResponse = 
		"<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ 
   		"<ques:parameterValue>"+Alloy.Globals.Util.escapeXML(String(e.value).trim())+"</ques:parameterValue>";
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

	// Function will remove Transparentview created in questionRenderer 
	// and clean up touchstart events.
	// http://jira.dogfishdata.com/browse/NRAM-383
	var removeTransparentView = function(){
		Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
		Alloy.Globals.containerView.remove(Alloy.Globals.transparentView);
		Alloy.Globals.transparentView.removeEventListener('touchstart', removeTransparentView);
	};

	Alloy.Globals.transparentView.addEventListener('touchstart', removeTransparentView);

	Alloy.Globals.containerView.add(Alloy.Globals.transparentView);

	// Need to re-call the focus event once again as 
	// when the view above is added, the textfield loses 
	// focus
	Alloy.Globals.currentlyFocusedTF.TextField.focus();
};

function onTitleClick(e){

	var item = e.section.getItemAt(e.itemIndex);
	
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();

	Alloy.Globals.questionRenderer.selectQuestion(item,e.section);
}

