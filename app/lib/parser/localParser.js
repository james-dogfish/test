function localParser() {
    var self = this;

    self.parse = function (xml_text) {
        var doc = null;
        if (xml_text) {
            //var XMLTools = require('tools/XMLTools');
            XMLTools.setDoc(xml_text);

            doc = XMLTools.xmlToJson(XMLTools.getDocument());
        } else {
            Ti.API.error("[localParser Err: ] File does not exists");
            //alert("xmltext is null");

        }

        return doc;
    };

    self.getQuestions = function (xml_text) {
    	 var questions = "";
    	 /*Ti.API.info("************************");
    	 Ti.API.info(self.parse(xml_text));
    	 Ti.API.info("************************");*/
    	if(typeof self.parse(xml_text).Body.GetQuestionsResponse !== "undefined")
    	{
    		questions = self.parse(xml_text).Body.GetQuestionsResponse.questions;	
    	}
    	else if(typeof self.parse(xml_text).Body["ns8:GetCrossingResponse"] !== "undefined")
    	{
    		//alert('here');
    		questions = self.parse(xml_text).Body["ns8:GetCrossingResponse"]["ns8:crossing"];
    		//alert(JSON.stringify(questions));
    	}
       
        if (typeof questions === "undefined") {
            questions = [];
        }
        else if(!(questions instanceof Array)){
        	questions=  [questions];
        }
        
        	
        return questions;
        
        
    };

    self.getQuestionText = function (question) {
        return question.text["#text"];
    };
    
    self.getHelpText = function (question) {
    	if(typeof question.help !=="undefined"){
    		return question.help["#text"];
    	}
        return "";
    };
    
    self.getNotesText = function (question) {
    	if(typeof question.notes !=="undefined"){
    		return question.notes["#text"];
    	}
        return "";
    };

    self.getQuestionName = function (question) {
        return question.parameterName["#text"];
    };

    self.getQuestionDisplayGroup = function (question) {
        return question.displayGroup["#text"];
    };

    self.getQuestionOrder = function (question) {
        return question.order["#text"];
    };

    self.getQuestionGroup = function (question) {
    	if(typeof question !=="undefined")
    	{
    		//alert("self.getQuestionGroup >> " + JSON.stringify(question));
       		return question.group["#text"];
    	}
    	return "";
    	
    };
    self.getQuestionMandatory = function (question) {
        var validation = self.getValidation(question);
        if (typeof validation !== "undefined") {
            var mandatory = validation.mandatory;
            if (typeof mandatory !== "undefined") {
                if (mandatory["#text"] == "true") {
                    return true;
                }
            }
        }
        return false;

    };

    self.getUserResponse = function (question) {
        var questionResponse = question.userResponse;
        if (typeof questionResponse === "undefined") {
            return null;
        } else return questionResponse;
    };


    self.getValidation = function (question) {
        return question.validation;
    };

    self.getConditionalMandatory = function (validation) {

        if (typeof validation === "undefined") {
            return [];
        }
        var conditionalMandatory = validation.conditionalMandatory;
        if (typeof conditionalMandatory === "undefined") {
            return [];
        }
        else if(!(conditionalMandatory instanceof Array)){
			conditionalMandatory = [conditionalMandatory];
        }

        var returnList = [];
        for (var i = 0; i < conditionalMandatory.length; i++) {
            var parameterValue = conditionalMandatory[i].parameterValue;
            if (typeof parameterValue === "undefined") {
                parameterValue = null;
            } else {
                parameterValue = parameterValue["#text"];
            }

            returnList.push({
                name: conditionalMandatory[i].parameterName["#text"],
                value: parameterValue
            });
        }
        return returnList;
        
       
    };

    self.getValidationFormat = function (question) {
        return question.validation.format["#text"];
    };

    self.isValidationMandatory = function (question) {
        return question.validation.mandatory["#text"];
    };

    //get by "type" || by "group"
    self.getBy = function (doc, bytag, value) {
        var all_questions = [];
        for (var i = 0; i < doc.length; i++) {
            var question = doc.item(i);
            if (question.bytag.text["#text"] === value) {
                all_questions.push(question);
            }
        }

        return all_questions;
    };

    self.getAllSelections = function (question) {
        var selections = question.selections;
        if (typeof selections === "undefined") {
            selections = [];
        }
        return selections;
    };

    self.getQuestionType = function (question) {
        return question.type["#text"];
    };

    self.getSelectionName = function (selection_tag) {
        return selection_tag.name["#text"];
    };
    self.getSelectionDisplayValue = function (selection_tag) {
        return selection_tag.displayValue["#text"];
    };



    self.getSelectionValue = function (selection_tag) {
        return selection_tag.value["#text"];
    };

    self.getRenderValue = function (question) {
        var renderValue = question.renderValue;
        if (typeof renderValue === "undefined") {
            renderValue = [];
        }
        else if(renderValue instanceof Array){
        	//Ti.API.info("renderValue = "+JSON.stringify(renderValue));
        	return renderValue;
        }
        else{
        	return [renderValue];
        	//Ti.API.info("renderValue = "+JSON.stringify(renderValue));
        }
        return renderValue;
    };

    self.getRenderValueParamName = function (render_value_tag) {
        return render_value_tag.parameterName["#text"];
    };

    self.getRenderValueParamValue = function (render_value_tag) {
    	if (typeof render_value_tag.parameterValue === "undefined") {
    		return null;
    	}
        return render_value_tag.parameterValue["#text"];
    };
    
    self.getTableRowText = function (question) {
    	if (typeof question.tableDetails === "undefined") {
    		return null;
    	}
    	else if (typeof question.tableDetails.rowText === "undefined") {
    		return null;
    	}
        return question.tableDetails.rowText["#text"];
    };

}

module.exports = new localParser;