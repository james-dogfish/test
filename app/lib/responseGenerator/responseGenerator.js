function responseGenerator() {
	var self = this;
	var noneToSubmit = 0;

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

	self.buildCensusResponse = function(assObj,censusList, crossingID, detailID) {
		//if(assObj.censusDesktopComplete == true) return;
		
		var xmlRequest = [];
		for (var censusListIndex = 0; censusListIndex < censusList.length; censusListIndex++) {
			var censusData = "";
			var censusDate = "";
			var sectionList = censusList[censusListIndex];
			for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
				var questionList = sectionList[sectionListIndex].questionList;
				//alert("questionList[2]"+JSON.stringify(questionList[2]));
				for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {

					/*if it's not a question - we skip it - CONTACT ANDY.*/
					if (questionList[questionIndex].isAQuestion == false)
						continue;

					var questionResponse = questionList[questionIndex].questionResponse;

					//Ti.API.error("Census questionList[questionIndex] = "+JSON.stringify(questionList[questionIndex]));
					var questionType = questionList[questionIndex].type;

					if (questionList[questionIndex].isAQuestion == true && censusDate === "") {
						if (questionList[questionIndex].alcrmQuestionID == "I_CENSUS_DATE" || questionList[questionIndex].alcrmQuestionID == "CENSUS_DATE") {
							censusDate = questionList[questionIndex].value;
							//alert("censusDate="+censusDate.length);
							if(censusDate.length === 1)
							{
								censusDate = null;
								
							}
							continue;
						}
					}
					//Ti.API.error("questionResponse ====== >"+JSON.stringify(questionResponse));
					var tempFix = JSON.stringify(questionResponse);
					tempFix = tempFix.replace("<ass1:riskData>", "").replace("</ass1:riskData>", "").replace("1I_", "I_").replace(/[0-9]I_/g, 'I_');
					questionResponse = JSON.parse(tempFix);

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

			var numbers = "";
			var dateToPost = "";
			if (censusDate !== null) {
				
					//alert(censusDate);
					numbers = censusDate.match(/\d+/g);
					if (numbers != null) {
						dateToPost = new Date(numbers[2], numbers[0] - 1, numbers[1]);
					}
					
					xmlRequest.push("<cen:CreateCensusRequest>" + "<cen:census>" + "<cen1:crossingId>" + crossingID + "</cen1:crossingId>" + "<cen1:censusDate>" + dateToPost.toISOString() + "</cen1:censusDate>" + censusData + "</cen:census>" + "</cen:CreateCensusRequest>");

			}
		}

		return xmlRequest;
	};
	//end of buildCensusResponse

	self.buildTrainInfoGroupResponse = function(trainList, crossingID, detailID) {
		var xmlRequest = [];

		for (var trainListIndex = 0; trainListIndex < trainList.length; trainListIndex++) {
			var sectionList = trainList[trainListIndex];
			var trainData = "";
			for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
				var questionList = sectionList[sectionListIndex].questionList;
				for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
					var questionResponse = questionList[questionIndex].questionResponse;

					var questionType = questionList[questionIndex].type;
					if (questionResponse != null) {
						if (questionType === "multiSelect") {
							trainData = trainData + '<tra1:detailedData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</tra1:detailedData>';
						} else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
							trainData = trainData + '<tra1:detailedData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</tra1:detailedData>';
						} else {
							trainData = trainData + "<tra1:detailedData>" + questionResponse + "</tra1:detailedData>";
						}
					}
				}
			}

			xmlRequest.push("<tra:CreateTrainGroupRequest>" + "<tra:trainGroupData>" + "<tra1:crossingId>" + crossingID + "</tra1:crossingId>" + "<tra1:date>" + new Date().toISOString() + "</tra1:date>" + trainData + "</tra:trainGroupData>" + "</tra:CreateTrainGroupRequest>");
		}

		return xmlRequest;
	};
	//end of buildTrainInfoGroupResponse

	self.buildAssessmentResponse = function(sectionList, crossingID, detailID, assNotes) {
		
		try{
		var riskData = "";

		for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
			var questionList = sectionList[sectionListIndex].questionList;
			for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
				var questionResponse = questionList[questionIndex].questionResponse;

				var questionType = questionList[questionIndex].type;
				//Ti.API.error("assquestionResponse =>" + JSON.stringify(questionResponse));
				if (questionResponse != null) {
					if (questionType === "multiSelect") {
						riskData = riskData + '<ass1:riskData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</ass1:riskData>';
					} else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
						riskData = riskData + '<ass1:riskData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</ass1:riskData>';
					} else {
						riskData = riskData + "<ass1:riskData>" + questionResponse + "</ass1:riskData>";
					}
				}

			} //end of inner for loop
		}//end of outer for loop
		var date = new Date();
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
		//Alloy.Globals.trainIDs = [];

		if (censusIDs.length > 0) {
			for (var i = 0; i < censusIDs.length; i++) {
				censusIDSXml += "<ass1:censusId>" + censusIDs[i] + "</ass1:censusId>";
				//alert(censusIDSXml);
			}
		}

		if (censusDates.length > 0) {
			for (var i = 0; i < censusDates.length; i++) {
				censusDatesXml += "<ass1:censusDate>" + Alloy.Globals.Util.convertDate(censusDates[i]).dateFormat2 + "</ass1:censusDate>";
			}
		}

		//Alloy.Globals.censusIDs = [];

		var dateNode = "<ass1:riskData><ques:parameterName>LAST_ASSESSMENT_DATE</ques:parameterName>" + "<ques:parameterValue>" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "</ques:parameterValue></ass1:riskData>";
		var xmlRequest = "<ass:CreateAssessmentRequest><ass:assessment><ass1:crossingID>" + crossingID + "</ass1:crossingID>" + censusIDSXml + trainIDSXml + censusDatesXml + riskData + "</ass:assessment></ass:CreateAssessmentRequest>";

		return xmlRequest;
		}catch(e){
			Ti.API.error("EXCEPTION IN buildAssessmentResponse. Error Details: "+JSON.stringify(e));
		}
	};
	//end of buildAssessmentResponse;

	self.commitWithOnlyCensus = function(xmlCensusRequest, assObj, sectionListAss) {
		Ti.API.info("assObj.censusDesktopComplete == " + assObj.censusDesktopComplete);
		if (assObj.censusDesktopComplete == false) {
			//COMMIT CENSUS
			for (var i = 0; i < xmlCensusRequest.length; i++) {
				Alloy.Globals.Soap.createCensus(xmlCensusRequest[i], function(xmlDoc) {

					Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
						// callback
						var data = JSON.parse(data);
						var censusId = data.response.Envelope.Body.CreateCensusResponse.census.censusId;
						var censusDate = data.response.Envelope.Body.CreateCensusResponse.census.censusDate;

						Alloy.Globals.censusIDs.push(censusId);

						Alloy.Globals.censusDates.push(censusDate);

					
						Ti.API.error("Census - Alloy.Globals.censusIDs.length === xmlCensusRequest.length >> " + Alloy.Globals.censusDates.length);
						/*if (Alloy.Globals.censusDates.length === xmlCensusRequest.length && Alloy.Globals.censusIDs.length === xmlCensusRequest.length) {
							if (Alloy.Globals.censusDates.length === Alloy.Globals.censusIDs.length) {*/
								self.doAssessment(assObj, sectionListAss);
							/*}
						}*/

					});

					//end of convertJSON

				}, function(xmlDoc) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
				});
				//END OF COMMIT CENSUS
			} //end for loop

		} else {
			if (assObj.censusDesktopComplete == true) {
				self.doAssessment(assObj, sectionListAss);
			}else{
				Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
			}
		}
	};
	//end of commitWithOnlyCensus

	self.commitWithOnlyTrain = function(xmlTrainRequest, assObj, sectionListAss) {
		for (var i = 0; i < xmlTrainRequest.length; i++) {
			//COMMIT TRAIN INFO
			Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

				Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
					// callback
					var data = JSON.parse(data);
					var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
					Ti.API.info("trainId=" + trainId);
					Alloy.Globals.trainIDs.push(trainId);
				
					Ti.API.error("Trains - Alloy.Globals.trainIDs.length === 3 >> " + Alloy.Globals.trainIDs.length);

					if (Alloy.Globals.trainIDs.length === 3) {

						self.doAssessment(assObj, sectionListAss);
					}

				});
			}, function(xmlDoc) {
				Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
			});
			//END OF COMMIT TRAIN INFO
		}//end for loop
	};
	//end of commitWithOnlyTrain;

	self.commitWithTrainAndCensus = function(xmlCensusRequest, xmlTrainRequest, assObj, sectionListAss) {
		Ti.API.info("assObj.censusDesktopComplete == " + assObj.censusDesktopComplete);
		if (assObj.censusDesktopComplete == false) {
			//COMMIT CENSUS
			for (var i = 0; i < xmlCensusRequest.length; i++) {
				Alloy.Globals.Soap.createCensus(xmlCensusRequest[i], function(xmlDoc) {

					Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
						// callback
						var data = JSON.parse(data);
						var censusId = data.response.Envelope.Body.CreateCensusResponse.census.censusId;
						var censusDate = data.response.Envelope.Body.CreateCensusResponse.census.censusDate;

						Alloy.Globals.censusIDs.push(censusId);

						Alloy.Globals.censusDates.push(censusDate);

						for (var i = 0; i < xmlTrainRequest.length; i++) {
							//COMMIT TRAIN INFO
							Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

								Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
									// callback
									var data = JSON.parse(data);
									var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
									Ti.API.info("trainId=" + trainId);
									Alloy.Globals.trainIDs.push(trainId);
									
									Ti.API.error("Trains - Alloy.Globals.trainIDs.length === 3 >> " + Alloy.Globals.trainIDs.length);									
									Ti.API.error("Census - Alloy.Globals.censusIDs.length === xmlCensusRequest.length >> " + Alloy.Globals.censusDates.length);
									if (Alloy.Globals.trainIDs.length === 3) {
											self.doAssessment(assObj, sectionListAss);
									}

								});
							}, function(xmlDoc) {
								Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
							});
							//END OF COMMIT TRAIN INFO

						} //end for loop

					});

					//end of convertJSON

				}, function(xmlDoc) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
				});
				//END OF COMMIT CENSUS
			} //end for loop

		} else {
			
				self.doAssessment(assObj, sectionListAss);
		}
	}; //end of commitWithTrainAndCensus

	self.submitAss = function(assObj) {
		try {
			if (!(Alloy.Globals.isDebugOn) && assObj.questionsCompleted < assObj.questionCount) {
				//alert("assessmentIncomplete before");
				Alloy.Globals.riskAssessmentWindow.assessmentIncomplete(assObj);
				//Ti.App.fireEvent('assessmentIncomplete', assObj);
				noneToSubmit++;
				Ti.API.info("noneToSubmit = " + noneToSubmit);
				//return;
			} else {
				if (assObj.isSubmitted === false) {
					Alloy.Globals.aIndicator.show("Committing...");
					var sectionListAss = Alloy.Globals.localDataHandler.getMainRiskAssessmentQuestions(assObj);
					var sectionListCen = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 0);
					var sectionListTra = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 1);
					//Ti.API.error("sectionListAss >> " + JSON.stringify(sectionListAss));
					//return;
					var xmlCensusRequest = null;
					var xmlTrainRequest = self.buildTrainInfoGroupResponse(sectionListTra, assObj.crossingID, assObj.detailID);
					if(typeof sectionListCen === "undefined" || sectionListCen.length === 0 || sectionListCen == null)
					{
						if(assObj.censusDesktopComplete == false)
						{
							Ti.API.info("assObj.censusDesktopComplete = "+assObj.censusDesktopComplete);
							Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
						}
					}else{
						xmlCensusRequest = self.buildCensusResponse(assObj,sectionListCen, assObj.crossingID, assObj.detailID);
						if(assObj.censusDesktopComplete == false)
						{
							Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
						}
					}
					if (sectionListCen.length > 0 && sectionListTra.length > 0) {
						self.commitWithTrainAndCensus(xmlCensusRequest, xmlTrainRequest, assObj, sectionListAss);
					} else if (sectionListCen.length > 0 && sectionListTra.length <= 0) {
						self.commitWithOnlyCensus(xmlCensusRequest, assObj, sectionListAss);
					} else if (sectionListCen.length <= 0 && sectionListTra.length > 0) {
						if(assObj.censusDesktopComplete == true)
						{
							Ti.API.error("======================assObj.censusDesktopComplete = true");
							self.commitWithOnlyTrain(xmlTrainRequest, assObj, sectionListAss);
						}else{
							Ti.API.info("assObj.censusDesktopComplete = "+assObj.censusDesktopComplete);
							Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
						}
						
					}
				}

				//xmlCensusRequest = null;
			}
		} catch (e) {
			Ti.API.error("Exception in responseGenerator submitAss. Error Details: " + JSON.stringify(e));
			Alloy.Globals.trainIDs = [];
			Alloy.Globals.censusIDs = [];
			Alloy.Globals.censusDates = [];
			
			Alloy.Globals.aIndicator.hide();
		}
	};//end of submitAss

	self.doAssessment = function(assObj, sectionListAss) {
		try {
			
			var xmlRequest = self.buildAssessmentResponse(sectionListAss, assObj.crossingID, assObj.detailID, assObj.notes);

			if (assObj.isSubmitted === false) {
				Alloy.Globals.Soap.createAssessment(xmlRequest, function(xmlDoc) {
					assObj.alcrmStatus = "Sent";
					assObj.isSubmitted = true;
					//alert("createAss");
					//alert(JSON.stringify(assObj));
					Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);

					var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse(assObj);
					Alloy.Globals.Util.emailNotes(newAssessmentForPDF);
					Alloy.Globals.trainIDs = [];
					Alloy.Globals.censusIDs = [];
					Alloy.Globals.censusDates = [];
					
					Alloy.Globals.aIndicator.hide();
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, true);
					//return;
				}, function() {
					
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
				});
			}else{
				Alloy.Globals.aIndicator.hide();
			} /*else {

				Alloy.Globals.Soap.updateAssessment(xmlRequest, function(xmlDoc) {
					assObj.alcrmStatus = "Sent";
					assObj.isSubmitted = true;
					//alert("updateAss");
					//alert(JSON.stringify(assObj));
					Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);

					var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse(assObj);
					Alloy.Globals.Util.emailNotes(newAssessmentForPDF);
					//Ti.API.info('createAssessment Success response >> ' + response);
					Alloy.Globals.trainIDs = [];
					Alloy.Globals.censusIDs = [];
					Alloy.Globals.censusDates = [];
					
					Alloy.Globals.aIndicator.hide();
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, true);
					//return;
				}, function() {
					
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false);
				});
			}*/

		} catch (e) {
			Ti.API.error("Exception in doAssessment. Error Details: " + JSON.stringify(e));
			
		}
	};//end of doAssessment

	self.commitAllCompleted = function() {
		var activeAssessments = Alloy.Globals.localDataHandler.getAllSavedAssessments();

		//alert('activeAssessments=' + activeAssessments.length);

		for (var assessmentIndex = 0; assessmentIndex < activeAssessments.length; assessmentIndex++) {
			self.submitAss(activeAssessments[assessmentIndex]);
		}
		/*if (noneToSubmit === activeAssessments.length) {
			alert("There are currently no risk assessments to submit");
			noneToSubmit = 0;
			return;
		}*/
	};//end of commitAllCompleted
}//end of responseGenerator

module.exports = new responseGenerator(); 