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
	
	var currentValue = {displayValue : "", value :""};
	if(item.selections.length >= 1){
		currentValue = item.selections[0];
	}
	
	Alloy.createController("questionDialogs/modalPicker", {
		currentValue: currentValue,
		valueList : item.selections, 
		closeCallBack : function(data){
			item.displayValue = {value : data.displayValue};
			item.value = [data.displayValue];
			
			Alloy.Globals.questionRenderer.setEntireSectionTemplate(section.groupType, [data.value], data.displayValue, item.questionToChangeTemplate);		
	}});
};

function showLinkedQuestions(e){
	if(Alloy.Globals.isDebugOn == false)return;
}