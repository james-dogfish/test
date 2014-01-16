function responseGenerator() {
	var self = this;

	self.toXml = function(v, name, ind) {
		var xml = "";
		if ( v instanceof Array) {
			for (var i = 0, n = v.length; i < n; i++)
				xml += self.toXml(v[i], name, ind + "");
		} else if ( typeof (v) == "object") {
			var hasChild = false;
			xml += ind + "<" + name;
			for (var m in v) {
				if (m.charAt(0) == "@")
					xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
				else
					hasChild = true;
			}
			xml += hasChild ? ">\n" : "/>";
			if (hasChild) {
				for (var m in v) {
					if (m == "#text")
						xml += v[m];
					else if (m == "#cdata")
						xml += "<![CDATA[" + v[m] + "]]>";
					else if (m.charAt(0) != "@")
						xml += self.toXml(v[m], m, ind + "\t");
				}
				xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">\n";
			}
		} else {// added special-character transform, but this needs to be better handled [micmath]
			xml += ind + "<" + name + ">" + v.toString().replace(/</g, '&lt;').replace(/&/g, '&amp;') + "</" + name + ">\n";
		}
		return xml;
	};
	self.convert = function(o) {

		xml = "";

		for (var m in o) {
			xml += self.toXml(o[m], m, "");
		}

		return xml;
	};

	//the structure of this will probably change (slightly) once we have know exactly what to post back.
	self.generateResponse = function(all_questions) {
		var header = "<xml>";
		var body = "";
		for (var i = 0; i < all_questions.length; i++) {
			var question = new Object({
				parameterName : all_questions[i].parameterName["#text"],
				order : all_questions[i].order["#text"],
				group : all_questions[i].group["#text"],
				text : all_questions[i].text["#text"]
			});

			var validation = all_questions[i].validation;
			if ( typeof validation !== undefined && typeof validation !== "undefined") {
				question.validation = new Object({});
				if (all_questions[i].validation.format !== undefined && typeof all_questions[i].validation.format !== "undefined") {
					question.validation.format = all_questions[i].validation.format["#text"];
				}
				if (all_questions[i].validation.mandatory !== undefined && typeof all_questions[i].validation.mandatory !== "undefined") {
					question.validation.mandatory = all_questions[i].validation.mandatory["#text"];
				}
			}

			var selections = Alloy.Globals.localParser.getAllSelections(all_questions[i]);
			if ( typeof selections !== undefined && typeof selections !== "undefined") {
				question.selections = new Array();
				for (var s = 0; s < selections.length; s++) {
					var selection = new Object({
						name : selections[s].name["#text"],
						value : selections[s].value["#text"],
					});
					question.selections.push(selection);
				}
			}

			var renderValue = Alloy.Globals.localParser.getRenderValue(all_questions[i]);
			if ( typeof renderValue !== undefined && typeof renderValue !== "undefined" && renderValue.length !== 0) {
				question.renderValue = new Object({});
				if (all_questions[i].renderValue.parameterName !== undefined && typeof all_questions[i].renderValue.parameterName !== "undefined") {
					question.renderValue.parameterName = all_questions[i].renderValue.parameterName["#text"];
				}
				if (all_questions[i].renderValue.parameterValue !== undefined && typeof all_questions[i].renderValue.parameterValue !== "undefined") {
					question.renderValue.parameterValue = all_questions[i].renderValue.parameterValue["#text"];
				}

			}

			body += "<question>" + self.convert(question) + "</question>";
		}
		var footer = "</xml>";
	};
	
	var testIfAssessmentIsComplete = function(questionList){
		var mandatoryQuestionCount =0;
		for(var i=0; i< questionList.length; i++){
			var isMandatory = Alloy.Globals.localParser.getQuestionMandatory(questionList[i]);
			if(isMandatory == true){
				
				
				if(Alloy.Globals.localParser.getUserResponse(questionList[i]) == null){
					return false;
				}
			}
		}
		return true;
	};
	
	self.buildCensusResponse = function(sectionList,crossingID,detailID){
		var censusData = "";
		
		for(var sectionListIndex = 0; sectionListIndex<sectionList.length; sectionListIndex++)
		{
				var questionList = sectionList[sectionListIndex].questionList;
				for(var questionIndex =0; questionIndex < questionList.length; questionIndex++){
					var questionResponse = questionList[questionIndex].questionResponse;
					
					var questionType = questionList[questionIndex].type;
					if(questionResponse != null){
						if(questionType === "multiSelect"){
							censusData = censusData + '<cen1:censusData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</cen1:censusData>";
						}else if(questionType === "dateRange" || questionType === "numericRange" 
									|| questionType === "decimalRange" || questionType === "alphaRange")
						{
							censusData = censusData + '<cen1:censusData xsi:type="ques:'+questionType+'" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</cen1:censusData>";
						}else{
							censusData = censusData + "<cen1:censusData>" + questionResponse + "</cen1:censusData>";
						}
					}
				}
		}

		var xmlRequest = 
		"<cen:CreateCensusRequest>"+
        "<cen:census>"+
            "<cen1:crossingId>"+crossingID+"</cen1:crossingID>"+
            "<cen1:censusDate>"+new Date().toISOString()+"</cen1:censusDate>"+
            censusData+
           "</cen:census>"+
         "</cen:CreateCensusRequest>";
		
		return xmlRequest;
	};
	
	self.buildTrainInfoGroupResponse = function(sectionList,crossingID,detailID){
		var trainData = "";
		
		for(var sectionListIndex = 0; sectionListIndex<sectionList.length; sectionListIndex++)
		{
				var questionList = sectionList[sectionListIndex].questionList;
				for(var questionIndex =0; questionIndex < questionList.length; questionIndex++){
					var questionResponse = questionList[questionIndex].questionResponse;
					
					var questionType = questionList[questionIndex].type;
					if(questionResponse != null){
						if(questionType === "multiSelect"){
							trainData = trainData + '<tra1:detailedData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</tra1:detailedData>";
						}else if(questionType === "dateRange" || questionType === "numericRange" 
									|| questionType === "decimalRange" || questionType === "alphaRange")
						{
							trainData = trainData + '<tra1:detailedData xsi:type="ques:'+questionType+'" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</tra1:detailedData>";
						}else{
							trainData = trainData + "<tra1:detailedData>" + questionResponse + "</tra1:detailedData>";
						}
					}
				}
		}

		var xmlRequest = 
		"<tra:CreateTrainGroupRequest>"+
        "<tra:trainGroupData>"+
            "<tra1:crossingId>"+crossingID+"</tra1:crossingId>"+
            "<tra1:date>"+new Date().toISOString()+"</tra1:date>"+
            trainData+
           "</tra:trainGroupData>"+
         "</tra:CreateTrainGroupRequest>";
		
		return xmlRequest;
		
	};
	
	self.buildAssessmentResponse = function(sectionList,crossingID,detailID){
		var riskData = "";
		
		for(var sectionListIndex = 0; sectionListIndex<sectionList.length; sectionListIndex++)
		{
				var questionList = sectionList[sectionListIndex].questionList;

				for(var questionIndex =0; questionIndex < questionList.length; questionIndex++){
					var questionResponse = questionList[questionIndex].questionResponse;
					
					var questionType = questionList[questionIndex].type;
					alert("QuestionType >>"+questionType);
					if(questionResponse != null){
						if(questionType === "multiSelect"){
							riskData = riskData + '<ass1:riskData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</ass1:riskData>";
						}else if(questionType === "dateRange" || questionType === "numericRange" 
									|| questionType === "decimalRange" || questionType === "alphaRange")
						{
							riskData = riskData + '<ass1:riskData xsi:type="ques:'+questionType+'" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + "</ass1:riskData>";
						}else{
							riskData = riskData + "<ass1:riskData>" + questionResponse + "</ass1:riskData>";
						}
					}
					
				}//end of inner for loop
		}//end of outer for loop

		var xmlRequest = 
		"<ass:CreateAssessmentRequest>"+
        "<ass:assessment>"+
            "<ass1:crossingId>"+crossingID+"</ass1:crossingId>"+
            "<ass1:detailId>"+detailID+"</ass1:detailId>"+
            riskData+
           "</ass:assessment>"+
         "</ass:CreateAssessmentRequest>";
		
		return xmlRequest;
	};

	self.commitAllCompleted = function() {
		var localDataHandler = require('localDataHandler/localDataHandler');
		var activeAssessments = localDataHandler.getAllSavedAssessments();
		//alert("Size of activeAssessments = " + JSON.stringify(activeAssessments));
		for(var assessmentIndex =0; assessmentIndex < activeAssessments.length; assessmentIndex++){
			//if(activeAssessments[assessmentIndex].alcrmStatus == "sent")continue;
			var sectionListAss = localDataHandler.openAssessment(activeAssessments[assessmentIndex]);
			
			var sectionListCen = localDataHandler.getAllCensusesOrTrains(activeAssessments[assessmentIndex],0);
			var sectionListTra =  localDataHandler.getAllCensusesOrTrains(activeAssessments[assessmentIndex],1);

			//THIS IS GONNA CHANGE
			/*var assQuestions = localDataHandler.openAssessment(activeAssessments[assessmentIndex]);
			var allNotes = [];
			for(var questionIndex=0 ; questionIndex<assQuestions.length; questionIndex++)
			{
				allNotes.push({
					//questionId:assQuestions[questionIndex].alcrmQuestionID
					notes:assQuestions[questionIndex].notes
				});
			}*/
			//END
			
			
			//if(testIfAssessmentIsComplete(questionList) == false)continue;  //just for testing...need to put back in!!!
			
			var xmlCensusRequest = self.buildCensusResponse(sectionListCen,activeAssessments[assessmentIndex].crossingID,activeAssessments[assessmentIndex].detailID);
			var xmlTrainRequest  = self.buildTrainInfoGroupResponse(sectionListTra,activeAssessments[assessmentIndex].crossingID,activeAssessments[assessmentIndex].detailID);
			var xmlRequest = self.buildAssessmentResponse(sectionListAss,activeAssessments[assessmentIndex].crossingID,activeAssessments[assessmentIndex].detailID);
			
			alert("xmlRequest >> " + JSON.stringify(xmlRequest));
			
			//COMMIT ASS
			Alloy.Globals.Soap.createAssessment(xmlRequest, 
				function(xmlDoc){
							var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                var response = JSON.stringify(xml.toObject());
			                activeAssessments[assessmentIndex].alcrmStatus = "sent";
			                localDataHandler.updateSavedAssessments(activeAssessments);
			                Ti.API.info('createAssessment Success response >> ' + response);
			                
			                //COMMIT CENSUS
			       			Alloy.Globals.Soap.createCensus(xmlCensusRequest, 
								function(xmlDoc){
											var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                var response = JSON.stringify(xml.toObject());
							                Ti.API.info('createCensusRequest Success response >> ' + response);
							                //COMMIT TRAIN INFO
							       			Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest, 
												function(xmlDoc){
															var XMLTools = require("tools/XMLTools");
											                var xml = new XMLTools(xmlDoc);
											                var response = JSON.stringify(xml.toObject());
											                Ti.API.info('createTrainGroupRequest Success response >> ' + response);
											                Alloy.Globals.aIndicator.hide();
												}, 
												function(xmlDoc){
															var XMLTools = require("tools/XMLTools");
											                var xml = new XMLTools(xmlDoc);
											                var response = JSON.stringify(xml.toObject());
											                Ti.API.info('createTrainGroupRequest Failure response >> ' + response);
											                Alloy.Globals.aIndicator.hide();
												}
											);//END OF COMMIT TRAIN INFO
								}, 
								function(xmlDoc){
											var XMLTools = require("tools/XMLTools");
							                var xml = new XMLTools(xmlDoc);
							                var response = JSON.stringify(xml.toObject());
							                Ti.API.info('createCensusRequest Failure response >> ' + response);
							                Alloy.Globals.aIndicator.hide();
								}
							);//END OF COMMIT CENSUS  
							    
				}, 
				function(xmlDoc){
							var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                var response = JSON.stringify(xml.toObject());
			                Alloy.Globals.aIndicator.hide();
			                Ti.API.info('createAssessment Failure response >> ' + response);
			               
			                
				}
			);	
			 
		}//end for loop
	}; //end self.committAllCompleted
}

module.exports = responseGenerator; 