var currentValue = ["" ,""];

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


function onTextFieldFocus(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	if(typeof item === "undefined"){
		alert("in textFieldTemplate.onTextFieldFocus item was undefined");
		return;
	}
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
};



function onTextField1Blur(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	item.displayValue = {value : e.value};
	
	//var test = validateValue(e.value, item.type, item.jsonObject);
	//if(test == false)return;
	currentValue[0] = e.value;
	item.value = currentValue;
	
	/*
	var responseObject = [
		{name : item.name},
		{lowValue : currentValue[0]},
		{highValue : currentValue[1]},
		{notes : ""}
	];
	*/
	
	/*
	var responseObject = {
		"ques:parameterName":{"#text":item.name},
		"ques:lowValue":{"#text":currentValue[0]},
		"ques:highValue":{"#text":currentValue[1]}
	};
	*/
	
	var questionResponse = 
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
       "<ques:highValue>"+currentValue[2]+"</ques:highValue>";
       
    item.questionResponse = questionResponse;
	
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : e.itemIndex,
		groupType : item.groupType,
		value : currentValue,
		responseObject : questionResponse
	}); 
};

function onTextField2Blur(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	item.displayValue2 = {value : e.value};
	
	//var test = validateValue(e.value, item.type, item.jsonObject);
	//if(test == false)return;
	currentValue[2] = e.value;
	item.value = currentValue;
	
		/*
	var responseObject = [
		{name : item.name},
		{lowValue : currentValue[0]},
		{highValue : currentValue[1]},
		{notes : ""}
	];
	*/
	
	/*
	var questionResponse = {
		"ques:parameterName":{"#text":item.name},
		"ques:lowValue":{"#text":currentValue[0]},
		"ques:highValue":{"#text":currentValue[1]}
	};
	*/
	
	var questionResponse = 
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
       "<ques:highValue>"+currentValue[2]+"</ques:highValue>";

	item.questionResponse = questionResponse;
	
	
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : e.itemIndex,
		groupType : item.groupType,
		value : currentValue,
		responseObject : questionResponse
	}); 
};