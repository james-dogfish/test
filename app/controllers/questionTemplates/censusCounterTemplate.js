//var currentValue = "";

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
	

	
	var intValue =0;
	intValue = parseInt(e.value);
	if(isNaN(intValue)){
		intValue =0;
	}
	
	//currentValue = ""+intValue;
	item.value[0] = intValue;
	item.displayValue = {value : item.value[0]};
	
	var questionResponse =
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>";
       
    item.questionResponse = questionResponse;
	
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : e.itemIndex,
		groupType : item.groupType,
		value : item.value,
		responseObject : questionResponse
	}); 
};

var addValue = function(additionValue, questionObject){
	
	var item = questionObject.section.getItemAt(questionObject.itemIndex);
	

	
	var intValue = 0;
	if(item.value[0] != ""){
		intValue = parseInt(item.value[0]);
	}
	
	intValue= (intValue + additionValue);
	if(intValue < 0){
		intValue = 0;
	}
	item.value[0] = ""+intValue;
	
	
	var section = questionObject.section; 
	item.displayValue = {value : item.value[0]};
	
	
	section.updateItemAt(questionObject.itemIndex, item);
	
	var responseObject = 
	"<ass1:riskData>"+
       "<ques:parameterName>"+item.name+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>"+
    "</ass1:riskData>";
	
	Ti.App.fireEvent("questionValueChange", {
		item : item,
		name : item.name,
		itemIndex : questionObject.itemIndex,
		groupType : item.groupType,
		value : item.value,
		responseObject : responseObject
	}); 
	
};

function minusFive(e){
	var newValue = addValue(-5, e);
};

function minusOne(e){
	var newValue = addValue(-1, e);
};

function addOne(e){
	var newValue = addValue(+1, e);
};

function addFive(e){
	var newValue = addValue(+5, e);
};
