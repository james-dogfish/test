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
	
	/*
	Ti.App.fireEvent("questionSelected", {
		questionObject : item
	}); 
	*/
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	
	
	
	Alloy.createController("questionDialogs/modalDatePicker", {closeCallBack : function(dateString){
		item.displayValue = {value : dateString};
		item.value = dateString;
		section.updateItemAt(e.itemIndex, item);
		//questionValueChange(item, section, dateString);
		
		if(item.alcrmQuestionID.trim() === "LAST_ASSESSMENT_DATE")
		{
			Ti.App.Properties.setString("LastAssDate",dateString);
			//alert("LastAssDate = "+Ti.App.Properties.getString("LastAssDate"));
		}
	
		
		/*
		var responseObject = [
			{name : item.name},
			{value : dateString},
			{notes : ""}
		];
		*/
		
		
		
		var questionResponse = 
       		"<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ 
       		"<ques:parameterValue>"+dateString+"</ques:parameterValue>";
	
		item.questionResponse = questionResponse;
		
		item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		
		/*
	
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : dateString,
			responseObject : questionResponse
		}); 
		*/
	}});
};

