var open = false;

exports.isOpen = function(){
	return open;
};

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

exports.show = function(){
	$.container.animate(animationOpen);
	open = true;
};

var hide = function(){
	$.container.animate(animationClose);
	open = false;
};

exports.hide = function(){
	hide();
};

function doneButtonClick(e){
	hide();
};

function createCensusClick(e){
	$.trigger('createCensus');
};

function addCensusClick(e){
	
	$.trigger('addCensus');
};

function pickerChange(e){
	
};

