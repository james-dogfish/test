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
	$.trigger("crossingSelected", crossingData[e.index]);
};

function setTableData(crossingData){
	
	var rowViewList = [];
	for (var i = 0; i < crossingData.length; i++) {
		rowViewList.push(Alloy.createController("searchWindow/masterSearchTableRow", crossingData[i]).getView());
	}
	$.tableView.setData(rowViewList);
};

function onSearchTextFieldChange(e){

};

function onSearchButtonClick(){
	$.searchTextField.blur();
	$.searchTextField.value; // this is the value of the searchTextField

	searchFromSearchButton();

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
		
		
		var sudsClient = Alloy.Globals.Soap.searchCrossingRequest({
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
			function() {
				alert('failure function');
				Alloy.Globals.aIndicator.hide();
				Alloy.Globals.Util.showAlert(L('no_results'));
			});

		Alloy.Globals.aIndicator.show("Downloading Crossings...",function(){
			sudsClient.abort();	
		});
};

exports.setData = function(shouldRefresh) {
	Alloy.Globals.Logger.log("masterSearchTab - setData","info");
	crossingData = Alloy.Globals.localDataHandler.loadCachedCrossingSearch();
	if ($.tableView.data.length === 0 && crossingData.length !== 0 && shouldRefresh == false) {
		Alloy.Globals.aIndicator.show("Loading...");
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
		
		var sudsClient = Alloy.Globals.Soap.searchCrossingRequest({
				crossingSearchCriteria: {
					'com:searchCriteria': {
						'ques:parameterName': 'CROSSING_SEARCH_ROUTE',
						'ques:parameterValue': Ti.App.Properties.getString('SelectedRoute')
					},
					'com:maxResults':maxCrossings
				},
				searchFunction: 'assess'
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
		Alloy.Globals.aIndicator.show("Downloading Crossings...",function(){
			sudsClient.abort();	
		});
	}
};


// Setting title of window 
var route = Ti.App.Properties.getString('SelectedRoute', '');
if(route !== '') {
	$.appTitle.text = "Crossing Search - " + route;
}