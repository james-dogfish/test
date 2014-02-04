//var currentValue = "";

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
		
		localDataHandler.updateQuestion(item);
	}});
};


function onTextFieldFocus(e){
	//e.source.blur();
	
	var item = e.section.getItemAt(e.itemIndex);
	e.source.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONBLUR;
	if(typeof item === "undefined"){
		//alert("in textFieldTemplate.onTextFieldFocus item was undefined");
		return;
	}
	if(item.readOnly == true){
		e.source.blur();
	}
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	
	/*
	Ti.App.fireEvent("questionSelected", {
		questionObject : item
	}); 
	*/
};



function onTextField1Blur(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	e.source.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONBLUR;
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	var intValue =parseInt(e.value);
	if(isNaN(intValue)){
		intValue =0;
	}
	
	//currentValue = ""+intValue;
	item.value[0] = ""+intValue;
	item.displayValue = {value : item.value[0]};
	
	var questionResponse =
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>"+
       "<ques:notes>"+item.notes+"</ques:notes>";
       
    item.questionResponse = questionResponse;
	
	/*
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : e.itemIndex,
		groupType : item.groupType,
		value : item.value,
		responseObject : questionResponse
	}); 
	*/
	
	item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
    
};

var addValue = function(additionValue, e){
	
	var section = e.section; 
	var item = section.getItemAt(e.itemIndex);
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	
	var intValue = intValue = parseInt(item.value[0]);
	if(isNaN(intValue)){
		intValue =0;
	}
	
	intValue= (intValue + additionValue);
	if(intValue < 0){
		intValue = 0;
	}
	item.value[0] = ""+intValue;
	
	//alert("value = "+item.value[0]);
	
	
	item.displayValue = {value : item.value[0]};
	
	
	//section.updateItemAt(questionObject.itemIndex, item);
	
	var questionResponse = 
	"<ass1:riskData>"+
       "<ques:parameterName>"+item.name+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>"+
    "</ass1:riskData>";
    
    item.questionResponse = questionResponse;
    
    item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
    
    /*
	
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : questionObject.itemIndex,
		groupType : item.groupType,
		value : item.value,
		responseObject : responseObject
	}); 
	*/
	
};

function minusFive(e){
	var item = e.section.getItemAt(e.itemIndex);
	if(item.readOnly == true){
		return;
	}
	var newValue = addValue(-5, e);
};

function minusOne(e){
	var item = e.section.getItemAt(e.itemIndex);
	if(item.readOnly == true){
		return;
	}
	var newValue = addValue(-1, e);
};

function addOne(e){
	var item = e.section.getItemAt(e.itemIndex);
	if(item.readOnly == true){
		return;
	}
	var newValue = addValue(+1, e);
};

function addFive(e){
	var item = e.section.getItemAt(e.itemIndex);
	if(item.readOnly == true){
		return;
	}
	var newValue = addValue(+5, e);
};
