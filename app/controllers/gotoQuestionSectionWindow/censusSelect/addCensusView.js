var animationDuration = 700;


var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "51%";
animationOpen.duration = animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "100%";
animationClose.duration = animationDuration;

var openPickerContainer= Titanium.UI.createAnimation();
openPickerContainer.height = Ti.UI.SIZE;
//openPickerContainer.bottom = "20dp";
openPickerContainer.duration = animationDuration;

var closePickerContainer= Titanium.UI.createAnimation();
closePickerContainer.height = 0;
//closePickerContainer.bottom = 0;
closePickerContainer.duration = animationDuration;

var valueList = [{displayValue : "Census 2", value : 1}, {displayValue : "Census 2", value : 2}, {displayValue : "Census 3", value : 3}, {displayValue : "Census 4", value : 4}];
var currentValue = valueList[0];

var data = [];
for(var i=0;i<valueList.length;i++){
	data.push(Ti.UI.createPickerRow({title: valueList[i].displayValue, value : valueList[i].value }
	));
}

$.pickerView.add(data);
$.pickerView.selectionIndicator = true;
$.pickerView.setSelectedRow(0, 0, true);

exports.show = function(){
	$.container.animate(animationOpen);
};

var hide = function(){
	$.container.animate(animationClose);
};

exports.hide = function(){
	hide();
};

function doneButtonClick(e){
	alert("displayValue = "+currentValue.displayValue);
	$.trigger('addPastCensus', currentValue);
};

function pickerChange(e){
	currentValue = {
		displayValue : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).value
	};
};

