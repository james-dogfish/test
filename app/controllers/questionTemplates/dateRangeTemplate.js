var currentValue = ["" ,""];

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


function dateButton1Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	e.source.clearButtonMode = Titanium.UI.INPUT_BUTTONMODE_ONBLUR;
	
	/*
	Ti.App.fireEvent("questionSelected", {
		questionObject : item
	}); 
	*/
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	Alloy.createController("questionDialogs/modalDatePicker", {closeCallBack : function(dateString){
		item.displayValue = {value : dateString};
		//section.updateItemAt(e.itemIndex, item);
		
		if(item.value.length < 2){
			item.value[1] = ""; 
			
		}
		
		item.value[0] = dateString;
		
		/*
		var responseObject = [
			{name : item.name},
			{lowValue : currentValue[0]},
			{highValue : currentValue[1]},
			{notes : ""}
		];*/
		
		/*
		var responseObject = {
			"ques:parameterName":{"#text":item.name},
			"ques:lowValue":{"#text":currentValue[0]},
			"ques:highValue":{"#text":currentValue[1]}
		};
		*/
		
		var questionResponse = 
	       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
	       "<ques:lowValue>"+item.value[0]+"</ques:lowValue>"+
	       "<ques:highValue>"+item.value[2]+"</ques:highValue>"+
	       "<ques:notes>"+item.notes+"</ques:notes>";
	       
	    item.questionResponse = questionResponse;
	
		//questionValueChange(item, section, dateString);
		item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		
		/*

		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : currentValue,
			responseObject : questionResponse
		}); 
		*/
	}, 
	closeWithNoValueCallBack : function(){
		
		Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	}
	});
};

function dateButton2Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	/*
	Ti.App.fireEvent("questionSelected", {
		questionObject : item
	}); 
	*/
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	Alloy.createController("questionDialogs/modalDatePicker", {closeCallBack : function(dateString){
		item.displayValue2 = {value : dateString};

		//section.updateItemAt(e.itemIndex, item);
		
		
		
		item.value[1] = dateString;
		
		/*
		var responseObject = [
			{name : item.name},
			{lowValue : currentValue[0]},
			{highValue : currentValue[1]},
			{notes : ""}
		];*/
		
		/*
		var responseObject = {
			"ques:parameterName":{"#text":item.name},
			"ques:lowValue":{"#text":currentValue[0]},
			"ques:highValue":{"#text":currentValue[1]}
		};
		*/
		
		var questionResponse = 
		"<ass1:riskData>"+
	       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
	       "<ques:lowValue>"+item.value[0]+"</ques:lowValue>"+
	       "<ques:highValue>"+item.value[2]+"</ques:highValue>"+
	       "<ques:notes>"+item.notes+"</ques:notes>"+
	    "</ass1:riskData>";
	    
	   item.questionResponse = questionResponse;
		
		item = Alloy.Globals.questionRenderer.changeQuestionValue({questionObject : item, questionIndex : e.itemIndex, section : section});
		
		/*
		//questionValueChange(item, section, dateString);
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : currentValue,
			responseObject : questionResponse
		}); 
		*/
	}, 
	closeWithNoValueCallBack : function(){
		
		Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	}
	});
};
