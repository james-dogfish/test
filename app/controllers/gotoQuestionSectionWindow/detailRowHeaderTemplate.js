function onClickCallBack(e) {
    var item = e.section.getItemAt(e.itemIndex);
    Ti.App.fireEvent("goToHeaderClicked", {
        groupType : item.groupType
    });
}
