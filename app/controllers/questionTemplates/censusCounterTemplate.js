//var currentValue = "";

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


function onTextFieldFocus(e){

	Alloy.Globals.currentlyFocusedTF = e.source;

	var item = e.section.getItemAt(e.itemIndex);
	if(typeof item === "undefined"){
		return;
	}
	if(item.readOnly == true){
		e.source.blur();
	}
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item,e.section);

};



function onTextField1Blur(e){
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section; 
	if(item.readOnly == true){
		section.updateItemAt(e.itemIndex, item);
		return;
	}
	
	var intValue =parseInt(e.value);
	if(isNaN(intValue)){
		intValue =0;
	}
	
	item.value[0] = ""+intValue;
	item.displayValue = {value : item.value[0]};
	
	var questionResponse =
       "<ques:parameterName>"+item.alcrmQuestionID+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>";
      // "<ques:notes>"+item.notes+"</ques:notes>";
       
    item.questionResponse = questionResponse;
	
	if(Alloy.Globals.questionRenderer != null){
		item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	}
    
};

function onTitleClick(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	Alloy.Globals.questionRenderer.blurCurrentlyFocusedTF();
	Alloy.Globals.questionRenderer.selectQuestion(item,e.section);
};

var moment = require('alloy/moment');

var addValue = function(additionValue, e){

	var section = e.section; 

	var timebeforeGet = moment();

	var item = section.getItemAt(e.itemIndex);

	var timeAfterGet = moment();
	
	item = Alloy.Globals.questionRenderer.selectQuestion(item,e.section);
	
	var intValue = intValue = parseInt(item.value[0]);
	if(isNaN(intValue)){
		intValue =0;
	}
	
	intValue= (intValue + additionValue);
	if(intValue < 0){
		intValue = 0;
	}
	item.value[0] = ""+intValue;
	
	item.displayValue = {value : item.value[0]};
	
	var questionResponse = 
       "<ques:parameterName>"+item.name+"</ques:parameterName>"+
       "<ques:parameterValue>"+item.value[0]+"</ques:parameterValue>";
    
    item.questionResponse = questionResponse;
    
   	//item = Alloy.Globals.questionRenderer.questionValueChange({questionObject : item, questionIndex : e.itemIndex, section : section});
	//section.updateItemAt(e.itemIndex, item);
	
	//section.sectionIndex, 
	//section.replaceItemsAt(e.itemIndex,1, [item]);
	//section.updateItemAt(item, e.itemIndex, section.customSectionIndex);
	var timeBeforeUpdate = moment();
	section.updateItemAt(e.itemIndex, item, {
		animated: false
	});
	var timeAfterUpdate = moment();
	Alloy.Globals.localDataHandler.updateQuestion(item);
	var timeAfterSave = moment();

	alert("time before get item is "+timebeforeGet.format('hh:mm:ss')+" and after get is "+timeAfterGet.format('hh:mm:ss')+" and before update is "+timeBeforeUpdate.format('hh:mm:ss')+" and after update is "+timeAfterUpdate.format('hh:mm:ss'));
};

function minusFive(e){
	addValue(-5, e);
};

function minusOne(e){
	addValue(-1, e);
};

function addOne(e){
	addValue(+1, e);
};

function addFive(e){
	addValue(+5, e);
};
