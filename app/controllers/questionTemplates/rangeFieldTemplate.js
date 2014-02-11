var currentValue = ["" ,""];

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
};



function onTextField1Blur(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	item.displayValue = {value : e.value};
	currentValue[0] = e.value;
	item.value = currentValue;
	
	var questionResponse = 
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
       "<ques:highValue>"+currentValue[2]+"</ques:highValue>";
       //"<ques:notes>"+item.notes+"</ques:notes>";
       
    item.questionResponse = questionResponse;
    
    item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
};

function onTitleClick(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.currentlyFocusedTF && Alloy.Globals.currentlyFocusedTF.blur();
	Alloy.Globals.questionRenderer.selectQuestion(item);
};

function onTextField2Blur(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	item.displayValue2 = {value : e.value};
	currentValue[2] = e.value;
	item.value = currentValue;
	
	var questionResponse = 
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
       "<ques:highValue>"+currentValue[2]+"</ques:highValue>";
       //"<ques:notes>"+item.notes+"</ques:notes>";

	item.questionResponse = questionResponse;
	
	item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});

};