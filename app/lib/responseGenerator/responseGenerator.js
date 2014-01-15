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
	
	self.buildAssessmentResponse = function(questionList){
		var riskData = "";
		
		for(var questionIndex =0; questionIndex < questionList.length; questionIndex++){
			var questionResponse = Alloy.Globals.localParser.getUserResponse(questionList[questionIndex]);
			if(questionResponse != null){
				//riskData.push(questionResponse);
				riskData = riskData + questionResponse;
			}
		}
		
		/*
		var xmlRequest = 
		"<ass:CreateAssessmentRequest>"+
        "<ass:assessment>"+
            "<ass1:crossingID>${#TestCase#crossing.id}</ass1:crossingID>"+
            "<ass1:detailId>${#TestCase#crossing.detailId}</ass1:detailId>"+
            "<ass1:riskData>"+
               "<ques:parameterName>I_CONDUCTOR</ques:parameterName>"+
               "<ques:parameterValue>405</ques:parameterValue>"+
            "</ass1:riskData>"+
           "</ass:assessment>"+
         "</ass:CreateAssessmentRequest>";
		*/
				
		var crossingID = 10;
		var detailId = 1;
		
		/*
		var jasonResponse = 
		{"CreateAssessmentRequest" : 
			{"ass:assessment":
				{
					"ass1:crossingID":{"#text":crossingID},
					"ass1:detailId":{"#text":detailId},
					"ass1:riskData":riskData
				}
			}
		};
		*/
		
		var xmlRequest = 
		"<ass:CreateAssessmentRequest>"+
        "<ass:assessment>"+
            "<ass1:crossingID>"+crossingID+"</ass1:crossingID>"+
            "<ass1:detailId>"+detailId+"</ass1:detailId>"+
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
			alert("inside for loop");
			//if(activeAssessments[assessmentIndex].alcrmStatus == "sent")continue;
			
			var questionList = localDataHandler.openAssessment(activeAssessments[assessmentIndex]);
			//if(testIfAssessmentIsComplete(questionList) == false)continue;
			
			
			var xmlRequest = self.buildAssessmentResponse(questionList);
			alert(xmlRequest);
			
			Alloy.Globals.Soap.createAssessment(xmlRequest, 
				function(xmlDoc){
							var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                var response = JSON.stringify(xml.toObject());
			                alert('createAssessment Success response >> ' + response);
				}, 
				function(xmlDoc){
							var XMLTools = require("tools/XMLTools");
			                var xml = new XMLTools(xmlDoc);
			                var response = JSON.stringify(xml.toObject());
			                alert('createAssessment Failure response >> ' + response);
				}
			);
			
		}
	};

}

module.exports = responseGenerator; 