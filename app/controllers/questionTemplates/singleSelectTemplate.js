function selectButtonClicked(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;
	
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
	
	
	
	Alloy.createController("questionDialogs/modalPicker", {valueList : item.selections, closeCallBack : function(data){
		item.displayValue = {value : data.displayValue};
		item.value = [data.displayValue];
		section.updateItemAt(e.itemIndex, item);
		//questionValueChange(item, section, valueString);
		
		var responseObject = 
	       "<ques:parameterName>"+item.name.substring(1)+"</ques:parameterName>"+
	       "<ques:parameterValue>"+data.value+"</ques:parameterValue>";
	
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : [data.displayValue],
			responseObject : responseObject
		}); 
	}});
};

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


function debugShowRenderDependencies(e){
	
	if(Alloy.Globals.isDebugOn == false)return;
	
	var item = e.section.getItemAt(e.itemIndex);
	var dependencyList = item.debugQuestionDependencyList;
	
	var string = "";
	for(var i=0; i< dependencyList.length; i++){
		if(i == 0){
			string = dependencyList[i];
		}
		else{
			string = string+ ", "+dependencyList[i];
		}
	}
	alert(string);
}
