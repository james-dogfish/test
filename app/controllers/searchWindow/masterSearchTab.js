var crossingData;
//var Alloy.Globals.localDataHandler = require('Alloy.Globals.localDataHandler/Alloy.Globals.localDataHandler');				

function backButtonClick(e) {
	$.trigger("BackButtonClick");
}

function refreshButtonClick(e) {
	var data = [];
	$.tableView.setData(data);
	$.trigger("RefreshButtonClick");
}


function onRowClick(e) {
	$.trigger("crossingSelected", crossingData[e.index]);
};

exports.setData = function(shouldRefresh) {
	
	crossingData = Alloy.Globals.localDataHandler.loadCachedCrossingSearch();
	if (crossingData.length !== 0 && shouldRefresh == false) {
		Alloy.Globals.aIndicator.show("Loading...", 50000);
		$.tableView.setData([]);

		var data = [];
		//alert(JSON.stringify(results[0]));
		for (var i = 0; i < crossingData.length; i++) {
			//Ti.API.info(JSON.stringify(crossingData[i]));
			data.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
		}
		$.tableView.setData(data);
		Alloy.Globals.aIndicator.hide();
		return;
	} //CURRENTLY DISABLING CACHING AS NEEDS EXTRA WORK


	if ($.tableView.data.length === 0) {
		crossingData = [];
		Alloy.Globals.aIndicator.show("Downloading Crossings...", 50000);
		Alloy.Globals.Soap.searchCrossingRequest({
				searchCriteria: {
					'com:searchCriteria': {
						'ques:parameterName': 'CROSSING_SEARCH_AREA_NAME',
						'ques:parameterValue': Ti.App.Properties.getString('SelectedRoute')
					},
					//'com:maxResults':999999
				},	
				sortByELR: true,
				includeDeleted: false
			},
			function(xmlDoc) {

				// Now convert the JSON
				var convertedJson = Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
					function(data) {
						// callback
						//alert(data);
						// var crossingsObject = JSON.stringify(data);
						var data = JSON.parse(data);

						// Check whether JSON structure exits before attempting to grab results
						if (Alloy.Globals.Util.checkNested(data, 'response', 'Envelope', 'Body', 'AdvancedSearchResponse', 'searchResults')) {
							var results = data.response.Envelope.Body.AdvancedSearchResponse.searchResults;

							for (var i = 0; i < results.length; i++) {

								var type = "";
								var crossingDetailsSearchResult;

								if (Alloy.Globals.Util.checkNested(results[i], 'crossingDetailsSearchResult')) {
									crossingDetailsSearchResult = results[i]["crossingDetailsSearchResult"];
									if (crossingDetailsSearchResult instanceof Array) {
										var type = "N/A";
										if (Alloy.Globals.Util.checkNested(crossingDetailsSearchResult[0], 'type')) {
											type = crossingDetailsSearchResult[0]["type"];
										}
									} else {
										////Ti.API.info("type object ="+ JSON.stringify(crossingDetailsSearchResult));
										var type = "N/A";
										if (Alloy.Globals.Util.checkNested(crossingDetailsSearchResult, 'type')) {
											type = crossingDetailsSearchResult["type"];
										}
									}

									//alert("stop");
									crossingData.push({
										name: results[i]["name"],
										id: results[i]["id"],
										type: type
									});
								} else {
									continue; //SKIP IT.
								}
							}
						} else {
							Alloy.Globals.aIndicator.hide();
							//var Alloy.Globals.Util = require('core/Alloy.Globals.Util');
							Alloy.Globals.Util.showAlert(L('no_results'));
						}

						var data = [];
						//alert(JSON.stringify(results[0]));
						for (var i = 0; i < crossingData.length; i++) {
							data.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
						}
						Alloy.Globals.localDataHandler.cacheCrossingSearch(crossingData);
						$.tableView.setData(data);
						Alloy.Globals.aIndicator.hide();

					});

			},
			function(xmlDoc) {});
	}
};

/*
var listViewData = [];
//var crossingData = [];
//var Alloy.Globals.localDataHandler = require('Alloy.Globals.localDataHandler/Alloy.Globals.localDataHandler');		

function backButtonClick(e) {
	$.trigger("BackButtonClick");
}

function refreshButtonClick(e) {
	listViewData = [];
	$.listSection.setItems(listViewData);
	setData(true);
	//listViewData = null;
}


function onRowClick(e){
	Ti.API.info("crossingSelected index = "+e.itemIndex);
	$.trigger("crossingSelected",listViewData[e.itemIndex]);
};

var setData = function(shouldRefresh) {
	var savedListViewData = Alloy.Globals.localDataHandler.loadCachedCrossingSearch();
	if(savedListViewData.length !== 0 && shouldRefresh == false)
	{
		Alloy.Globals.aIndicator.show("Loading...",50000);
		listViewData = savedListViewData;
		$.listSection.setItems(listViewData);
		//listViewData = null;

		
		Alloy.Globals.aIndicator.hide();
		return;
	} //CURRENTLY DISABLING CACHING AS NEEDS EXTRA WORK
	
	
	if(listViewData.length === 0){ 
		Alloy.Globals.aIndicator.show("Loading...");
		 listViewData = [];
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
			                	//var Alloy.Globals.Util = require('core/Alloy.Globals.Util');
								Alloy.Globals.Util.showAlert(L('no_results'));
								
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
				                	
				                	//alert("stop");
			
				                	listViewData.push({
				                		template : "crossingRow",
				                		crossingName : {text : "Crossing Name - " + results[i]["ns6:name"]},
				                		crossingElr : {text : "Crossing ID - "+results[i]["ns5:id"]},
				                		crossingType : {text : "Crossing Type - "+ type},
				                		id:   results[i]["ns5:id"],
				                		name: results[i]["ns6:name"],
				                		searchableText : results[i]["ns6:name"],
				                	});
				                	//crossingDetailsSearchResult = null;
				                	//type = null;
				                }
								//Ti.API.info("listViewData.length = "+listViewData.length);
								Alloy.Globals.localDataHandler.cacheCrossingSearch(listViewData);
								$.listSection.setItems(listViewData);
								Alloy.Globals.aIndicator.hide();
							}
					},
					function(xmlDoc){});
	}
	
};
exports.setData = setData;

*/