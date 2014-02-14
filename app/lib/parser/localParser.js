// Local Parser
// ----------------
// deals with parsing the converted JSON.

function localParser() {
	var self = this;
	
	//getQuestions - we pass in a JSON payload (JSON converted by dogfishdata)
	//we then traverse the payload and return the questions.
	self.getQuestions = function(JSONPayload) {
		var questions = null;

		if ( typeof JSONPayload.response.Envelope.Body.GetQuestionsResponse !== "undefined") {
			questions = JSONPayload.response.Envelope.Body.GetQuestionsResponse.questions;
		}

		if ( typeof JSONPayload.response.Envelope.Body.GetCrossingResponse !== "undefined") {
			questions = JSONPayload.response.Envelope.Body.GetCrossingResponse.crossing.detailedData;
		}

		if ( typeof questions === "undefined" || questions === null) {
			questions = [];
		} else if (!( questions instanceof Array)) {
			questions = [questions];
		}

		return questions;
	};

	//getQuestionText
	self.getQuestionText = function(question) {
		return question.text;
	};

	self.getHelpText = function(question) {
		if ( typeof question.helpText !== "undefined") {
			return question.helpText;
		}
		return "";
	};

	self.getNotesText = function(question) {
		if ( typeof question.notesText !== "undefined") {
			return question.notesText;
		}
		return "";
	};

	self.getQuestionName = function(question) {
		return question.parameterName;
	};

	self.getQuestionDisplayGroup = function(question) {
		return question.displayGroup;
	};

	self.getQuestionOrder = function(question) {
		return question.order;
	};

	self.getQuestionGroup = function(question) {
		if ( typeof question !== "undefined") {
			return question.group;
		}
		return "";

	};
	self.getQuestionMandatory = function(question) {
		var validation = self.getValidation(question);
		if ( typeof validation !== "undefined") {
			var mandatory = validation.mandatory;
			if ( typeof mandatory !== "undefined") {
				if (mandatory == "true") {
					return true;
				}
			}
		}
		return false;

	};

	self.getUserResponse = function(question) {
		var questionResponse = question.userResponse;
		if ( typeof questionResponse === "undefined") {
			return null;
		} else
			return questionResponse;
	};

	self.getValidation = function(question) {
		return question.validation;
	};

	self.getConditionalMandatory = function(validation) {

		if ( typeof validation === "undefined") {
			return [];
		}
		var conditionalMandatory = validation.conditionalMandatory;
		if ( typeof conditionalMandatory === "undefined") {
			return [];
		} else if (!( conditionalMandatory instanceof Array)) {
			conditionalMandatory = [conditionalMandatory];
		}

		var returnList = [];
		for (var i = 0; i < conditionalMandatory.length; i++) {
			var parameterValue = conditionalMandatory[i].parameterValue;
			if ( typeof parameterValue === "undefined") {
				parameterValue = null;
			} else {
				parameterValue = parameterValue;
			}

			returnList.push({
				name : conditionalMandatory[i].parameterName,
				value : parameterValue
			});
		}
		return returnList;

	};

	self.getValidationFormat = function(question) {
		return question.validation.format;
	};

	self.isValidationMandatory = function(question) {
		return question.validation.mandatory;
	};

	//get by "type" || by "group"
	self.getBy = function(doc, bytag, value) {
		var all_questions = [];
		for (var i = 0; i < doc.length; i++) {
			var question = doc.item(i);
			if (question.bytag.text === value) {
				all_questions.push(question);
			}
		}

		return all_questions;
	};

	self.getAllSelections = function(question) {
		var selections = question.selections;
		if ( typeof selections === "undefined") {
			selections = [];
		}
		return selections;
	};

	self.getQuestionType = function(question) {
		return question.type;
	};

	self.getSelectionName = function(selection_tag) {
		return selection_tag.name;
	};
	self.getSelectionDisplayValue = function(selection_tag) {
		return selection_tag.displayValue;
	};

	self.getSelectionValue = function(selection_tag) {
		return selection_tag.value;
	};

	self.getRenderValue = function(question) {
		var renderValue = question.renderValue;
		if ( typeof renderValue === "undefined") {
			renderValue = [];
		} else if ( renderValue instanceof Array) {
			return renderValue;
		} else {
			return [renderValue];
		}
		return renderValue;
	};

	self.getRenderValueParamName = function(render_value_tag) {
		return render_value_tag.parameterName;
	};

	self.getRenderValueParamValue = function(render_value_tag) {
		if ( typeof render_value_tag.parameterValue === "undefined") {
			return null;
		}
		return render_value_tag.parameterValue;
	};

	self.getTableRowText = function(question) {
		if ( typeof question.tableDetails === "undefined") {
			return null;
		} else if ( typeof question.tableDetails.rowText === "undefined") {
			return null;
		}
		return question.tableDetails.rowText;
	};
	
	self.getRiskAnalysisOnly = function(question) {
		if ( typeof question.riskAnalysisOnly === "undefined") {
			//Ti.API.info("riskAnalysisOnly == undefined");
			return false;
		} else if ( typeof question.riskAnalysisOnly === "true") {
			//Ti.API.info("riskAnalysisOnly == true");
			return true;
		}else if ( typeof question.riskAnalysisOnly === "false") {
			//Ti.API.info("riskAnalysisOnly == false");
			return false;
		}
		return false;
	};
	
	//

}

module.exports = new localParser; 