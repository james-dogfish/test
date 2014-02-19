var animationOpen = Titanium.UI.createAnimation();
animationOpen.left = "51%";
animationOpen.duration = Alloy.Globals.animationDuration;

var animationClose = Titanium.UI.createAnimation();
animationClose.left = "100%";
animationClose.duration = Alloy.Globals.animationDuration;

var openPickerContainer = Titanium.UI.createAnimation();
openPickerContainer.height = Ti.UI.SIZE;
//openPickerContainer.bottom = "20dp";
openPickerContainer.duration = Alloy.Globals.animationDuration;

var closePickerContainer = Titanium.UI.createAnimation();
closePickerContainer.height = 0;
//closePickerContainer.bottom = 0;
closePickerContainer.duration = Alloy.Globals.animationDuration;

var valueList = [];
var currentValue = 0;

exports.show = function(assessmentObject) {
	try {
		Alloy.Globals.aIndicator.show("Loading...");
		Alloy.Globals.Soap.searchCensus({
			crossingId : assessmentObject.crossingID
		}, function(xmlDoc) {
			//var XMLTools = require("tools/XMLTools");
			try {
				Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
					// callback
					var pastCensusObject = JSON.parse(data);
					if ( typeof pastCensusObject === "undefined") {
						alert(L("no_data"));
						Alloy.Globals.aIndicator.hide();
						return;
					} else {
						var pastCensuses = [];
						if ( typeof pastCensusObject.response.Envelope.Body.SearchCensusResponse === "undefined") {
							alert("Sorry there are no past censuses. Please create a new census and try again.");
							Alloy.Globals.aIndicator.hide();
							return;
						}
						if ( typeof pastCensusObject.response.Envelope.Body.SearchCensusResponse.census !== "undefined") {

							pastCensuses = pastCensusObject.response.Envelope.Body.SearchCensusResponse.census;
						}

						if ( pastCensuses instanceof Array) {

							if (pastCensuses.length === 0) {
								alert("Sorry there are no past censuses. Please create a new census and try again.");
								Alloy.Globals.aIndicator.hide();
								return;
							}

							for (var pastCensuesIndex = 0; pastCensuesIndex < pastCensuses.length; pastCensuesIndex++) {
								//alert(JSON.stringify(pastCensuses[pastCensuesIndex]));
								
								pastCensuses[pastCensuesIndex].censusData.push({
									parameterName: "I_CENSUS_DATE",
									parameterValue:Alloy.Globals.Util.convertDate(pastCensuses[pastCensuesIndex].censusDate).dateFormat2
								});
								
								valueList.push({
									displayValue : "Census " + Alloy.Globals.Util.convertDate(pastCensuses[pastCensuesIndex].censusDate).dateFormat3,
									value : pastCensuses[pastCensuesIndex].censusId,
									questionList : pastCensuses[pastCensuesIndex].censusData
								});

							}
						} else {
							Ti.API.error("pastCensuses ==>" + JSON.stringify(pastCensuses));
							
							pastCensuses.censusData.push({
								parameterName: "I_CENSUS_DATE",
								parameterValue:Alloy.Globals.Util.convertDate(pastCensuses.censusDate).dateFormat2
							});
							
							valueList.push({
								displayValue : "Census " + Alloy.Globals.Util.convertDate(pastCensuses.censusDate).dateFormat3,
								value : pastCensuses.censusId,
								questionList : pastCensuses.censusData
							});
						}	

						currentValue = valueList[0];
						var data = [];
						for (var i = 0; i < valueList.length; i++) {
							data.push(Ti.UI.createPickerRow({
								title : valueList[i].displayValue,
								value : valueList[i].value,
								questionList : valueList[i].questionList,
						
							}));
						}

						$.pickerView.add(data);
						$.pickerView.selectionIndicator = true;
						$.pickerView.setSelectedRow(0, 0, true);

						Alloy.Globals.aIndicator.hide();

						$.container.animate(animationOpen);
					}
				});
				//end of convertJSON
			} catch(e) {
				Alloy.Globals.aIndicator.hide();
			}
		});
	} catch(e) {
		Alloy.Globals.aIndicator.hide();
	}
};

var hide = function() {
	$.container.animate(animationClose);
};

exports.hide = function() {
	hide();
};

function doneButtonClick(e) {
	//alert("displayValue = "+currentValue.displayValue);
	$.trigger('addPastCensus', currentValue);
};

function pickerChange(e) {
	currentValue = {
		displayValue : $.pickerView.getSelectedRow(null).title,
		value : $.pickerView.getSelectedRow(null).value,
		questionList : $.pickerView.getSelectedRow(null).questionList,
	};
};

// Styling on ios6
if (!Alloy.Globals.Util.isIOS7Plus()) {
	$.doneButton.width = 65;
	$.doneButton.height = 30;
	$.doneButton.left = 10;
	$.doneButton.right = 10;
	$.doneButton.borderRadius = 6;
	$.doneButton.borderWidth = 1;
	$.doneButton.borderColor = '#151d21';
	$.doneButton.font = {
		fontSize : 15,
		fontWeight : 'bold',
		fontFamily : 'Helvetica Neue'
	};
	$.doneButton.color = '#fefefe';
	$.doneButton.backgroundGradient = {
		type : 'linear',
		startPoint : {
			x : '100%',
			y : '0%'
		},
		endPoint : {
			x : '100%',
			y : '100%'
		},
		colors : ['#0a526c', '#0d6790']
	};
	$.doneButton.backgroundColor = 'transparent';
	$.doneButton.backgroundImage = 'none';
}