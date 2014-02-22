// Response Generator
// ----------------
// deals with sending data to alcrm API.

function responseGenerator() {
	var self = this;
	var noneToSubmit = 0;

/**
 * `testIfAssessmentIsComplete` - Here we pass in a questionList and we return true/false
 * depending on weather the assessment is fully done or not.
 * 
 * @method testIfAssessmentIsComplete
 * 
 * @param {Object} questionList
 * 
 * @return {Boolean} true/false if assessment is complete or not
 */
	var testIfAssessmentIsComplete = function(questionList) {
		var mandatoryQuestionCount = 0;
		for (var i = 0; i < questionList.length; i++) {
			var isMandatory = Alloy.Globals.localParser.getQuestionMandatory(questionList[i]);
			if (isMandatory == true) {

				if (Alloy.Globals.localParser.getUserResponse(questionList[i]) == null) {
					return false;
				}
			}
		}
		return true;
	};

	self.formatDate = function(datum) {
		var date = new Date(datum);
		return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
	};

/**
 * `BuildCensusRespose` is responsible for the creation of xml markup required in order to
 * send to ICON's webservice. We pass in an assessment object which is the asssessment
 * that we want to work with, censusList which is a list of census questions,
 * crossingID (the selected/current crossing). detailID is not being used.
 * tempFix - this is a dirty fix to fix broken census xml request
 * 
 * @method BuildCensusRespose
 * 
 * 
 * @param {Object} assObj
 * @param {Object} censusList
 * @param {Object} crossingID
 * @param {Object} detailID
 * 
 * @return {String} xmlRequest - the xmlRequest payload string.
 */
	self.buildCensusResponse = function(assObj, censusList, crossingID, detailID) {
		//alert("buildCensusResponse invoked");

		//alert("censusList = "+JSON.stringify(censusList));
		Ti.API.info("==============censusList = "+JSON.stringify(censusList));
		try {
			var xmlRequest = [];
			for (var censusListIndex = 0; censusListIndex < censusList.length; censusListIndex++) {
				var censusData = "";
				var censusDate = "";
				var sectionList = censusList[censusListIndex];
				for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
					var questionList = sectionList[sectionListIndex].questionList;
					for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {

						if (questionList[questionIndex].isAQuestion == false)
							continue;

						var questionResponse = questionList[questionIndex].questionResponse;

						var questionType = questionList[questionIndex].type;

						if (questionList[questionIndex].isAQuestion == true && censusDate === "") {
							if (questionList[questionIndex].alcrmQuestionID == "I_CENSUS_DATE" || questionList[questionIndex].alcrmQuestionID == "CENSUS_DATE") {
								if(questionList[questionIndex].value instanceof Array){
									censusDate = questionList[questionIndex].value[0];
								}else if(questionList[questionIndex].value.trim() != ""){
									censusDate = questionList[questionIndex].value;
								}else{
									Alloy.Globals.aIndicator.hide();
									//Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentNotCompleted'),"assessmentNotCompleted");
									return;
								}
								Ti.API.info("censusDate = "+censusDate);
								if (censusDate.length === 1) {
									censusDate = null;
								}
								continue;
							}
						}

						Ti.API.info("questionResponse = "+JSON.stringify(questionResponse));
						var tempFix = JSON.stringify(questionResponse);
						tempFix = tempFix.replace("<ass1:riskData>", "").replace("</ass1:riskData>", "").replace(/[0-9]I_/g, 'I_');
						questionResponse = JSON.parse(tempFix);
						
						Ti.API.info("questionResponse = "+JSON.stringify(questionResponse));
						if (questionResponse != null && questionResponse.search("ass1") === -1 && questionResponse.search("tra1") === -1) {
							if (questionType === "multiSelect") {
								censusData = censusData + '<cen1:censusData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</cen1:censusData>';
							} else if (questionType === "numeric") {
								censusData = censusData + "<cen1:censusData>" + questionResponse + "</cen1:censusData>";
							} else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
								censusData = censusData + '<cen1:censusData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</cen1:censusData>';
							} else {
								censusData = censusData + "<cen1:censusData>" + questionResponse + "</cen1:censusData>";
							}

						}
					}
				}
				Ti.API.info(censusDate);
				var numbers = "";
				var dateToPost = "";
				//alert("censusDate = "+JSON.stringify(censusDate));
				if (censusDate !== null && censusDate.trim() !== "") {

					numbers = censusDate.match(/\d+/g);
					if (numbers != null) {
						dateToPost = new Date(numbers[2], numbers[0] - 1, numbers[1]);
					}

					xmlRequest.push("<cen:CreateCensusRequest>" + "<cen:census>" + "<cen1:crossingId>" + crossingID + "</cen1:crossingId>" + "<cen1:censusDate>" + dateToPost.toISOString() + "</cen1:censusDate>" + censusData + "</cen:census>" + "</cen:CreateCensusRequest>");

				}
			}
			//alert("xmlRequest = "+JSON.stringify(xmlRequest));
			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Ti.API.error("ERROR in buildCensus Response. Error Details: " + JSON.stringify(e));

		}
	};

