function onClickCallBack(e){
    var item = e.section.getItemAt(e.itemIndex);    
    Ti.App.fireEvent("goToQuestionEvent", {
        groupType : item.groupType,
        questionIndex : item.questionIndex
    });	
}
