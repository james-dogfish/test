var open = false;

exports.isOpen = function(){
	return open;
};


var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "51%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "100%";
animationClose.duration = Alloy.Globals.animationDuration;

var openPickerContainer= Titanium.UI.createAnimation();
openPickerContainer.height = Ti.UI.SIZE;
//openPickerContainer.bottom = "20dp";
openPickerContainer.duration = Alloy.Globals.animationDuration;

var closePickerContainer= Titanium.UI.createAnimation();
closePickerContainer.height = 0;
//closePickerContainer.bottom = 0;
closePickerContainer.duration = Alloy.Globals.animationDuration;

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

function censusDesktopCompleteClick(e){
	$.trigger('censusDesktopComplete');
};

function pickerChange(e){
	
};

