function onClickCallBack(e){
	var item = e.section.getItemAt(e.itemIndex);
	
	Ti.App.fireEvent("pageSelected", {
		sectionList : item.sectionList,
		pageName : item.name
	}); 
};

function deleteButtonClick(e){
	var item = e.section.getItemAt(e.itemIndex);
	Ti.App.fireEvent("deletePage", {associatedFileName : item.associatedFileName}); 
};