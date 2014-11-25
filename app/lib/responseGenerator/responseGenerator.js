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

	var dateToString = function(date) {
		var day = date.getDate();
		day = (day < 10 ) ? '0' + day : day;

		var month = date.getMonth() + 1;
		month = (month < 10 ) ? '0' + month : month;

		var year = date.getFullYear();
		alert(year + "-" + month + "-" + day);
		return year + "-" + month + "-" + day;
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
								if (questionList[questionIndex].value instanceof Array) {
									censusDate = questionList[questionIndex].value[0];
								} else if (questionList[questionIndex].value.trim() != "") {
									censusDate = questionList[questionIndex].value;
								} else {
								}
								if (censusDate.length === 1) {
									censusDate = null;
								}
								continue;
							}
						}

						var tempFix = JSON.stringify(questionResponse);
						tempFix = tempFix.replace("<ass1:riskData>", "").replace("</ass1:riskData>", "").replace(/[0-9]I_/g, 'I_');
						questionResponse = JSON.parse(tempFix);

						if (questionResponse !== null) {
							var questionValue = String(self.findQuestionByParam(sectionList, questionList[questionIndex].alcrmQuestionID));
							if ( typeof questionValue !== "undefined" && questionValue !== "null") {

								if (questionValue.indexOf("&") !== -1 || questionValue.indexOf("&amp;") !== -1 || questionValue.indexOf("&apos;") !== -1) {
									var newValue = escape(questionValue).replace(/%20/g, " ").replace(/%2C/g, ", ").replace(/%28/g, "(").replace(/%26/g, " and ");

									questionList[questionIndex].questionResponse = "<ques:parameterName>" + questionList[questionIndex].alcrmQuestionID + "</ques:parameterName>" + "<ques:parameterValue>" + newValue + "</ques:parameterValue>";
									questionResponse = questionList[questionIndex].questionResponse;
								} else {
									var newValue = String(questionValue).trim();
									if ( typeof newValue === "undefined" || newValue === "undefined")
										newValue = "";
									questionList[questionIndex].questionResponse = "<ques:parameterName>" + questionList[questionIndex].alcrmQuestionID + "</ques:parameterName>" + "<ques:parameterValue>" + newValue + "</ques:parameterValue>";
									questionResponse = questionList[questionIndex].questionResponse;
								}
							}
						}

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
				if (censusDate !== null && censusDate.trim() !== "") {

					numbers = censusDate.match(/(\d{4})-(\d{2})-(\d{2})/);
					if (numbers != null) {

						dateToPost = new Date(numbers[1], numbers[2] - 1, numbers[3]);
					} else {
						numbers = censusDate.match(/(\d{2})-(\d{2})-(\d{4})/);
						if (numbers != null) {
							dateToPost = new Date(numbers[3], numbers[2] - 1, numbers[1]);
						}
					}

					xmlRequest.push("<cen:CreateCensusRequest>" + "<cen:census>" + "<cen1:crossingId>" + crossingID + "</cen1:crossingId>" + "<cen1:censusDate>" + dateToPost.toISOString() + "</cen1:censusDate>" + censusData + "</cen:census>" + "</cen:CreateCensusRequest>");
					dateToPost = "";
				}
			}
			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
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
						} else {
							questionUnAnswered = true;
							trainData = "";
						}

					}

					if (trainListIndex == 0 && questionUnAnswered == true) {
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('trainInfoIncomplete1') + (trainListIndex + 1), "trainInfoIncomplete1");
					}

					if (questionAnswered == true && questionUnAnswered == true) {
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('trainInfoIncomplete1') + (trainListIndex + 1), "trainInfoIncomplete1");
					}

				}
				if (trainData !== "") {
					xmlRequest.push("<tra:CreateTrainGroupRequest>" + "<tra:trainGroupData>" + "<tra1:crossingId>" + crossingID + "</tra1:crossingId>" + "<tra1:date>" + new Date().toISOString() + "</tra1:date>" + trainData + "</tra:trainGroupData>" + "</tra:CreateTrainGroupRequest>");
				}
			}

			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
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
	self.buildAssessmentResponse = function(sectionList, crossingID, detailID, assNotes, trainIDs, censusIDs, censusDates) {
		try {
			var riskData = "";
			var titleFixed = false;
			var assessmentDate = null;
			for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
				var questionList = sectionList[sectionListIndex].questionList;
				for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
					var questionResponse = questionList[questionIndex].questionResponse;

					// Only do Alessios magic for alphanumeric answers
					// Ti.API.error(questionList[questionIndex].type);
					if (questionResponse !== null && questionList[questionIndex].type === 'alphanumeric') {

						var questionValue = String(self.findQuestionByParam(sectionList, questionList[questionIndex].alcrmQuestionID)).trim();
						var questionID = questionList[questionIndex].alcrmQuestionID;
						if ( typeof questionValue !== "undefined" && questionValue !== "null" && typeof questionID !== "undefined") {

							if (questionValue.indexOf("&") !== -1 || questionValue.indexOf("&amp;") !== -1 || questionValue.indexOf("&apos;") !== -1) {
								var newValue = escape(questionValue).replace(/%20/g, " ").replace(/%2C/g, ", ").replace(/%28/g, "(").replace(/%26/g, " and ");

								questionList[questionIndex].questionResponse = "<ques:parameterName>" + questionID + "</ques:parameterName>" + "<ques:parameterValue>" + newValue + "</ques:parameterValue>";
								questionResponse = questionList[questionIndex].questionResponse;
							} else {
								var newValue = String(questionValue).trim();
								if ( typeof newValue === "undefined" || newValue === "undefined")
									newValue = "";
								questionList[questionIndex].questionResponse = "<ques:parameterName>" + questionID + "</ques:parameterName>" + "<ques:parameterValue>" + newValue + "</ques:parameterValue>";
								questionResponse = questionList[questionIndex].questionResponse;
							}
						}
					}

					var questionType = questionList[questionIndex].type;

					if (questionList[questionIndex].alcrmQuestionID == "I_ASSESSMENT_TITLE" && titleFixed == false) {
						var assDate = self.findQuestionByParam(sectionList, "LAST_ASSESSMENT_DATE");
						questionList[questionIndex].questionResponse = "<ques:parameterName>I_ASSESSMENT_TITLE</ques:parameterName>" + "<ques:parameterValue>" + crossingID + " " + assDate + " " + escape(questionList[questionIndex].value).replace(/%20/g, " ") + "</ques:parameterValue>";
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
					if (questionList[questionIndex].alcrmQuestionID == "LAST_ASSESSMENT_DATE") {
					}

				}
			}

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

			var xmlRequest = "<ass:CreateAssessmentRequest><ass:assessment><ass1:crossingID>" + crossingID + "</ass1:crossingID>" + censusIDSXml + trainIDSXml + censusDatesXml + riskData + "</ass:assessment></ass:CreateAssessmentRequest>";
			return xmlRequest;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("EXCEPTION IN buildAssessmentResponse. Error Details: " + JSON.stringify(e), "info");
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
		var key = assObj.assessmentID;
		Ti.API.info("key = " + key);

		Alloy.Globals.trainIDs[key] = [];
		try {
			for (var i = 0; i < xmlTrainRequest.length; i++) {
				Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

					Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
						var data = JSON.parse(data);
						var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
						var crossingId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.crossingId;
						Alloy.Globals.Logger.log("trainId=" + trainId, "info");
						Alloy.Globals.trainIDs[key].push(trainId);

						if (Alloy.Globals.trainIDs[key].length === xmlTrainRequest.length) {
							self.doAssessment(assObj, sectionListAss, Alloy.Globals.trainIDs[key], [], []);
							Alloy.Globals.trainIDs[key] = [];
						}

					});
				}, function(xmlDoc) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentNotCompleted'));
				});
			}

		} catch(e) {
			Alloy.Globals.Logger.logException(e);
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
		Alloy.Globals.censusIDs[assObj.assessmentID] = [];
		Alloy.Globals.censusDates[assObj.assessmentID] = [];
		Alloy.Globals.trainIDs[assObj.assessmentID] = [];

		try {
			//BIT OF SANITY CHECK HERE!!
			if (xmlCensusRequest.length === 0) {
				if (assObj.censusDesktopComplete == false) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('noCensusMessage'), "noCensusMessage");
				}
			}
			if (assObj.censusDesktopComplete == false) {
				for (var i = 0; i < xmlCensusRequest.length; i++) {
					Alloy.Globals.Soap.createCensus(xmlCensusRequest[i], function(xmlDoc) {

						Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
							var data = JSON.parse(data);
							var censusId = data.response.Envelope.Body.CreateCensusResponse.census.censusId;
							var censusDate = data.response.Envelope.Body.CreateCensusResponse.census.censusDate;

							Alloy.Globals.censusIDs[assObj.assessmentID].push(censusId);
							Alloy.Globals.censusDates[assObj.assessmentID].push(censusDate);

							if (Alloy.Globals.censusIDs[assObj.assessmentID].length == xmlCensusRequest.length) {
								var censusIDs = Alloy.Globals.censusIDs[assObj.assessmentID];
								var censusDates = Alloy.Globals.censusDates[assObj.assessmentID];
								Alloy.Globals.censusIDs[assObj.assessmentID] = [];
								Alloy.Globals.censusDates[assObj.assessmentID] = [];
								for (var i = 0; i < xmlTrainRequest.length; i++) {
									Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest[i], function(xmlDoc) {

										Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc), function(data) {
											var data = JSON.parse(data);
											var trainId = data.response.Envelope.Body.CreateTrainGroupResponse.trainGroupData.trainDataId;
											Alloy.Globals.Logger.log("trainId=" + trainId, "info");
											Alloy.Globals.trainIDs[assObj.assessmentID].push(trainId);

											if (Alloy.Globals.trainIDs[assObj.assessmentID].length === xmlTrainRequest.length) {
												var trainIDs = Alloy.Globals.trainIDs[assObj.assessmentID];
												self.doAssessment(assObj, sectionListAss, trainIDs, censusIDs, censusDates);
												Alloy.Globals.trainIDs[assObj.assessmentID] = [];
											}

										});
									}, function(xmlDoc) {
										Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentNotCompleted'), "assessmentNotCompleted");
									});
								}

							} else {
							}

						});
					}, function(xmlDoc) {
						Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentNotCompleted'), "assessmentNotCompleted");
					});
				}

			} else {

				self.doAssessment(assObj, sectionListAss, Alloy.Globals.trainIDs[assObj.assessmentID], [], []);
				Alloy.Globals.trainIDs[assObj.assessmentID] = [];
				Alloy.Globals.censusIDs[assObj.assessmentID] = [];
				Alloy.Globals.censusDates[assObj.assessmentID] = [];
			}
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
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
	self.submitAss = function(assObj, currentAssIndex, totalAsses) {
		// Ti.API.error("self.submitAss -> assObj with Index= " + assObj.assessmentIndex);

		try {
			if (!(Alloy.Globals.isDebugOn) && assObj.questionsCompleted < assObj.questionCount) {

				Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentNotCompleted'), "assessmentNotCompleted");
				//return;
				noneToSubmit++;
				Alloy.Globals.Logger.log("noneToSubmit = " + noneToSubmit, "info");

			} else {
				var sectionListAss = Alloy.Globals.localDataHandler.getMainRiskAssessmentQuestions(assObj);
				var sectionListCen = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 0);
				var sectionListTra = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 1);
				var xmlCensusRequest = self.buildCensusResponse(assObj, sectionListCen, assObj.crossingID, assObj.detailID);
				var xmlTrainRequest = self.buildTrainInfoGroupResponse(sectionListTra, assObj.crossingID, assObj.detailID, assObj);
				Ti.API.error("xmlTrainRequest = " + xmlTrainRequest);

				if (sectionListCen.length > 0 && sectionListTra.length > 0) {
					if (assObj.censusDesktopComplete == true) {
						self.commitWithOnlyTrain(xmlTrainRequest, assObj, sectionListAss);
						return;
					} else {
						self.commitWithTrainAndCensus(xmlCensusRequest, xmlTrainRequest, assObj, sectionListAss);
						return;
					}
				} else if (assObj.censusDesktopComplete == true && sectionListTra.length > 0) {
					self.commitWithOnlyTrain(xmlTrainRequest, assObj, sectionListAss);
					return;
				} else if (assObj.censusDesktopComplete == false && sectionListTra.length > 0) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('noCensusMessage'), "noCensusMessage");
				} else if (assObj.censusDesktopComplete == false && sectionListTra.length <= 0) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('noCensusMessage'), "noCensusMessage");
				} else if (assObj.censusDesktopComplete == true && sectionListTra.length <= 0) {
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('noTrainsMessage'), "noTrainsMessage");
				}

			}

		} catch (e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in responseGenerator submitAss. Error Details: " + JSON.stringify(e), "info");
			Alloy.Globals.trainIDs[assObj.assessmentID] = [];
			Alloy.Globals.censusIDs[assObj.assessmentID] = [];
			Alloy.Globals.censusDates[assObj.assessmentID] = [];
		}
	};

	function dismissCommittingIndicator() {
		Alloy.Globals.totalAsses++;

		if (Alloy.Globals.assessmentsToCommit === Alloy.Globals.totalAsses) {
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.assessmentsToCommit = 0;
			Alloy.Globals.totalAsses = 0;
		}
	}

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
	self.doAssessment = function(assObj, sectionListAss, trainIDs, censusIDs, censusDates) {
		//Sort numerically and ascending:
		trainIDs.sort(function(a, b) {
			return a - b;
		});
		//Array now becomes [7, 8, 25, 41]

		try {
			var xmlRequest = self.buildAssessmentResponse(sectionListAss, assObj.crossingID, assObj.detailID, assObj.notes, trainIDs, censusIDs, censusDates);
			Alloy.Globals.theAssObj = assObj;

			if (assObj.isSubmitted === false) {
				Alloy.Globals.Soap.createAssessment(xmlRequest, function(xmlDoc) {
					assObj.alcrmStatus = "sent";
					assObj.isSubmitted = true;

					dismissCommittingIndicator();

					Ti.API.info("createAssessment called");
					Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);

					var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse(assObj);
					Alloy.Globals.Util.emailNotes(newAssessmentForPDF, assObj.crossingName);

					Alloy.Globals.theAssObj = null;
					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, true, L('assessmentSubmitted'));
				}, function() {
					dismissCommittingIndicator();

					Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentNotCompleted'), "assessmentNotCompleted");

				});
			}
		} catch (e) {
			dismissCommittingIndicator();
			Alloy.Globals.riskAssessmentWindow.assessmentSubmitMessage(assObj, false, L('assessmentFailed'), "assessmentFailed");
			Alloy.Globals.Logger.logException(e);
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
			Alloy.Globals.assessmentsToCommit = activeAssessments.length;
			var assessmentIndex = 0;
			while (assessmentIndex <= activeAssessments.length) {
				if (activeAssessments[assessmentIndex].isSubmitted === false) {
					Alloy.Globals.aIndicator.show('Committing ...');
					Ti.API.error('Submitting assessments with >>' + activeAssessments[assessmentIndex].assessmentID);
					self.submitAss(activeAssessments[assessmentIndex], assessmentIndex, activeAssessments.length);
				}
				assessmentIndex++;
			}
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Ti.API.error("EXCEPTION in commitAllCompleted. Error Details: " + JSON.stringify(e));
		}
	};
}

module.exports = new responseGenerator();
