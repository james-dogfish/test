
var detailsData = [];	
var User = require('core/User');
var Util = require('core/Util');

function backButtonClick(e) {
	$.trigger("BackButtonClick");
};

function onRowClick(e){
		$.trigger("assSelected",detailsData[e.index]);
};

exports.setData = function(crossingObject) {

	var assData=[];
	 Alloy.Globals.Soap.searchAssessment(
					{
						assessmentSearchCriteria:{
							'com:searchCriteria':{
								'ques:parameterName':'ASSESSMENT_SEARCH_CROSSING_NAME',
								'ques:parameterValue':crossingObject.name,
							},
						}
					},
					function(xmlDoc){
							
							var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                var crossingsObject = JSON.stringify(xml.toObject());
			                
			                var data = JSON.parse(crossingsObject);
			                //alert('searchAssessment Success response >> ' + JSON.stringify(data));
			                var results = data["soapenv:Body"]["ns7:SearchAssessmentResponse"]["ns7:assessment"];
			                
			                if(results != undefined){			                				           
				                for(var i=0; i<results.length; i++)
				                {
				                	assData.push({
				                		name: results[i]["ns6:name"],
				                		id:   results[i]["ns5:id"],
				                		date: results[i]["ns6:date"],
				                		detailId: results[i]["ns6:detailId"],
				                		crossingId: results[i]["ns6:crossingId"],
				                	});
				                }
			                }
			                
			            	var rowViewList = [];
							for(var i=0; i < assData.length; i++){
								rowViewList.push(Alloy.createController("searchWindow/detailSearchTableRow",assData[i]).getView());
							}
							detailsData = assData;
							$.tableViewDetails.setData(rowViewList);
							Alloy.Globals.aIndicator.hide();
					},
					function(xmlDoc){
						    var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                Alloy.Globals.aIndicator.hide();
			                alert('searchAssessment Error response >> ' + xml.toJSON());
					});
	
	
};