/**
 * `buildTrainInfoGroupResponse` is responsible for the creation of xml markup required in order to 
 * send to ICON's webservice. We pass in, trainList which is a list of train questions, crossingID 
 * (the selected/current crossing). detailID is not being used.
 * 
 * @method buildTrainInfoGroupResponse
 * 
 * @param {Object} trainList
 * @param {Object} crossingID
 * @param {Object} detailID
 * 
 * @return {String} xmlRequest - the xmlRequest payload string.
 */
	self.buildTrainInfoGroupResponse = function(trainList, crossingID, detailID, assObj) {
		try {
			var xmlRequest = [];
			
			
			for (var trainListIndex = 0; trainListIndex < trainList.length; trainListIndex++) {
				var sectionList = trainList[trainListIndex];
				var trainData = "";

				var questionAnswered = false;
				var questionUnAnswered = false;
				
				for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
					
					var questionList = sectionList[sectionListIndex].questionList;
					for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
						var questionResponse = questionList[questionIndex].questionResponse;
						//alert("questionResponse "+trainListIndex+" = "+JSON.stringify(questionResponse));
						var questionType = questionList[questionIndex].type;
						if (questionResponse != null) {
							questionAnswered = true;
							if (questionType === "multiSelect") {
								trainData = trainData + '<tra1:detailedData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</tra1:detailedData>';
							} else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
								trainData = trainData + '<tra1:detailedData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</tra1:detailedData>';
							} else {
								trainData = trainData + "<tra1:detailedData>" + questionResponse + "</tra1:detailedData>";
							}
						}else{
							questionUnAnswered = true;
							trainData = "";
						}
			
						
					}
					
					if(trainListIndex == 0 && questionUnAnswered == true){
						Alloy.Globals.aIndicator.hide();
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('trainInfoIncomplete1') + (trainListIndex+1));
						return;
					}
					
					if(questionAnswered == true && questionUnAnswered == true){
						Alloy.Globals.aIndicator.hide();
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('trainInfoIncomplete1') + (trainListIndex+1));
						return;
					}
					
					
				}
				//alert("trainData Contents = "+JSON.stringify(trainData));
				if(trainData !== "")
				{
					xmlRequest.push("<tra:CreateTrainGroupRequest>" + "<tra:trainGroupData>" + "<tra1:crossingId>" + crossingID + "</tra1:crossingId>" + "<tra1:date>" + new Date().toISOString() + "</tra1:date>" + trainData + "</tra:trainGroupData>" + "</tra:CreateTrainGroupRequest>");
				}
			}

			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Ti.API.error("ERROR in buildTrainInfoGroupResponse. Error Details: " + JSON.stringify(e));
		}
	};

/**
 * `findQuestionByParam` is used as a getter to grab a specific question's value
 * pass in the sectionList that we want to search
 * pass in the paramName which is unique in the sectionList
 * return the question value (if found).
 * 
 * @method findQuestionByParam
 * 
 * @param {Object} sectionList
 * @param {Object} paramName
 * 
 * @return {String} the found question's value.
 */
	self.findQuestionByParam = function(sectionList, paramName) {
		for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
			var questionList = sectionList[sectionListIndex].questionList;

			for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
				var questionResponse = questionList[questionIndex].questionResponse;

				var questionType = questionList[questionIndex].type;

				if (questionList[questionIndex].alcrmQuestionID == paramName) {
					return questionList[questionIndex].value;
				}
			}
		}
	};

