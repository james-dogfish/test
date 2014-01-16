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


function multiSelectButtonClicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
	
	Alloy.createController("questionDialogs/modalMultiPicker", {valueList : item.selections, closeCallBack : function(returnValue){
		
		/*
		var returnValue = {
			displayNameList : [], 
			valueList : [],
			singleStringValue : ""
		};
		*/
	
	
		item.displayValue = {value : returnValue.singleStringValue};
		item.value = returnValue.displayNameList;
		section.updateItemAt(e.itemIndex, item);
		//questionValueChange(item, section, valueString);
		
		
		var values ="";
		for(var i=0; i< returnValue.valueList.length; i++){
			values = values+"<ques:values>"+returnValue.valueList[i]+"</ques:values>";
		}
		var responseObject =
	        "<ques:parameterName>"+item.name.substring(1)+"</ques:parameterName>"+ values;
	    

		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : returnValue.valueList,
			responseObject : responseObject
		}); 
	}});
};