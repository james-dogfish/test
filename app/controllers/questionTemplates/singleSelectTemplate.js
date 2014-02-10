function selectButtonClicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;

	/*
	Ti.App.fireEvent("questionSelected", {
		questionObject : item
	}); 
	*/

	if(item.readOnly == true){
		
		return;
	}
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item);
	showPicker(e);
};

function showPicker(e)
{
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;
	
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;
	
	Alloy.createController("questionDialogs/modalPicker", {currentValue : item.value[0], valueList : item.selections, closeCallBack : function(data){
		item.displayValue = {value : data.displayValue};
		item.value = [data.value];
		section.updateItemAt(e.itemIndex, item);
		
		Alloy.Globals.Logger.log("modalPicker value = "+data.value, "info");
		//questionValueChange(item, section, valueString);
		
		var questionResponse = 
	       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
	       "<ques:parameterValue>"+data.value+"</ques:parameterValue>";
	       //"<ques:notes>"+item.notes+"</ques:notes>";
	       
	    item.questionResponse = questionResponse;
	
		var showSpiner = false;
		var activityIndicator;
		if(item.renderDependencyList.length > 0){
			showSpiner = true;
			activityIndicator = Alloy.createController('userNotificationWindows/activityIndicatorDialog');
			activityIndicator.show();
		}
		
		
		item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		
		if(showSpiner == true){
			activityIndicator.hide();
		}
		/*
		Ti.App.fireEvent("questionValueChange", {
			item : item,
			name : item.name,
			itemIndex : e.itemIndex,
			groupType : item.groupType,
			value : [data.displayValue],
			responseObject : questionResponse
		}); 
		*/
	}, 
	closeWithNoValueCallBack : function(){
		
		Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	}
	
	});
}

function onNotesClick(e){
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;
	
	
	var item = e.section.getItemAt(e.itemIndex);
	
	//notesBackground : {backgroundImage: 'images/questionNote.png'}
	//{backgroundImage: 'images/questionNote.png'}
	//{backgroundImage: 'images/questionSelectedNote.png'},
	//alert("question name = "+item.name);
	
	
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
		
		Alloy.Globals.localDataHandler.updateQuestion(item);
	}});
};


function onTitleClick(e){
	
	//if(Alloy.Globals.isDebugOn == false)return;
	
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.currentlyFocusedTF && Alloy.Globals.currentlyFocusedTF.blur();
	Alloy.Globals.questionRenderer.selectQuestion(item);
	//alert("mandatoryDependenciesList = "+JSON.stringify( item.mandatoryDependenciesList));
};

