function selectButtonClicked(e){
	
	var item = e.section.getItemAt(e.itemIndex);
	var section = e.section;
	
	Ti.App.fireEvent("questionSelected", {
		name : item.name,
		groupType : item.groupType
	}); 
	
	var item = section.getItemAt(e.itemIndex);
	if(item.readOnly == true){
		return;
	}
	
	/*
	var currentValue = {displayValue : "", value :""};
	if(item.currentValue.length >= 1){
		currentValue = item.selections[0];
	}
	*/
	if ( typeof item.value !== "undefined") {
		if(item.value.length === 0){
			item.value = [""];
		}
	}
	else{
		item.value = [""];
	}
	Ti.API.info("1 item.value = "+JSON.stringify(item.value));
	Alloy.createController("questionDialogs/modalPicker", {
		currentValue: {displayValue : "", value :item.value[0]},
		valueList : item.selections, 
		closeCallBack : function(data){
			item.displayValue = {value : data.displayValue};
			item.value = [data.value];
			Ti.API.info("2 item.value = "+JSON.stringify(item.value));
			Alloy.Globals.questionRenderer.setEntireSectionTemplate(section.groupType, [data.value], data.displayValue, item.questionToChangeTemplate);	
			
			Alloy.Globals.localDataHandler.updateQuestion(item);
			section.updateItemAt(e.itemIndex, item, {animated: false});
			
	}});
};

function showLinkedQuestions(e){
	if(Alloy.Globals.isDebugOn == false)return;
}