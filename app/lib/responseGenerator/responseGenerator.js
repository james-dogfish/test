function responseGenerator() {
    var self = this;
	var localDataHandler = require('localDataHandler/localDataHandler');
    var isDebugOn = require('alloy').CFG.debug;
    var Util = require('core/Util');
    
    self.toXml = function (v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++)
                xml += self.toXml(v[i], name, ind + "");
        } else if (typeof (v) == "object") {
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
        } else { // added special-character transform, but this needs to be better handled [micmath]
            xml += ind + "<" + name + ">" + v.toString().replace(/</g, '&lt;').replace(/&/g, '&amp;') + "</" + name + ">\n";
        }
        return xml;
    };
    self.convert = function (o) {

        xml = "";

        for (var m in o) {
            xml += self.toXml(o[m], m, "");
        }

        return xml;
    };

    //the structure of this will probably change (slightly) once we have know exactly what to post back.
    self.generateResponse = function (all_questions) {
        var header = "<xml>";
        var body = "";
        for (var i = 0; i < all_questions.length; i++) {
            var question = new Object({
                parameterName: all_questions[i].parameterName["#text"],
                order: all_questions[i].order["#text"],
                group: all_questions[i].group["#text"],
                text: all_questions[i].text["#text"]
            });

            var validation = all_questions[i].validation;
            if (typeof validation !== undefined && typeof validation !== "undefined") {
                question.validation = new Object({});
                if (all_questions[i].validation.format !== undefined && typeof all_questions[i].validation.format !== "undefined") {
                    question.validation.format = all_questions[i].validation.format["#text"];
                }
                if (all_questions[i].validation.mandatory !== undefined && typeof all_questions[i].validation.mandatory !== "undefined") {
                    question.validation.mandatory = all_questions[i].validation.mandatory["#text"];
                }
            }

            var selections = Alloy.Globals.localParser.getAllSelections(all_questions[i]);
            if (typeof selections !== undefined && typeof selections !== "undefined") {
                question.selections = new Array();
                for (var s = 0; s < selections.length; s++) {
                    var selection = new Object({
                        name: selections[s].name["#text"],
                        value: selections[s].value["#text"],
                    });
                    question.selections.push(selection);
                }
            }

            var renderValue = Alloy.Globals.localParser.getRenderValue(all_questions[i]);
            if (typeof renderValue !== undefined && typeof renderValue !== "undefined" && renderValue.length !== 0) {
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

    var testIfAssessmentIsComplete = function (questionList) {
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

    self.buildCensusResponse = function (censusList, crossingID, detailID) {
        var censusData = "";
		var censusDate = "";
	
        for (var censusListIndex = 0; censusListIndex < censusList.length; censusListIndex++) {
            var sectionList = censusList[censusListIndex];
            for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
                var questionList = sectionList[sectionListIndex].questionList;
                for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                    var questionResponse = questionList[questionIndex].questionResponse;

                    var questionType = questionList[questionIndex].type;
                    
                    if(questionList[questionIndex].isAQuestion == true && censusDate === "")
                    {
                    	if(questionList[questionIndex].alcrmQuestionID == "CENSUS_DATE")
                    	{
                    		censusDate = questionList[questionIndex].value[0];
                    	}  	
                    }
                    if (questionResponse != null) {
                        if (questionType === "multiSelect") {
                            censusData = censusData + '<cen1:censusData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse) + "</cen1:censusData>";
                        } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                            censusData = censusData + '<cen1:censusData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse) + "</cen1:censusData>";
                        } else {
                            censusData = censusData + "<cen1:censusData>" + Util.escapeXML(questionResponse) + "</cen1:censusData>";
                        }
                    }
                }
            }
        }
        
        var numbers = censusDate.match(/\d+/g); 
		var dateToPost = new Date(numbers[2], numbers[0]-1, numbers[1]);
		
        var xmlRequest =
            "<cen:CreateCensusRequest>" +
            "<cen:census>" +
            "<cen1:crossingId>" + crossingID + "</cen1:crossingId>" +
            "<cen1:censusDate>" + dateToPost.toISOString() + "</cen1:censusDate>" +
            censusData +
            "</cen:census>" +
            "</cen:CreateCensusRequest>";

        return xmlRequest;
    };

    self.buildTrainInfoGroupResponse = function (trainList, crossingID, detailID) {
        var trainData = "";

        for (var trainListIndex = 0; trainListIndex < trainList.length; trainListIndex++) {
            var sectionList = trainList[trainListIndex];

            for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
                var questionList = sectionList[sectionListIndex].questionList;
                for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                    var questionResponse = questionList[questionIndex].questionResponse;

                    var questionType = questionList[questionIndex].type;
                    if (questionResponse != null) {
                        if (questionType === "multiSelect") {
                            trainData = trainData + '<tra1:detailedData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse)  + "</tra1:detailedData>";
                        } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                            trainData = trainData + '<tra1:detailedData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse)  + "</tra1:detailedData>";
                        } else {
                            trainData = trainData + "<tra1:detailedData>" + Util.escapeXML(questionResponse)  + "</tra1:detailedData>";
                        }
                    }
                }
            }
        }

        var xmlRequest =
            "<tra:CreateTrainGroupRequest>" +
            "<tra:trainGroupData>" +
            "<tra1:crossingId>" + crossingID + "</tra1:crossingId>" +
            "<tra1:date>" + new Date().toISOString() + "</tra1:date>" +
            trainData +
            "</tra:trainGroupData>" +
            "</tra:CreateTrainGroupRequest>";

        return xmlRequest;

    };

    self.buildAssessmentResponse = function (sectionList, crossingID, detailID, assNotes) {
        var riskData = "";

        for (var sectionListIndex = 0; sectionListIndex < sectionList.length; sectionListIndex++) {
            var questionList = sectionList[sectionListIndex].questionList;
            for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
                var questionResponse = questionList[questionIndex].questionResponse;

                var questionType = questionList[questionIndex].type;

                if (questionResponse != null) {
                    if (questionType === "multiSelect") {
                        riskData = riskData + '<ass1:riskData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse)  + "</ass1:riskData>";
                    } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                        riskData = riskData + '<ass1:riskData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + Util.escapeXML(questionResponse)  + "</ass1:riskData>";
                    } else {
                        riskData = riskData + "<ass1:riskData>" + Util.escapeXML(questionResponse) + "</ass1:riskData>";
                    }
                }

            } //end of inner for loop
        } //end of outer for loop
        var date = new Date();
        var dateNode = "<ass1:riskData><ques:parameterName>LAST_ASSESSMENT_DATE</ques:parameterName>" +
            "<ques:parameterValue>" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "</ques:parameterValue></ass1:riskData>";
        var xmlRequest =
            "<ass:CreateAssessmentRequest>" +
            "<ass:assessment>" +
            "<ass1:crossingID>" + crossingID + "</ass1:crossingID>" +
            "<ass1:notes>" + Util.escapeXML(assNotes) + "</ass1:notes>";
        //"<ass1:detailId>" + detailID + "</ass1:detailId>" + dateNode +
        riskData +
            "</ass:assessment>" +
            "</ass:CreateAssessmentRequest>";

        return xmlRequest;
    };
    
    self.submitAss = function(assObj)
    {     
    	 var sectionListCen = localDataHandler.getAllCensusesOrTrains(assObj, 0);

	        var xmlCensusRequest = self.buildCensusResponse(sectionListCen, assObj.crossingID, assObj.detailID);
    	if(!(isDebugOn) && assObj.questionCount !== assObj.questionsCompleted)
    	{
    		return;
    	}else{
    		Alloy.Globals.aIndicator.show("Committing...");
    	
	    	/*var Util = require('core/Util');        
		    var newAssessmentForPDF = localDataHandler.createAssessmentPDFResponse(assObj);
		    Util.emailNotes(newAssessmentForPDF);
	        return;   */
	                    
	    	var sectionListAss = localDataHandler.getMainRiskAssessmentQuestions(assObj);
	        var sectionListCen = localDataHandler.getAllCensusesOrTrains(assObj, 0);
	        var sectionListTra = localDataHandler.getAllCensusesOrTrains(assObj, 1);
	        
	        var xmlCensusRequest = self.buildCensusResponse(sectionListCen, assObj.crossingID, assObj.detailID);
	        //Ti.API.info('1activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	        var xmlTrainRequest = self.buildTrainInfoGroupResponse(sectionListTra, assObj.crossingID, assObj.detailID);
	       // Ti.API.info('2activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	        var xmlRequest = self.buildAssessmentResponse(sectionListAss, assObj.crossingID, assObj.detailID, assObj.notes);
			//Ti.API.info('3activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	       
	        var Util = require('core/Util');
	        var newAssessmentForPDF = localDataHandler.createAssessmentPDFResponse(assObj);
	        Util.emailNotes(newAssessmentForPDF);
	
	        //COMMIT CENSUS
	            Alloy.Globals.Soap.createCensus(xmlCensusRequest,
	                function (xmlDoc) {
	                	//Ti.API.info('4activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	                    var XMLTools = require("tools/XMLTools");
	                    var xml = new XMLTools(xmlDoc);
	                    var response = JSON.stringify(xml.toObject());
	                    
					    	 
	                    //Ti.API.info('createCensusRequest Success response >> ' + response);
	                    //Ti.API.info('activeAssessments[assessmentIndex]='+JSON.stringify(activeAssessments[assessmentIndex]));
	                    if (assObj.isSubmitted === false) {
	                    	 Alloy.Globals.Soap.createAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        var XMLTools = require("tools/XMLTools");
			                        var xml = new XMLTools(xmlDoc);
			                        var response = JSON.stringify(xml.toObject());
			                        
			                        assObj.alcrmStatus = "sent";
									localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									
			                        Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){});
	                    }else{
	                    	 Alloy.Globals.Soap.updateAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        var XMLTools = require("tools/XMLTools");
			                        var xml = new XMLTools(xmlDoc);
			                        var response = JSON.stringify(xml.toObject());
									
									assObj.alcrmStatus = "sent";
									localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									
			                        Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){});
	                    }
	                }, function (xmlDoc) {}); //END OF COMMIT CENSUS  
	
	            //COMMIT TRAIN INFO
	            Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest,
	                function (xmlDoc) {
	                    var XMLTools = require("tools/XMLTools");
	                    var xml = new XMLTools(xmlDoc);
	                    var response = JSON.stringify(xml.toObject());
						Ti.API.info('createTrainGroupRequest Success response >> ' + response);
						
						if (assObj.isSubmitted === false) {
	                    	 Alloy.Globals.Soap.createAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        var XMLTools = require("tools/XMLTools");
			                        var xml = new XMLTools(xmlDoc);
			                        var response = JSON.stringify(xml.toObject());
									
									assObj.alcrmStatus = "sent";
									localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									
			                        Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){});
	                    }else{
	                    	 Alloy.Globals.Soap.updateAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        var XMLTools = require("tools/XMLTools");
			                        var xml = new XMLTools(xmlDoc);
			                        var response = JSON.stringify(xml.toObject());
			
									assObj.alcrmStatus = "sent";
									localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									
			                        Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){});
	                    }
	                }, function (xmlDoc) {}); //END OF COMMIT TRAIN INFO
                }
    };//end of test1

    self.commitAllCompleted = function () {
    	var activeAssessments = localDataHandler.getAllSavedAssessments();
    	
        Ti.API.info('activeAssessments='+JSON.stringify(activeAssessments));
        for (var assessmentIndex = 0; assessmentIndex < activeAssessments.length; assessmentIndex++) {
        	self.submitAss(activeAssessments[assessmentIndex]);    	
        }
	};
}

module.exports = responseGenerator;