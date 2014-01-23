function onTextFieldBlur(e){
	//Alloy.createController("userNotificationWindows/activityIndicatorDialog").show(); 
	
	//alert("e.itemIndex : "+e.itemIndex);
	var item = e.section.getItemAt(e.itemIndex);
	
	/*
	if(typeof item === "undefined"){
		alert("in textFieldTemplate.onTextFieldBlur item was undefined");
		return;
	}
	var section = e.section; 
	item.displayValue = {value : e.value};
	item.value = [e.value];
	
	var responseObject = 
	"<ass1:riskData>"+
       "<ques:parameterName>"+item.name+"</ques:parameterName>"+
       "<ques:parameterValue>"+e.value+"</ques:parameterValue>"+
    "</ass1:riskData>";
    
    

	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : e.itemIndex,
		groupType : item.groupType,
		value : [e.value],
		responseObject : responseObject
	}); 
	
	*/
	
		
	//section.updateItemAt(e.itemIndex, item);
};

function onStartButtonClick(e){
	var question = e.section.getItemAt(e.itemIndex);
	question = Alloy.Globals.questionRenderer.selectQuestion(question);
	
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
	
	
	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, closeCallBack : function(notes){
		
		if(notes != ""){
			item.notesBackground = {backgroundImage: 'images/questionSelectedNote.png'};
			item.notes = notes; 
		}
		else{
			item.notesBackground = {backgroundImage: 'images/questionNote.png'};
			item.notes = ""; 
		}
		e.section.updateItemAt(e.itemIndex, item);
		
		Ti.App.fireEvent("notesAdded", {
			item : item,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			notes : notes
		});
	}});
};

function onTitleClick(e){
	if(Alloy.Globals.isDebugOn == false)return;
	var item = e.section.getItemAt(e.itemIndex);
	alert("name = "+item.name);
}