/**
 * `buildAssessmentResponse` is responsible for the creation of xml markup required in order to
 * send to ICON's webservice. We pass in a sectionlist containing all the data,
 * crossingID (the selected/current crossing). detailID is not being used. assNotes contains
 * any assessment notes.
 * 
 * we need to post crossingID plus a space plus assessment date plus a space plus assessment title
 * this is what we the if block at line 233 does.
 * 
 * @method buildAssessmentResponse
 * 
 * @param {Object} sectionList
 * @param {Object} crossingID
 * @param {Object} detailID
 * @param {Object} assNotes
 * 
 * @return {String} xmlRequest - the xmlRequest payload string.
 */
	self.buildAssessmentResponse = function(sectionList, crossingID, detailID, assNotes) {
		try {
			var riskData = "";
			var titleFixed = false;
			var assessmentDate = null;
			for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
				var questionList = sectionList[sectionListIndex].questionList;
				for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
					var questionResponse = questionList[questionIndex].questionResponse;

					var questionType = questionList[questionIndex].type;

					if (questionList[questionIndex].alcrmQuestionID == "I_ASSESSMENT_TITLE" && titleFixed == false) {
						var assDate = self.findQuestionByParam(sectionList, "LAST_ASSESSMENT_DATE");
						//alert("assDate ="+assDate);
						questionList[questionIndex].questionResponse = "<ques:parameterName>I_ASSESSMENT_TITLE</ques:parameterName>" + "<ques:parameterValue>" + crossingID + " " + assDate + " " + questionList[questionIndex].value + "</ques:parameterValue>";
						questionResponse = questionList[questionIndex].questionResponse;
						assessmentDate = assDate;
						titleFixed = true;
					}

					if (questionResponse != null) {
						if (questionType === "multiSelect") {
							riskData = riskData + '<ass1:riskData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</ass1:riskData>';
						} else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
							riskData = riskData + '<ass1:riskData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</ass1:riskData>';
						} else {
							riskData = riskData + "<ass1:riskData>" + questionResponse + "</ass1:riskData>";
						}
					}
					if(questionList[questionIndex].alcrmQuestionID == "LAST_ASSESSMENT_DATE")
					{
						//alert("here: "+questionList[questionIndex].questionResponse);
					}
					
				} 
			}
			//var date = new Date();
			var trainIDs = Alloy.Globals.trainIDs;
			var censusIDs = Alloy.Globals.censusIDs;
			var censusDates = Alloy.Globals.censusDates;

			var trainIDSXml = "";
			var censusIDSXml = "";
			var censusDatesXml = "";

			if (trainIDs.length > 0) {
				for (var i = 0; i < trainIDs.length; i++) {
					trainIDSXml += "<ass1:trainIds>" + trainIDs[i] + "</ass1:trainIds>";
				}
			}

			if (censusIDs.length > 0) {
				for (var i = 0; i < censusIDs.length; i++) {
					censusIDSXml += "<ass1:censusId>" + censusIDs[i] + "</ass1:censusId>";
				}
			}

			if (censusDates.length > 0) {
				for (var i = 0; i < censusDates.length; i++) {
					censusDatesXml += "<ass1:censusDate>" + Alloy.Globals.Util.convertDate(censusDates[i]).dateFormat2 + "</ass1:censusDate>";
				}
			}
			
			//alert("riskData = "+riskData);

			var xmlRequest = "<ass:CreateAssessmentRequest><ass:assessment><ass1:crossingID>" + crossingID + "</ass1:crossingID>" + censusIDSXml + trainIDSXml + censusDatesXml + riskData + "</ass:assessment></ass:CreateAssessmentRequest>";

			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("EXCEPTION IN buildAssessmentResponse. Error Details: " + JSON.stringify(e), "info");
		}
	};

