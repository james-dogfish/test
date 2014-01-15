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


function dateButtonClicked(e){
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
		//questionValueChange(item, section, dateString);
		
		/*
		var responseObject = [
			{name : item.name},
			{value : dateString},
			{notes : ""}
		];
		*/
		
		var responseObject = {
			"ques:parameterName":{"#text":item.name},
			"ques:parameterValue":{"#text":dateString}
		};
	
	
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : dateString,
			responseObject : responseObject
		}); 
	}});
};

