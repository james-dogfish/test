
var crossingData = [];
//var localDataHandler = require('localDataHandler/localDataHandler');				

function backButtonClick(e) {
	$.trigger("BackButtonClick");
}

function refreshButtonClick(e) {
	var data = [];
	$.tableView.setData(data);
	$.trigger("RefreshButtonClick");
}


function onRowClick(e){
	$.trigger("crossingSelected",crossingData[e.index]);
};

exports.setData = function(shouldRefresh) {
	var loggedInUser = User.getLogin();
	crossingData = localDataHandler.loadCachedCrossingSearch();
	if(crossingData.length !== 0 && shouldRefresh == false)
	{
		Alloy.Globals.aIndicator.show("Loading...",50000);
		$.tableView.setData([]);

		var data = [];
				                //alert(JSON.stringify(results[0]));
		for(var i=0; i < crossingData.length; i++){
			//Ti.API.info(JSON.stringify(crossingData[i]));
			data.push(Alloy.createController("searchWindow/masterSearchTableRow",crossingData[i]).getView());
		}
		$.tableView.setData(data);
		data = null;
		Alloy.Globals.aIndicator.hide();
		return;
	} //CURRENTLY DISABLING CACHING AS NEEDS EXTRA WORK
	
	
	if($.tableView.data.length === 0){ 
		Alloy.Globals.aIndicator.show("Loading...");
		 crossingData = [];
				 Alloy.Globals.Soap.searchCrossingRequest(
					{
						searchCriteria:{
							'com:searchCriteria':{
								'ques:parameterName':'CROSSING_SEARCH_AREA_NAME',
								'ques:parameterValue':Ti.App.Properties.getString('SelectedRoute'),
							},
						},
						sortByELR:true,
						includeDeleted:false
					},
					function(xmlDoc){
							//var XMLTools = require("tools/XMLTools");
			                XMLTools.setDoc(xmlDoc);
			                var crossingsObject = JSON.stringify(XMLTools.toObject());
			                
			                var data = JSON.parse(crossingsObject);
			                var results = data["soapenv:Body"]["ns9:AdvancedSearchResponse"]["ns9:searchResults"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	Alloy.Globals.aIndicator.hide();
			                	//var Util = require('core/Util');
								Util.showAlert(L('no_results'));
								
			                }else{
				                for(var i=0; i<results.length; i++)
				                {
				                	////Ti.API.info("crossingObject" +JSON.stringify(results[i]["ns6:crossingDetailsSearchResult"]));
				                	
									//Ti.API.info(JSON.stringify(results[i]["ns6:crossingDetailsSearchResult"]));
									var crossingDetailsSearchResult = results[i]["ns6:crossingDetailsSearchResult"];
									var type = "";
				                	if (typeof crossingDetailsSearchResult === "undefined") {
				                		continue; //SKIP IT.
				                		//type = "undefined";
				                		//Alloy.Globals.aIndicator.hide();
				                		//return;
				                	}
				                	if(crossingDetailsSearchResult instanceof Array){
				                		////Ti.API.info("type Array ="+ JSON.stringify(crossingDetailsSearchResult[0]));
				                		var type = "N/A";
				                		if(typeof crossingDetailsSearchResult[0]["ns6:type"] !=="undefined")
				                		{
				                			type = crossingDetailsSearchResult[0]["ns6:type"];
				                		}
				                		
				                	}
				                	else{
				                		////Ti.API.info("type object ="+ JSON.stringify(crossingDetailsSearchResult));
				                		var type = "N/A";
				                		if(typeof crossingDetailsSearchResult !=="undefined")
				                		{
				                			type = crossingDetailsSearchResult["ns6:type"];
				                		}
				                	}
				                	
				                	crossingDetailsSearchResult = null;
				                	
				                	//alert("stop");
				                	crossingData.push({
				                		name: results[i]["ns6:name"],
				                		id:   results[i]["ns5:id"],
				                		type : type
				                	});
				                	
				                }
				               
				                var data = [];
				                //alert(JSON.stringify(results[0]));
				                for(var i=0; i < crossingData.length; i++){
									data.push(Alloy.createController("searchWindow/masterSearchTableRow",crossingData[i]).getView());
								}
								localDataHandler.cacheCrossingSearch(crossingData);
								$.tableView.setData(data);
								data = null;
								Alloy.Globals.aIndicator.hide();
							}
					},
					function(xmlDoc){});
	}
};