/**
 * `commitWithOnlyCensus` - we take an xmlCensusRequest array containing all the xml we need to post to web service
 * assObj is the current assessment object that we want to commit
 * sectionListAss contains section data.
 * 
 * @method commitWithOnlyCensus
 * 
 * @param {Object} xmlCensusRequest
 * @param {Object} assObj
 * @param {Object} sectionListAss
 */
	self.commitWithOnlyCensus = function(xmlCensusRequest, assObj, sectionListAss) {
		
		try {
			
			Alloy.Globals.Logger.log("assObj.censusDesktopComplete == " + assObj.censusDesktopComplete, "info");
			if (assObj.censusDesktopComplete == false) {
				var callFired = false;
				for (var i = 0; i < xmlCensusRequest.length; i++) {
					Alloy.Globals.Soap.createCensus(xmlCensusRequest[i], function(xmlDoc) {

						Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
							var data = JSON.parse(data);
							var censusId = data.response.Envelope.Body.CreateCensusResponse.census.censusId;
							var censusDate = data.response.Envelope.Body.CreateCensusResponse.census.censusDate;

							Alloy.Globals.censusIDs.push(censusId);

							Alloy.Globals.censusDates.push(censusDate);

							Alloy.Globals.Logger.log("Census - Alloy.Globals.censusIDs.length === xmlCensusRequest.length >> " + Alloy.Globals.censusDates.length, "info");
							if(callFired == false){
								self.doAssessment(assObj, sectionListAss);
								callFired = true;
							}
							

						});

					}, function(xmlDoc) {
						Alloy.Globas.aIndicator.hide();
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentNotCompleted'),"assessmentNotCompleted");

					});
					
				}

			} else {
				if (assObj.censusDesktopComplete == true) {
					self.doAssessment(assObj, sectionListAss);
				}
			}
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("EXCEPTION IN commitWithOnlyCensus. Error Details: " + JSON.stringify(e), "info");
		}
	};

/**
 * `commitWithOnlyTrain` - we take an xmlTrainRequest array containing all the xml we need to post to web service
 * assObj is the current assessment object that we want to commit
 * sectionListAss contains section data. We then invoke the function to create a tran group request (SOAP) and
 * upon success we call the doAssessment function will deal with the commit of an assessment.
 * 
 * @method commitWithOnlyTrain
 * 
 * @param {Object} xmlTrainRequest
 * @param {Object} assObj
 * @param {Object} sectionListAss
 */
	self.commitWithOnlyTrain = function(xmlTrainRequest, assObj, sectionListAss) {
		try {
			var callFired=false;
			for (var i = 0; i < xmlTrainRequest.length; i++) {
				Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

					Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
						var data = JSON.parse(data);
						var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
						Alloy.Globals.Logger.log("trainId=" + trainId, "info");
						Alloy.Globals.trainIDs.push(trainId);

						Alloy.Globals.Logger.log("Trains - Alloy.Globals.trainIDs.length === 3 >> " + Alloy.Globals.trainIDs.length, "info");

						if (Alloy.Globals.trainIDs.length >= 1 && callFired===false) {

							self.doAssessment(assObj, sectionListAss);
							callFired=true;
						}

					});
				}, function(xmlDoc) {
					Alloy.Globals.aIndicator.hide();
					//Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentNotCompleted'));
				});
			}
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("EXCEPTION IN commitWithOnlyTrain. Error Details: " + JSON.stringify(e), "info");
		}
	};

