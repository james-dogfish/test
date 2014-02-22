function onNotesClick(e){
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;

	var item = e.section.getItemAt(e.itemIndex);
	
	Alloy.createController("questionDialogs/userNotesDialog", {notes : item.notes, title : "Question Notes", 
		closeCallBack : function(notes){
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
		}
	});
};

function onTitleClick(e){
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
	Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
};

function dateButtonClicked(e){
	
	if(Alloy.Globals.dialogWindowOpen == true)return;
	else Alloy.Globals.dialogWindowOpen = true;
	
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
	
	var timeLimit =false;
	if(item.alcrmQuestionID == "CENSUS_DATE" || item.alcrmQuestionID == "I_CENSUS_DATE"){
		timeLimit= true;
	}
	
	
	Alloy.createController("questionDialogs/modalDatePicker", {timeLimit : timeLimit, 
		closeCallBack : function(dateString){
			item.displayValue = {value : dateString};
			item.value = [dateString];	
			
			section.updateItemAt(e.itemIndex, item);
			//alert(dateString);
			
			
			var questionResponse = 
	       		"<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+ 
	       		"<ques:parameterValue>"+dateString+"</ques:parameterValue>";
	       		//"<ques:notes>"+item.notes+"</ques:notes>";
			//alert(questionResponse);
			
			item.questionResponse = questionResponse;
			
			item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	
		}, 
		closeWithNoValueCallBack : function(){
			
			Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		}
	});
};

