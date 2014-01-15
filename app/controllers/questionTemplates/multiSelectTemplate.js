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
	
	Alloy.createController("questionDialogs/modalMultiPicker", {valueList : item.selections, closeCallBack : function(data){
		item.displayValue = {value : data.displayValue};
		item.value = data.valueList;
		section.updateItemAt(e.itemIndex, item);
		//questionValueChange(item, section, valueString);
		
		/*
		var responseObject = [
			{name : item.name},
			{notes : ""}
		];
		for(var i=0; i< data.valueList.length; i++){
			responseObject.push({values : data.valueList[i]});
		}
		*/
		
		/*
		var values =[];
		for(var i=0; i< data.valueList.length; i++){
			values.push({"#text":data.valueList[i]});
		}
		var responseObject = {
			"ques:parameterName":{"#text":item.name},
			"ques:values":values,
		};
		*/
		
		var values ="";
		for(var i=0; i< data.valueList.length; i++){
			values = values+"<ques:values>"+data.valueList[i]+"</ques:values>";
		}
		var responseObject = 
		"<ass1:riskData>"+
	       "<ques:parameterName>"+item.name+"</ques:parameterName>"+ values;
	    "</ass1:riskData>";
	    

		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : data.valueList,
			responseObject : responseObject
		}); 
	}});
};