/**
 * `commitWithTrainAndCensus` - we take an xmlTrainRequest & an xmlCensusRequest array containing all the xml
 * we need to post to web service
 * assObj is the current assessment object that we want to commit
 * sectionListAss contains section data. We then invoke the function to create a census request (SOAP) and
 * upon success we invoke the function to create a train group request. Finally upon success of the latter
 * we call the doAssessment function which will deal with the commit of an assessment.

 * NOTE: if an assessment has been marked to be completed via ALCRM Destop, we call the doAssessment function
 *      straight away.
 * 
 * @method commitWithTrainAndCensus
 * 
 * @param {Object} xmlCensusRequest
 * @param {Object} xmlTrainRequest
 * @param {Object} assObj
 * @param {Object} sectionListAss
 */
	self.commitWithTrainAndCensus = function(xmlCensusRequest, xmlTrainRequest, assObj, sectionListAss) {
		Alloy.Globals.Logger.log("assObj.censusDesktopComplete == " + assObj.censusDesktopComplete, "info");
		try {
			//alert("xmlCensusRequest = "+xmlCensusRequest.length);
			//BIT OF SANITY CHECK HERE!!
			if(xmlCensusRequest.length === 0)
				{
					if (assObj.censusDesktopComplete == false) {
						Alloy.Globals.aIndicator.hide();
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj,false,L('noCensusMessage'),"noCensusMessage");
						return;
					}
				}
			if (assObj.censusDesktopComplete == false) {
				var callFired = false;
				for (var i = 0; i < xmlCensusRequest.length; i++) {
					Alloy.Globals.Soap.createCensus(xmlCensusRequest[i], function(xmlDoc) {
						

						Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
							var data = JSON.parse(data);
							var censusId = data.response.Envelope.Body.CreateCensusResponse.census.censusId;
							var censusDate = data.response.Envelope.Body.CreateCensusResponse.census.censusDate;

							Alloy.Globals.censusIDs.push(censusId);

							Alloy.Globals.censusDates.push(censusDate);
					
							//alert("xmlTrainRequest = "+xmlTrainRequest.length);
							for (var i = 0; i < xmlTrainRequest.length; i++) {
								Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

									Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
										var data = JSON.parse(data);
										var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
										Alloy.Globals.Logger.log("trainId=" + trainId, "info");
										Alloy.Globals.trainIDs.push(trainId);

										Alloy.Globals.Logger.log("Trains - Alloy.Globals.trainIDs.length === 3 >> " + Alloy.Globals.trainIDs.length, "info");
										Alloy.Globals.Logger.log("Census - Alloy.Globals.censusIDs.length === xmlCensusRequest.length >> " + Alloy.Globals.censusDates.length, "info");
										if (Alloy.Globals.trainIDs.length >=1 && callFired === false) {
											self.doAssessment(assObj, sectionListAss);
											callFired = true;
										}

									});
								}, function(xmlDoc) {
									Alloy.Globals.aIndicator.hide();
									//Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentNotCompleted'));
								});

							}

						});
					}, function(xmlDoc) {
						Alloy.Globals.aIndicator.hide();
						//Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentNotCompleted'));
					});
				}
			} /*else {

				self.doAssessment(assObj, sectionListAss);
			}*/
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("EXCEPTION IN commitWithTrainAndCensus. Error Details: " + JSON.stringify(e), "info");
		}
	};

/**
 * `submitAss` - we take an assessment object and create the different sections we need to call the functions above.
 * we do this IFF an assessment has not been previously submitted.
 * This function the calls all the other functions to build the XML payloads.
 * 
 * @method submitAss
 * 
 * @param {Object} assObj
 */
	self.submitAss = function(assObj) {
		Alloy.Globals.theAssObj = assObj;
		try {
			if (!(Alloy.Globals.isDebugOn) && assObj.questionsCompleted < assObj.questionCount) {

				Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj,false,L('assessmentNotCompleted'),"assessmentNotCompleted");
				return;
				//noneToSubmit++;
				//Alloy.Globals.Logger.log("noneToSubmit = " + noneToSubmit, "info");

			} else {
				if (assObj.isSubmitted === false) {
					Alloy.Globals.aIndicator.show("Committing...");
					var sectionListAss = Alloy.Globals.localDataHandler.getMainRiskAssessmentQuestions(assObj);
					var sectionListCen = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 0);
					var sectionListTra = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 1);
					//xmlCensusRequest = null;
					var xmlCensusRequest = self.buildCensusResponse(assObj, sectionListCen, assObj.crossingID, assObj.detailID);
					//alert("sectionListTra = "+JSON.stringify(sectionListTra));
					var xmlTrainRequest = self.buildTrainInfoGroupResponse(sectionListTra, assObj.crossingID, assObj.detailID, assObj);
					//alert("xmlTrainRequest = "+JSON.stringify(xmlTrainRequest));
					
					/*if ( typeof sectionListCen === "undefined" || sectionListCen.length === 0 || sectionListCen == null) {
						if (assObj.censusDesktopComplete == false) {
							alert("here-1");
							Alloy.Globals.Logger.log("assObj.censusDesktopComplete = " + assObj.censusDesktopComplete, "info");
							Alloy.Globals.aIndicator.hide();
							
							Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj,false,L('noCensusMessage'),"noCensusMessage");
							
							return;
						}
						alert("here-2");
						
					} */
					
					if (sectionListCen.length > 0 && sectionListTra.length > 0) {
						alert("here0");
						if (assObj.censusDesktopComplete == true) {
							alert("here00");
							self.commitWithOnlyTrain(xmlTrainRequest, assObj, sectionListAss);
						}else{
							alert("here01");
							self.commitWithTrainAndCensus(xmlCensusRequest, xmlTrainRequest, assObj, sectionListAss);
						}
					} else if (sectionListCen.length > 0 && sectionListTra.length <= 0) {
						alert("here1");
						self.commitWithOnlyCensus(xmlCensusRequest, assObj, sectionListAss);
					} else if (assObj.censusDesktopComplete == true && sectionListTra.length > 0 ) {
						alert("here2");

						//if (assObj.censusDesktopComplete == true) {
							//alert("here2.1");
							Alloy.Globals.Logger.log("======================assObj.censusDesktopComplete = true", "info");
							self.commitWithOnlyTrain(xmlTrainRequest, assObj, sectionListAss);
					} else if (assObj.censusDesktopComplete == false && sectionListTra.length > 0 ) {
						alert("here33");

						//if (assObj.censusDesktopComplete == true) {
							//alert("here2.1");
							Alloy.Globals.Logger.log("======================assObj.censusDesktopComplete = false", "info");
							Alloy.Globals.aIndicator.hide();
							
							Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj,false,L('noCensusMessage'),"noCensusMessage");
							
							return;
					} else if (assObj.censusDesktopComplete == false && sectionListTra.length < 0 ) {
						alert("44");
						Alloy.Globals.aIndicator.hide();
					}
				}
			}
		} catch (e) {
			//alert("exception: "+JSON.stringify(e));
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in responseGenerator submitAss. Error Details: " + JSON.stringify(e), "info");
			Alloy.Globals.trainIDs = [];
			Alloy.Globals.censusIDs = [];
			Alloy.Globals.censusDates = [];

			Alloy.Globals.aIndicator.hide();
		}
	};

