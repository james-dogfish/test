function responseGenerator() {
    var self = this;
    var noneToSubmit = 0;
	//var localDataHandler = require('localDataHandler/localDataHandler');
    //var isDebugOn = require('alloy').CFG.debug;
    //var Util = require('core/Util');
    
    

    //the structure of this will probably change (slightly) once we have know exactly what to post back.
   /* self.generateResponse = function (all_questions) {
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
    };*/

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
    
    self.formatDate = function (datum) {
    	var date = new Date(datum);
    	return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
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
                    		censusDate = questionList[questionIndex].value;
                    	}  	
                    }
                    if (questionResponse != null && questionResponse.search("ass1") === -1 && questionResponse.search("tra1") === -1) {
                        if (questionType === "multiSelect") {
                            censusData = censusData + '<cen1:censusData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</cen1:censusData>';
                        } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                            censusData = censusData + '<cen1:censusData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</cen1:censusData>';
                        } else {
                            censusData = censusData + "<cen1:censusData>" + questionResponse + "</cen1:censusData>";
                        }
                    }
                }
            }
        }
         var numbers = "";
         var dateToPost = "";
        if(censusDate != null)
        {
        	alert("DEBUG CensusDate= "+censusDate);
        	numbers = censusDate.match(/\d+/g); 
        	if(numbers !== null){
        		dateToPost = new Date(numbers[2], numbers[0]-1, numbers[1]);
        	}
        }
		
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
                            trainData = trainData + '<tra1:detailedData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse  + '</tra1:detailedData>';
                        } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                            trainData = trainData + '<tra1:detailedData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse  + '</tra1:detailedData>';
                        } else {
                            trainData = trainData + "<tra1:detailedData>" + questionResponse + "</tra1:detailedData>";
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
                        riskData = riskData + '<ass1:riskData xsi:type="ques:multiSelectResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse  + '</ass1:riskData>';
                    } else if (questionType === "dateRange" || questionType === "numericRange" || questionType === "decimalRange" || questionType === "alphaRange") {
                        riskData = riskData + '<ass1:riskData xsi:type="ques:' + questionType + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + questionResponse + '</ass1:riskData>';
                    } else {
                        riskData = riskData + "<ass1:riskData>" + questionResponse + "</ass1:riskData>";
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
            "<ass1:notes>" + Alloy.Globals.Util.escapeXML(assNotes) + "</ass1:notes>";
        //"<ass1:detailId>" + detailID + "</ass1:detailId>" + dateNode +
        riskData +
            "</ass:assessment>" +
            "</ass:CreateAssessmentRequest>";

        return xmlRequest;
    };
    
    self.submitAss = function(assObj)
    {     
    	 var sectionListCen = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 0);

	        var xmlCensusRequest = self.buildCensusResponse(sectionListCen, assObj.crossingID, assObj.detailID);
    	if(!(Alloy.Globals.isDebugOn) && assObj.questionCount !== assObj.questionsCompleted)
    	{
    		Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,responseCode: 2});
    		noneToSubmit++;
    		Ti.API.info("noneToSubmit = "+noneToSubmit);
    		return;
    	}else{
    		Alloy.Globals.aIndicator.show("Committing...");
    	
	    	/*var Util = require('core/Util');        
		    var newAssessmentForPDF = localDataHandler.createAssessmentPDFResponse(assObj);
		    Alloy.Globals.Util.emailNotes(newAssessmentForPDF);
	        return;   */
	                    
	    	var sectionListAss = Alloy.Globals.localDataHandler.getMainRiskAssessmentQuestions(assObj);
	        var sectionListCen = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 0);
	        var sectionListTra = Alloy.Globals.localDataHandler.getAllCensusesOrTrains(assObj, 1);
	        
	        var xmlCensusRequest = self.buildCensusResponse(sectionListCen, assObj.crossingID, assObj.detailID);
	        //Ti.API.info('1activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	        var xmlTrainRequest = self.buildTrainInfoGroupResponse(sectionListTra, assObj.crossingID, assObj.detailID);
	       // Ti.API.info('2activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	        var xmlRequest = self.buildAssessmentResponse(sectionListAss, assObj.crossingID, assObj.detailID, assObj.notes);
			//Ti.API.info('3activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
	       
	        //var Util = require('core/Util');
	        var newAssessmentForPDF = Alloy.Globals.localDataHandler.createAssessmentPDFResponse(assObj);
	        Alloy.Globals.Util.emailNotes(newAssessmentForPDF);
			
			if(assObj.censusDesktopComplete == false){
			        //COMMIT CENSUS
			            Alloy.Globals.Soap.createCensus(xmlCensusRequest,
			                function (xmlDoc) {
			                	//Ti.API.info('4activeAssessments['+assessmentIndex+']='+JSON.stringify(activeAssessments[assessmentIndex]));
			                    //var XMLTools = require("tools/XMLTools");
			                    ///XMLTools.setDoc(xmlDoc);
			                    //var response = JSON.stringify(XMLTools.toObject());
			                    Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
							    	 
			                    //Ti.API.info('createCensusRequest Success response >> ' + response);
			                    //Ti.API.info('activeAssessments[assessmentIndex]='+JSON.stringify(activeAssessments[assessmentIndex]));
			                    if (assObj.isSubmitted === false) {
			                    	 Alloy.Globals.Soap.createAssessment(xmlRequest,
					                    function (xmlDoc) {
					                        //var XMLTools = require("tools/XMLTools");
					                       // XMLTools.setDoc(xmlDoc);
					                        //var response = JSON.stringify(XMLTools.toObject());
					                        
					                        assObj.alcrmStatus = "sent";
											Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
											Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
												
											
					                        //Ti.API.info('createAssessment Success response >> ' + response);
					                        Alloy.Globals.aIndicator.hide();
					                    },function(){
					                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
					                    });
			                    }else{
			                    	 Alloy.Globals.Soap.updateAssessment(xmlRequest,
					                    function (xmlDoc) {
					                        //var XMLTools = require("tools/XMLTools");
					                        //XMLTools.setDoc(xmlDoc);
					                        //var response = JSON.stringify(XMLTools.toObject());
											
											assObj.alcrmStatus = "sent";
											Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
											Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
					                        //Ti.API.info('createAssessment Success response >> ' + response);
					                        Alloy.Globals.aIndicator.hide();
					                    },function(){
					                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
					                    });
			                    }
			                }, function (xmlDoc) {
			                	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
			                }); //END OF COMMIT CENSUS  
			    }else{
			    			if (assObj.isSubmitted === false) {
			                    	 Alloy.Globals.Soap.createAssessment(xmlRequest,
					                    function (xmlDoc) {
					                        //var XMLTools = require("tools/XMLTools");
					                        //XMLTools.setDoc(xmlDoc);
					                        //var response = JSON.stringify(XMLTools.toObject());
					                        
					                        assObj.alcrmStatus = "sent";
											Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
											Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
					                        //Ti.API.info('createAssessment Success response >> ' + response);
					                        Alloy.Globals.aIndicator.hide();
					                    },function(){
					                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
					                    });
			                    }else{
			                    	 Alloy.Globals.Soap.updateAssessment(xmlRequest,
					                    function (xmlDoc) {
					                        //var XMLTools = require("tools/XMLTools");
					                        //XMLTools.setDoc(xmlDoc);
					                        //var response = JSON.stringify(XMLTools.toObject());
											
											assObj.alcrmStatus = "sent";
											Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
											Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
					                        //Ti.API.info('createAssessment Success response >> ' + response);
					                        Alloy.Globals.aIndicator.hide();
					                    },function(){
					                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
					                    });
			                    }
			    }
	
	            //COMMIT TRAIN INFO
	            Alloy.Globals.Soap.createTrainGroupRequest(xmlTrainRequest,
	                function (xmlDoc) {
	                    //var XMLTools = require("tools/XMLTools");
	                    //XMLTools.setDoc(xmlDoc);
	                    //var response = JSON.stringify(XMLTools.toObject());
						//Ti.API.info('createTrainGroupRequest Success response >> ' + response);
						Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
						
						if (assObj.isSubmitted === false) {
	                    	 Alloy.Globals.Soap.createAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        //var XMLTools = require("tools/XMLTools");
			                        //XMLTools.setDoc(xmlDoc);
			                        //var response = JSON.stringify(XMLTools.toObject());
									
									assObj.alcrmStatus = "sent";
									Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
			                        //Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){
			                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
			                    });
	                    }else{
	                    	 Alloy.Globals.Soap.updateAssessment(xmlRequest,
			                    function (xmlDoc) {
			                        //var XMLTools = require("tools/XMLTools");
			                        //XMLTools.setDoc(xmlDoc);
			                        //var response = JSON.stringify(XMLTools.toObject());
			
									assObj.alcrmStatus = "sent";
									Alloy.Globals.localDataHandler.updateSingleAssessmentIndexEntry(assObj);
									Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: true});
			                        //Ti.API.info('createAssessment Success response >> ' + response);
			                        Alloy.Globals.aIndicator.hide();
			                    },function(){
			                    	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
			                    });
	                    }
	                }, function (xmlDoc) {
	                	Ti.App.fireEvent('AssessmentSubmitMessage',{assessmentID: assObj.assessmentId,success: false});
	                }); //END OF COMMIT TRAIN INFO
                }
    };//end of test1

    self.commitAllCompleted = function () {
    	var activeAssessments = Alloy.Globals.localDataHandler.getAllSavedAssessments();
    	
        Ti.API.info('activeAssessments='+JSON.stringify(activeAssessments));
        
        for (var assessmentIndex = 0; assessmentIndex < activeAssessments.length; assessmentIndex++) {
        	self.submitAss(activeAssessments[assessmentIndex]);    	
        }
        if(noneToSubmit === activeAssessments.length)
        {
        	alert("There are currently no risk assessments to submit");
        	noneToSubmit = 0;
    		return;
        }
	};
}

module.exports = new responseGenerator();