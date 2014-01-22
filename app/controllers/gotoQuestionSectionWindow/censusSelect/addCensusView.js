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

var valueList = [];
var currentValue = 0;



exports.show = function(){

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
         	//alert(JSON.stringify(responseObj));
         	var pastCensusObject = JSON.parse(responseObj);
         	var pastCensuses = [];
         	if(typeof pastCensusObject["soapenv:Body"]["ns7:SearchCensusResponse"]["ns7:census"] !== "undefined"){
         		pastCensuses = pastCensusObject["soapenv:Body"]["ns7:SearchCensusResponse"]["ns7:census"];
         	}
         	if(pastCensuses.length === 0)
         	{
         		alert("Sorry there are no past censuses. Please create a new census and try again.");
         		Alloy.Globals.aIndicator.hide();
         		return;
         	}
         	
         	for(var pastCensuesIndex = 0; pastCensuesIndex < pastCensuses.length; pastCensuses++)
         	{
         		valueList.push({
         			displayValue : "Census "+pastCensuses[pastCensuesIndex]["ns5:censusId"], value : pastCensuses[pastCensuesIndex]["ns5:censusId"], questionList: pastCensuses[pastCensuesIndex]["ns5:censusData"]
         		});
         		
         	}
         	currentValue = valueList[0];
			var data = [];
		    for(var i=0;i<valueList.length;i++){
					data.push(Ti.UI.createPickerRow({title: valueList[i].displayValue, value : valueList[i].value, questionList: valueList[i].questionList}
					));
			}
			
			$.pickerView.add(data);
			$.pickerView.selectionIndicator = true;
			$.pickerView.setSelectedRow(0, 0, true);
			
         	Alloy.Globals.aIndicator.hide();
         	
         	$.container.animate(animationOpen);
         }
	},
	function(xmlDoc){ /**handled by Suds2_fat error message - so no need to put anything here**/
	});
};

var hide = function(){
	$.container.animate(animationClose);
};

exports.hide = function(){
	hide();
};

function doneButtonClick(e){
	//alert("displayValue = "+currentValue.displayValue);
	$.trigger('addPastCensus', currentValue);
};

function pickerChange(e){
	currentValue = {
		displayValue : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).value,
		questionList: $.pickerView.getSelectedRow(null).questionList,
	};
};

