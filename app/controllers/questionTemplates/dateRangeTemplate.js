var currentValue = ["" ,""];

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


function dateButton1Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	item = Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	Alloy.createController("questionDialogs/modalDatePicker", {
		closeCallBack : function(dateString){
			item.displayValue = {value : dateString};
			if(item.value.length < 2){
				item.value[1] = ""; 
				
			}
			
			item.value[0] = dateString;
			
			var questionResponse = 
		       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
		       "<ques:lowValue>"+item.value[0]+"</ques:lowValue>"+
		       "<ques:highValue>"+item.value[2]+"</ques:highValue>";
		       
		    item.questionResponse = questionResponse;
			item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		}, 
		closeWithNoValueCallBack : function(){
			
			Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		}
	});
};

function onTitleClick(e){
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
	Alloy.Globals.questionRenderer.selectQuestion(item, e.section);
};

function dateButton2Clicked(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 

	item = Alloy.Globals.questionRenderer.selectQuestion(item,e.section);
	
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	Alloy.createController("questionDialogs/modalDatePicker", {
		closeCallBack : function(dateString){
			item.displayValue2 = {value : dateString};
	
			item.value[1] = dateString;
			
			
			var questionResponse = 
		       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
		       "<ques:lowValue>"+item.value[0]+"</ques:lowValue>"+
		       "<ques:highValue>"+item.value[2]+"</ques:highValue>"+
		       "<ques:notes>"+item.notes+"</ques:notes>";
		    
		   item.questionResponse = questionResponse;
			
			item = Alloy.Globals.questionRenderer.changeQuestionValue({questionObject : item, questionIndex : e.itemIndex, section : section});
	
		}, 
		closeWithNoValueCallBack : function(){
			
			Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
		}
	});
};
