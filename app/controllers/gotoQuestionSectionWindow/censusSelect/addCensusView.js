

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

var valueList = [{displayValue : "Census 2", value : 1}, {displayValue : "Census 2", value : 2}, {displayValue : "Census 3", value : 3}, {displayValue : "Census 4", value : 4}];
var currentValue = valueList[0];
alert(JSON.stringify(Alloy.Globals.questionRendererTab.getAssessment().crossingID));

Alloy.Globals.aIndicator.show("Loading...");
Alloy.Globals.Soap.searchCensus(
	{
		crossingId:Alloy.Globals.questionRendererTab.getAssessment().crossingID
	},
	function(xmlDoc){
		 var XMLTools = require("tools/XMLTools");
         var xml2 = new XMLTools(xmlDoc);
         var responseObj = JSON.stringify(xml2.toObject());
         if(typeof responseObj === "undefined")
         {
         	alert("No data. Please retry.");
            Alloy.Globals.aIndicator.hide();
            return;
         }else{
         	alert(JSON.stringify(responseObj));
         	//TODO: 
         	//	(1) parse response
         	//	(2) add each item to 
         	//  (3) SET valueList = [{displayValue : "Census 2", value : 1}, {displayValue : "Census 2", value : 2}, {displayValue : "Census 3", value : 3}, {displayValue : "Census 4", value : 4}];
			//	(4) SET currentValue = valueList[0];
			/*	(5) var data = [];
			//	for(var i=0;i<valueList.length;i++){
			//		data.push(Ti.UI.createPickerRow({title: valueList[i].displayValue, value : valueList[i].value }
			//		));
			//	}
			*/
         	Alloy.Globals.aIndicator.hide();
         }
	},
	function(xmlDoc){ /**handled by Suds2_fat error message - so no need to put anything here**/
	});
						
						
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