/**
 * `doAssessment` - we take an assObj (the assessment we want to submit) and a sectionListAss (built in submitAss function above).
 * We then call the buildAssessmentResponse (line 471) (see above) to get the xml payload to use in the SOAP call.
 * Once we have the xmlPayload to send, we call the createAssessment request to "commit" the given assObj.
 * 
 * @method doAssessment
 * 
 * @param {Object} assObj
 * @param {Object} sectionListAss
 */
	self.doAssessment = function(assObj, sectionListAss) {
		try {
			Alloy.Globals.theAssObj = assObj;
			var xmlRequest = self.buildAssessmentResponse(sectionListAss, assObj.crossingID, assObj.detailID, assObj.notes);

			if (assObj.isSubmitted === false) {
				Alloy.Globals.Soap.createAssessment(xmlRequest, function(xmlDoc) {
					assObj.alcrmStatus = "sent";
					assObj.isSubmitted = true;
					Ti.API.info("createAssessment called");
					Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);

					var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse(assObj);
					Alloy.Globals.Util.emailNotes(newAssessmentForPDF);
					Alloy.Globals.trainIDs = [];
					Alloy.Globals.censusIDs = [];
					Alloy.Globals.censusDates = [];
					Alloy.Globals.theAssObj = null;
					Alloy.Globals.aIndicator.hide();
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, true, L('assessmentSubmitted'));
				}, function() {
					Alloy.Globals.aIndicator.hide();
				});
			} 
		} catch (e) {
			Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false,L('assessmentFailed'),"assessmentFailed");
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("Exception in doAssessment. Error Details: " + JSON.stringify(e), "info");

		}
	};
	
/**
 * `commitAllCompleted` - we loop through all the saved assessments and we call the submitAss function on each 
 * assessment.
 * 
 * @params N/A
 * 
 * @method commitAllCompleted
 * 
 * @return {} N/A
 */
	self.commitAllCompleted = function() {
		try {
			if (!Titanium.Network.online) {
				Alloy.Globals.aIndicator.hide();
				var alertDialog = Titanium.UI.createAlertDialog({
					title : L('no_connectivity_title'),
					message : L('no_connectivity_body'),
					buttonNames : ['OK']
				});
				alertDialog.show();
				Alloy.Globals.aIndicator.hide();
				return;
			}

			var activeAssessments = Alloy.Globals.localDataHandler.getAllSavedAssessments();
			//alert(activeAssessments.length);
			
			for (var assessmentIndex = 0; assessmentIndex < activeAssessments.length; assessmentIndex++) {
				self.submitAss(activeAssessments[assessmentIndex]);
			}

		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Ti.API.error("EXCEPTION in commitAllCompleted. Error Details: " + JSON.stringify(e));
		}
	};
}

module.exports = new responseGenerator();