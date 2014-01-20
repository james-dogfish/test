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
		
		alert("valueName = "+data.displayValue+", value = "+data.value);
		
		/*
		Ti.App.fireEvent("questionValueChange", {
			item : item,
		});
		*/
	}});
};

function showLinkedQuestions(e){
	
	if(Alloy.Globals.isDebugOn == false)return;
	
	
}
