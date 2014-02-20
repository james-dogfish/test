function onTextFieldChange(e){
	var item = e.section.getItemAt(e.itemIndex);
	item.value[0] = e.value;
	
	// Removing as performance is very slow. Signed off with Jordan
	//Alloy.Globals.questionRenderer.questionRealTimeValidation({questionObject : item, questionIndex : e.itemIndex, section : e.section});
};

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
   		"<ques:parameterValue>"+e.value+"</ques:parameterValue>";
   		//"<ques:notes>"+item.notes+"</ques:notes>";  //TODO: TBC with Ben for actual param name
	}
	
	
    //e.source.value = "";
    item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	
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
	Alloy.Globals.Logger.log("onTextFieldFocus");
	
	//Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
	
	/*
	{"color":"#000",
	"backgroundColor":"#eee",
	"title":"Select",
	"enabled":true,
	"font":{"fontWeight":"bold","fontFamily":"Helvetica Neue","fontSize":"20sp"},
	"borderColor":"#aaa",
	"touchTestID":"0I_CCIL_button1",
	"bindId":"btnSelect",
	"textAlign":1,
	"borderRadius":5,
	"right":"0dp",
	"borderWidth":2,
	"height":"50dp",
	"width":"FILL",
	"horizontalWrap":true
	}
	*/
	
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

	Alloy.Globals.currentlyFocusedTF = {TextField : e.source, questionObject : item};

};

function onTitleClick(e){

	var item = e.section.getItemAt(e.itemIndex);
	
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();

	Alloy.Globals.questionRenderer.selectQuestion(item);
}

