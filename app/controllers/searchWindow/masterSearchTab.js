var crossingData = [];

function backButtonClick(e) {
	$.trigger("BackButtonClick");
}

function refreshButtonClick(e) {
	Alloy.Globals.Logger.log("refreshButtonClick","info");
	var data = [];
	$.tableView.setData(data);
	$.trigger("RefreshButtonClick");
}


function onRowClick(e) {
	Alloy.Globals.Logger.log("Tapped on a crossing","info");
	//alert(JSON.stringify(e));
	$.trigger("crossingSelected", crossingData[e.index]);
};

function setTableData(crossingData){
	
	//this is the form, the crossingData should be in
	//crossingData = [
	//	{name:"Garston", id:"439", type:"UWCT"},
	//	{name:"The Oaks", id:"8660", type:"UWCT"}
	//];
	
	var rowViewList = [];
	for (var i = 0; i < crossingData.length; i++) {
		rowViewList.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
	}
	$.tableView.setData(rowViewList);
};

function onSearchTextFieldChange(e){
	//$.tableView.
}

function onSearchButtonClick(){
	$.searchTextField.blur();
	$.searchTextField.value; // this is the value of the searchTextField
	if($.searchTextField.value.trim()!="")
	{
		searchFromSearchButton();
	}
};

function searchFromSearchButton()
{
	var maxCrossings = null;
		if(typeof Ti.App.Properties.getString('maxCrossings') !== "undefined" &&  Ti.App.Properties.getString('maxCrossings') != null && Ti.App.Properties.getString('maxCrossings') !="" && Number(Ti.App.Properties.getString('maxCrossings')) > 0)
		{
			maxCrossings = Number(Ti.App.Properties.getString('maxCrossings'));
			alert(maxCrossings);
		}else{
			Alloy.Globals.Logger.log("Error reading Ti.App.Properties.getString('maxCrossigs'). Defaulted to 1500", "error");
			maxCrossings = 1500;
		}
		
		Alloy.Globals.aIndicator.show("Downloading Crossings...", 50000);
		Alloy.Globals.Soap.searchCrossingRequest({
				crossingSearchCriteria: {
					'com:searchCriteria': {
						'ques:parameterName': 'CROSSING_SEARCH_CROSSING_NAME',
						'ques:parameterValue': $.searchTextField.value
					},
					'com:searchCriteria_2': {
						'ques:parameterName': 'CROSSING_SEARCH_ROUTE',
						'ques:parameterValue': Ti.App.Properties.getString("SelectedRoute")
					},
					'com:maxResults':maxCrossings,
				},
				searchFunction: 'assess'
				//sortByELR: true,
				//includeDeleted: false
			},
			function(xmlDoc) {

				// Now convert the JSON
				var convertedJson = Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
					function(data) {
						// callback
						Alloy.Globals.Logger.log("in crossingsSearch Callback","info");
						var data = JSON.parse(data);
						
						
						// Check whether JSON structure exits before attempting to grab results
						if (Alloy.Globals.Util.checkNested(data, 'response', 'Envelope', 'Body', 'SearchCrossingResponse', 'searchResults')) {
							var results = data.response.Envelope.Body.SearchCrossingResponse.searchResults;
							Alloy.Globals.Logger.log("got crossing results ...","info");
							for (var i = 0; i < results.length; i++) {

								var type = "";
								var crossingDetailsSearchResult;

								if (Alloy.Globals.Util.checkNested(results[i], 'crossingBasicSearchResult')) {
									crossingDetailsSearchResult = results[i]["crossingBasicSearchResult"];
									type =  results[i]["type"];
									crossingData.push({
										name: crossingDetailsSearchResult["name"],
										id: crossingDetailsSearchResult["id"],
										type: type
									});
								} else {
									continue; //SKIP IT.
								}
							}
						} else {
							Alloy.Globals.aIndicator.hide();
							Alloy.Globals.Util.showAlert(L('no_results'));
						}

						var data = [];
						for (var i = 0; i < crossingData.length; i++) {
							data.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
						}
						Alloy.Globals.localDataHandler.cacheCrossingSearch(crossingData);
						$.tableView.setData(data);
						Alloy.Globals.aIndicator.hide();

					});

			},
			function(xmlDoc) {});
};

exports.setData = function(shouldRefresh) {
	Alloy.Globals.Logger.log("masterSearchTab - setData","info");
	crossingData = Alloy.Globals.localDataHandler.loadCachedCrossingSearch();
	if (crossingData.length !== 0 && shouldRefresh == false) {
		Alloy.Globals.aIndicator.show("Loading...", 50000);
		$.tableView.setData([]);

		var data = [];
		for (var i = 0; i < crossingData.length; i++) {
			data.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
		}
		$.tableView.setData(data);
		Alloy.Globals.aIndicator.hide();
		return;
	} //CURRENTLY DISABLING CACHING AS NEEDS EXTRA WORK


	if ($.tableView.data.length === 0) {
		crossingData = [];
		var maxCrossings = null;
		if(typeof Ti.App.Properties.getString('maxCrossings') !== "undefined" &&  Ti.App.Properties.getString('maxCrossings') != null && Ti.App.Properties.getString('maxCrossings') !="" && Number(Ti.App.Properties.getString('maxCrossings')) > 0)
		{
			maxCrossings = Number(Ti.App.Properties.getString('maxCrossings'));
			//alert(maxCrossings);
		}else{
			Alloy.Globals.Logger.log("Error reading Ti.App.Properties.getString('maxCrossigs'). Defaulted to 1500", "error");
			maxCrossings = 1500;
		}
		
		Alloy.Globals.aIndicator.show("Downloading Crossings...", 50000);
		Alloy.Globals.Soap.advSearchCrossingRequest({
				searchCriteria: {
					'com:searchCriteria': {
						'ques:parameterName': 'CROSSING_SEARCH_AREA_NAME',
						'ques:parameterValue': Ti.App.Properties.getString('SelectedRoute')
					},
					'com:maxResults':maxCrossings
				},	
				sortByELR: true,
				includeDeleted: false
			},
			function(xmlDoc) {

				// Now convert the JSON
				var convertedJson = Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
					function(data) {
						// callback
						Alloy.Globals.Logger.log("in crossingsSearch Callback","info");
						var data = JSON.parse(data);

						// Check whether JSON structure exits before attempting to grab results
						if (Alloy.Globals.Util.checkNested(data, 'response', 'Envelope', 'Body', 'AdvancedSearchResponse', 'searchResults')) {
							var results = data.response.Envelope.Body.AdvancedSearchResponse.searchResults;
							Alloy.Globals.Logger.log("got crossing results ...","info");
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
										////Alloy.Globals.Logger.log("type object ="+ JSON.stringify(crossingDetailsSearchResult), "info");
										var type = "N/A";
										if (Alloy.Globals.Util.checkNested(crossingDetailsSearchResult, 'type')) {
											type = crossingDetailsSearchResult["type"];
										}
									}
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
							Alloy.Globals.Util.showAlert(L('no_results'));
						}

						var data = [];
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