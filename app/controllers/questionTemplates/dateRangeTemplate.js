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


function dateButton1Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	
	
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
	
	Alloy.createController("questionDialogs/modalDatePicker", {closeCallBack : function(dateString){
		item.displayValue = {value : dateString};
		item.value = dateString;
		section.updateItemAt(e.itemIndex, item);
		
		currentValue[0] = dateString;
		
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
		
		var responseObject = 
	       "<ques:parameterName>"+item.name.substring(1)+"</ques:parameterName>"+
	       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
	       "<ques:highValue>"+currentValue[2]+"</ques:highValue>";
	
		//questionValueChange(item, section, dateString);
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : currentValue,
			responseObject : responseObject
		}); 
	}});
};

function dateButton2Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
	
	Alloy.createController("questionDialogs/modalDatePicker", {closeCallBack : function(dateString){
		item.displayValue2 = {value : dateString};
		item.value = dateString;
		section.updateItemAt(e.itemIndex, item);
		
		currentValue[1] = dateString;
		
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
		
		var responseObject = 
		"<ass1:riskData>"+
	       "<ques:parameterName>"+item.name+"</ques:parameterName>"+
	       "<ques:lowValue>"+currentValue[0]+"</ques:lowValue>"+
	       "<ques:highValue>"+currentValue[2]+"</ques:highValue>"+
	    "</ass1:riskData>";
	
		
		//questionValueChange(item, section, dateString);
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : currentValue,
			responseObject : responseObject
		}); 
	}});
};
