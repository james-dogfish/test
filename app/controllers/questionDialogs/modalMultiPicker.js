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

var animationDuration = 700;

var animationFadeIn = Titanium.UI.createAnimation();
animationFadeIn.opacity = 0.5;
animationFadeIn.duration = animationDuration;

var animationFadeOut = Titanium.UI.createAnimation();
animationFadeOut.opacity = 0;
animationFadeOut.duration = animationDuration;

var animationOpen = Titanium.UI.createAnimation();
animationOpen.right = "12%";
animationOpen.duration = animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.right = "-76%";
animationClose.duration = animationDuration;
animationClose.addEventListener("complete", function(e){
	$.window.close();
});

var closeWindow = function(){
	var returnString = "";
	var returnValueList = [];
	for(var i=0;i<data.length;i++){
		if(data[i].hasCheck == true){
			returnValueList.push(data[i].title);
			if(returnString == ""){
				returnString = data[i].title;
			}
			else{
				returnString = returnString +", "+data[i].title;
			}
		}
	}
	args.closeCallBack({displayValue : returnString, valueList  : returnValueList});
	$.modalBackgorund.animate(animationClose);
	$.background.animate(animationFadeOut);
};

function onBackgroundClick(e){
	closeWindow();
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