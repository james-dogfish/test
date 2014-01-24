var args = arguments[0] || {};

var data = [];
for(var i=0;i<args.valueList.length;i++){
	data.push(Ti.UI.createTableViewRow({
		title: args.valueList[i].displayValue, 
		value : args.valueList[i].value, 
		tintColor:'#008FD5',
		hasCheck : false}));
}

$.tableView.setData(data);
//$.tableView.selectionIndicator = true;


var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = Alloy.Globals.animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = Alloy.Globals.animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "12%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-76%";
animationClose.duration = Alloy.Globals.animationDuration;
animationClose.addEventListener("complete", function(e){
	$.window.close();
});

var closeWindow = function(){

	var returnValue = {
		displayNameList : [], 
		valueList : [],
		singleStringValue : ""
	};
		
		
	for(var i=0;i<data.length;i++){
		if(data[i].hasCheck == true){
			
			returnValue.displayNameList.push(data[i].title);
			returnValue.valueList.push(data[i].value);
			
			if(returnValue.singleStringValue == ""){
				returnValue.singleStringValue = data[i].title;
			}
			else{
				returnValue.singleStringValue = returnValue.singleStringValue +", "+data[i].title;
			}
		}
	}
	args.closeCallBack(returnValue);
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
}

function rightNavButtonClick(e){
	closeWindow();
};

function rowClicked(e){
	if(e.row.hasCheck == true){
		e.row.hasCheck = false;
	}
	else{
		e.row.hasCheck = true;
	}
}

$.window.open();
$.background.animate(animationFadeIn);
$.modalBackgorund.animate(animationOpen);