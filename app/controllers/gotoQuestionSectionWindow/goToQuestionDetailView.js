
//var gotoDisplayViewWidth = Alloy.Measurement.dpToPX(400);

//$.container.width = gotoDisplayViewWidth;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "100%";
animationClose.duration = Alloy.Globals.animationDuration;

exports.setContentsDetails = function(pageName, questionSectionContentsDetails){
	$.headerTitle.text = pageName;
	
	var sectionList = questionSectionContentsDetails;
	var ListViewSectionList = [];
	
	for(var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++){
		var newListViewSection = Alloy.createController('gotoQuestionSectionWindow/detailRowSection');
		newListViewSection.setdata(sectionList[sectionListIndex]);
		ListViewSectionList.push(newListViewSection.getView());
	}
	$.listView.setSections(ListViewSectionList);
	
};

function backButtonClick(e){
	$.trigger('moveToMaster');
}

exports.MoveToOpen = function(isAnimated){
	if(isAnimated == true){
		$.container.animate(animationOpen);
	}
	else{
		$.container.left = "0%";
	}
};

exports.MoveToClose = function(isAnimated){
	if(isAnimated == true){
		$.container.animate(animationClose);
	}
	else{
		$.container.left = "100%";
	}
};

