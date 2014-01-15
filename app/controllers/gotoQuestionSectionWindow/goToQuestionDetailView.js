
var gotoDisplayViewWidth = Alloy.Measurement.dpToPX(200);

$.container.width = gotoDisplayViewWidth;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "0dp";
animationOpen.duration = 700;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = gotoDisplayViewWidth;
animationClose.duration = 700;

exports.setContentsDetails = function(pageName, questionSectionContentsDetails){
	$.headerTitle.text = pageName;
	
	var sectionList = questionSectionContentsDetails;
	var ListViewSectionList = [];
	
	for(var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++){
		var newListViewSection = Alloy.createController('gotoQuestionSectionWindow/goToQuestionSection');
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
		$.container.left = gotoDisplayViewWidth;
	}
};

