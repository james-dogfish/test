/**
`interpreterModule2`

@class interpreterModule2
*/
function interpreterModule2() {

	var self = this;

	//`sectionHeaderList` is a list of all sections in the assessment
	self.sectionHeaderList = [];

	//`questionMap` used questionObject.name as a key and stores all questions.
	var questionMap = [];

	//`renderDependenciesMap` used questionObject.name as a key and stores all questions that have 
	//visibility dependency on the elemnent in the map.
	var renderDependenciesMap = [];

	//`mandatoryDependenciesMap` used questionObject.name as a key and stores all questions that have 
	//mandatory dependency on the elemnent in the map.	
	var mandatoryDependenciesMap = [];

	//`removedSectionsMap` uses the cms ConfigFile to remove sections from the dataSet. 
	//removedSectionsMap uses a groupType as the key, useing `if(groupType in removedSectionsMap)`
	var removedSectionsMap = [];
	
	//`removedQuestionsMap` uses the cms ConfigFile to remove questions from the dataSet. 
	//removedQuestionsMap uses a questionName as the key, useing `if(questionName in removedQuestionsMap)`
	var removedQuestionsMap = [];
	
	//`hiddenQuestionsMap` uses the cms ConfigFile to hide questions in question renderer. 
	//hiddenQuestionsMap uses a questionName as the key, useing `if(questionName in hiddenQuestionsMap)`
	var hiddenQuestionsMap = [];
	
	//`censusCounterQuestionMap` uses the cms ConfigFile to set question templates to censusCounterTemplate. 
	//censusCounterQuestionMap uses a questionObject.alcrmQuestionID as the key, useing `if(questionObject.alcrmQuestionID in censusCounterQuestionMap)`
	var censusCounterQuestionMap = [];
	
	//`timerPickerQuestionMap` uses the cms ConfigFile to set question templates to timerPickerTemplate. 
	//timerPickerQuestionMap uses a questionObject.alcrmQuestionID as the key, useing `if(questionObject.alcrmQuestionID in timerPickerQuestionMap)`
	var timerPickerQuestionMap = [];

	//`ui_types_map` is used to map server question types to question templates
	var ui_types_map = {};
	ui_types_map["date"] = "dateTemplate";
	ui_types_map["alpha"] = "textFieldTemplate";
	ui_types_map["radio"] = "singleSelectTemplate";
	ui_types_map["select"] = "singleSelectTemplate";
	ui_types_map["alphanumeric"] = "textFieldTemplate";
	ui_types_map["numeric"] = "textFieldTemplate";
	ui_types_map["multiSelect"] = "multiSelectTemplate";
	ui_types_map["decimal"] = "textFieldTemplate";
	ui_types_map["dateRange"] = "dateRangeTemplate";
	ui_types_map["numericRange"] = "rangeFieldTemplate";
	ui_types_map["decimalRange"] = "rangeFieldTemplate";
	ui_types_map["alphaRange"] = "rangeFieldTemplate";

/**
`getSectionDisplayName` depending on the page type of a section, the display name will be genrated
differently from the `firstTab` and `secondTab` nodes

@method setEntireSectionTemplate

@param {JSON_obejct} question  the question object from the server.
@param {JSON_obejct} passObject  this is the settings object for this question set file.

@return {string} question DisplayName
*/
	var getSectionDisplayName = function(question, passObject) {

		try {
			var displayName = "N/A";

			if (passObject.pageType == "riskAssessment") {

				if ( typeof question.firstTab !== "undefined") {
					displayName = question.firstTab;

				}
				if ( typeof question.secondTab !== "undefined") {

					displayName = displayName + " " + question.secondTab;
				}
				return displayName;
			}

			if ( typeof question.firstTab !== "undefined") {
				displayName = question.firstTab;

			}

			if ( typeof question.secondTab !== "undefined") {

				displayName = question.secondTab;
			}

			return displayName;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception occured in getSectionDisplayName. Error Details: " + JSON.stringify(e), "info");
			return "";
		}
	};

/**
`createCensusDateQuestion` this is a new question added top the top of census general.

@method createCensusDateQuestion

@param {JSON_obejct} passObject  this is the settings object for this question set file.
@param {JSON_obejct} section  secified what section to add thr question to.

@return {JSON_obejct} (success) questionObject
@return {null} (fail) when the question fails
*/
	var createCensusDateQuestion = function(passObject, section) {
		try {
			var questionObject = {
				isAQuestion : true,
				template : "dateTemplate", // this is the template used to show the question in the list view
				type : "date", // this is the alcrem question type
				groupType : section.groupType,
				alcrmGroupType : section.alcrmGroupType,
				name : passObject.pageID + "I_CENSUS_DATE", // this is the id of the question
				alcrmQuestionID : "I_CENSUS_DATE",
				visable : true,
				order : "1",
				associatedFileName : passObject.associatedFileName, // file the question is in
				
				btnSelect : {touchTestId :passObject.pageID + "I_CENSUS_DATE" + "button1"},

				assessmentId : passObject.assessmentId,

				backgroundView : Alloy.Globals.Styles["normalQuestionBackground"],

				notesBackground : {
					backgroundImage : 'images/questionNote.png',
					touchTestId : passObject.pageID + "I_CENSUS_DATE" + "_notesButton"
				}, //{backgroundImage: 'images/questionSelectedNote.png'}
				notes : "",
				alcrmNotes : "I_CENSUS_DATE Notes",
				help : "",
				selected : false,
				value : [""], // a list of all values set for this question
				renderValue : [], // a list of condtions if the question is visable
				selections : [], // a list of possible values for the question
				duration : null, //used in the timerPickerQuestions template
				validation : {
					validationTest : false,
					min : null,
					max : null,
					minLength : null,
					maxLength : null,
					format : null,
					mandatory : false,
					conditionalMandatory : []
				},
				mandatory : true, //can be changed at run time with conditionalMandatory
				subsectionTitle : null,
				title : {
					text : "Date of Census",
					font : {"fontSize":"20sp","fontFamily":"Helvetica Neue","fontWeight":"normal"}
				}, // the title text for this question
				displayValue : {
					value : "",
					touchTestId : passObject.pageID + "I_CENSUS_DATE" + "displayValue1"
				},
				displayValue2 : {
					value : "",
					touchTestId : passObject.pageID + "I_CENSUS_DATE" + "displayValue2"
				},

				questionResponse : null,

				errorMessageVisable : false,
				questionErrorMessageView : {},
				questionErrorMessage : {},

				renderDependencyList : [],
				mandatoryDependenciesList : [],
				headerView : {}
			};
			questionObject = questionSetPastVariables(questionObject, passObject.questionMap);
			return questionObject;
			
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			return null;
		}

	};

/**
`createQuestionObject` this function will build a question from the JSON from the server

@method createQuestionObject

@param {JSON_obejct} question the server JSON object of a question
@param {JSON_obejct} passObject this is the settings object for this question set file.
@param {String} sectionGroupType 
@param {String} assessmentId
@param {MAP} questionMap this is a map of question names and values for a saved pre populated question

@return {JSON_obejct} (success) questionObject
@return {null} (fail) when the question fails to build
*/
	var createQuestionObject = function(question, passObject, sectionGroupType, assessmentId) {

		try {

			var questionName = passObject.pageID + Alloy.Globals.localParser.getQuestionName(question);
			var type = Alloy.Globals.localParser.getQuestionType(question);
			var templateType = "";
			if ( type in ui_types_map) {
				templateType = ui_types_map[type];
			} else {
				Alloy.Globals.Logger.log("questionNull type =" + type+", question = "+JSON.stringify(question), "info");
				return null;
			}

			if (Alloy.Globals.localParser.getRiskAnalysisOnly(question) == true) {
				Alloy.Globals.Logger.log("getRiskAnalysisOnly == true, question name = " + questionName, "info");
				return null;
			}

			if (Alloy.Globals.localParser.getQuestionName(question) in removedQuestionsMap) {
				return null;
			}

			questionRenderValues = [];
			var allRenderValues = Alloy.Globals.localParser.getRenderValue(question);
			var questionVisable = true;

			if (allRenderValues.length != 0) {
				questionVisable = false;
			}

			for (var i = 0; i < allRenderValues.length; i++) {

				dependencieName = passObject.pageID + Alloy.Globals.localParser.getRenderValueParamName(allRenderValues[i]);
				dependencieValue = Alloy.Globals.localParser.getRenderValueParamValue(allRenderValues[i]);

				if ( typeof renderDependenciesMap[dependencieName] === "undefined") {
					renderDependenciesMap[dependencieName] = [];
				}
				renderDependenciesMap[dependencieName].push(questionName);

				questionRenderValues.push({
					question : {
						name : dependencieName,
						groupType : ""
					},
					value : dependencieValue
				});
			}

			questionSelections = [];
			var allSelections = Alloy.Globals.localParser.getAllSelections(question);
			for (var i = 0; i < allSelections.length; i++) {
				questionSelections.push({
					displayValue : Alloy.Globals.localParser.getSelectionDisplayValue(allSelections[i]),
					value : Alloy.Globals.localParser.getSelectionValue(allSelections[i])
				});
			}

			var questionValidation = {
				validationTest : false,
				min : null,
				max : null,
				minLength : null,
				maxLength : null,
				format : null,
				mandatory : false,
				conditionalMandatory : []
			};

			var validation = Alloy.Globals.localParser.getValidation(question);

			var isMandatory = false;

			if ( typeof validation !== "undefined") {
				questionValidation.validationTest = true;

				var mandatory = validation.mandatory;
				if ( typeof mandatory !== "undefined") {
					if (mandatory == "true") {
						questionValidation.mandatory = true;
						isMandatory = true;
					}
				}

				var conditionalMandatory = Alloy.Globals.localParser.getConditionalMandatory(validation);
				for (var i = 0; i < conditionalMandatory.length; i++) {

					var dependencieName = passObject.pageID + conditionalMandatory[i].name;
					questionValidation.conditionalMandatory.push({
						question : {
							name : dependencieName,
							groupType : ""
						},
						value : conditionalMandatory[i].value
					});

					if ( typeof mandatoryDependenciesMap[dependencieName] === "undefined") {
						mandatoryDependenciesMap[dependencieName] = [];
					}
					mandatoryDependenciesMap[dependencieName].push(questionName);

				}

				if ( typeof validation.min !== "undefined") {
					questionValidation.min = parseInt(validation.min);
				}

				if ( typeof validation.max !== "undefined") {
					questionValidation.max = parseInt(validation.max);
				}

				if ( typeof validation.minLength !== "undefined") {
					questionValidation.minLength = parseInt(validation.minLength);
				}

				if ( typeof validation.maxLength !== "undefined") {
					questionValidation.maxLength = parseInt(validation.maxLength);
				}

				if ( typeof validation.format !== "undefined") {
					questionValidation.format = validation.format;
				}
			}

			var questionObject = {
				isAQuestion : true,
				template : templateType, // this is the template used to show the question in the list view
				type : type,
				groupType : sectionGroupType,
				name : passObject.pageID + Alloy.Globals.localParser.getQuestionName(question),
				alcrmQuestionID : Alloy.Globals.localParser.getQuestionName(question),
				alcrmGroupType : Alloy.Globals.localParser.getQuestionGroup(question),
				visable : questionVisable,
				readOnly : false,
				backgroundView : Alloy.Globals.Styles["normalQuestionBackground"],
				order : Alloy.Globals.localParser.getQuestionOrder(question),
				associatedFileName : passObject.associatedFileName, // file the question is in
				questionResponse : null,
				
				btnSelect : {touchTestId :passObject.pageID + Alloy.Globals.localParser.getQuestionName(question)+"_button1"},

				assessmentId : assessmentId,

				notesBackground : {
					backgroundImage : 'images/questionNote.png',
					touchTestId : passObject.pageID + Alloy.Globals.localParser.getQuestionName(question) + "_notesButton"
				}, //{backgroundImage: 'images/questionSelectedNote.png'}
				notes : "",
				alcrmNotes : Alloy.Globals.localParser.getNotesText(question),
				help : Alloy.Globals.localParser.getHelpText(question),
				selected : false,

				value : [""], // a list of all values set for this question
				renderValue : questionRenderValues, // a list of condtions if the question is visable
				selections : questionSelections, // a list of possible values for the question
				validation : questionValidation,
				mandatory : isMandatory, //can be changed at run time with conditionalMandatory

				duration : null, //used in the timerPickerQuestions template

				subsectionTitle : Alloy.Globals.localParser.getTableRowText(question),

				title : {
					text : Alloy.Globals.localParser.getQuestionText(question),
					font : {"fontSize":"20sp","fontFamily":"Helvetica Neue","fontWeight":"normal"}
				}, // the title text for this question
				displayValue : {
					value : "",
					touchTestId : passObject.pageID + Alloy.Globals.localParser.getQuestionName(question) + "_displayValue1"
				},
				displayValue2 : {
					value : "",
					touchTestId : passObject.pageID + Alloy.Globals.localParser.getQuestionName(question) + "_displayValue2"
				},

				errorMessageVisable : false,
				questionErrorMessageView : {},
				questionErrorMessage : {},

				renderDependencyList : [],
				mandatoryDependenciesList : [],
				headerView : {}
			};

			if (passObject.readOnly == true) {
				questionObject.readOnly = true;
				questionObject.headerView = Alloy.Globals.Styles["headerViewReadOnly"];
			}

			questionObject = questionSetPastVariables(questionObject, passObject.questionMap);

			self.questionMap[questionObject.name] = questionObject;
			return questionObject;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in createQuestionObject >> " + JSON.stringify(e), "info");
			return null;
		}
	};

/**

/`questionSetPastVariables` populates a question value with stored values from the sever

@method questionSetPastVariables

@param {JSON_obejct} questionObject this is the genderated question object from createQuestionObject
@param {Map} questionMap this is a map of question names and values for a saved pre populated question

@return {JSON_obejct} questionObject
*/
	var questionSetPastVariables = function(questionObject, questionMap) {

		try {
			if (questionObject.alcrmQuestionID in questionMap) {
				if (questionObject.template === "dateTemplate" || questionObject.template === "textFieldTemplate") {
					
					if ( typeof questionMap[questionObject.alcrmQuestionID].value === "undefined"){
						return questionObject;
					}

					questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
					questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];
					
					 questionObject.questionResponse =
	    				"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
	    				"<ques:parameterValue>"+questionObject.displayValue.value+"</ques:parameterValue>";

				} else if (questionObject.template === "singleSelectTemplate") {
					if ( typeof questionMap[questionObject.alcrmQuestionID].value === "undefined"){
						return questionObject;
					}
					
					questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
					questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];
					
					questionObject.questionResponse =
	    				"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
	    				"<ques:parameterValue>"+questionObject.value[0]+"</ques:parameterValue>";

					for (var i = 0; i < questionObject.selections.length; i++) {
						if (questionObject.selections[i].value === questionMap[questionObject.alcrmQuestionID].value) {
							questionObject.displayValue.value = questionObject.selections[i].displayValue;
							
							
							break;
						}
					}
				} else if (questionObject.template === "multiSelectTemplate") {
					
					if ( typeof questionMap[questionObject.alcrmQuestionID].value === "undefined"
						 || !(questionMap[questionObject.alcrmQuestionID].value instanceof Array)){
						return questionObject;
					}
					
					questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
					questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];

					var temp = "";
											
					var valueResponse = "";
					
						
					for (var t = 0; t < questionMap[questionObject.alcrmQuestionID].value.length; t++) {
						
							valueResponse+="<ques:parameterValue>"+questionMap[questionObject.alcrmQuestionID].value[t]+"</ques:parameterValue>";
					
						
						for (var i = 0; i < questionObject.selections.length; i++) {
							if (questionObject.selections[i].value === questionMap[questionObject.alcrmQuestionID].value[t]) {
								if (temp === "") {
									temp = questionObject.selections[i].displayValue;
								} else {
									temp += ", " + questionObject.selections[i].displayValue;
								}

							}
						}
					}
				

					questionObject.displayValue.value = temp;
					
					
					questionObject.questionResponse =
	    				"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+valueResponse;
	    				
	    				
	    				
				} else if (questionObject.template === "rangeFieldTemplate" || questionObject.template === "dateRangeTemplate") {
					if ( typeof questionMap[questionObject.alcrmQuestionID].value !== "undefined" && questionMap[questionObject.alcrmQuestionID].value instanceof Array) {
						if (questionMap[questionObject.alcrmQuestionID].value.length >= 2) {
							questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value[0];
							questionObject.displayValue2.value = questionMap[questionObject.alcrmQuestionID].value[1];
						}
					}
				}
			}

			return questionObject;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in questionSetPastVariables >> " + JSON.stringify(e), "info");
			return questionObject;
		}
	};

/**
`addQuestionToSectionHeader` called by interpret, will add an object from `createQuestionObject()` to a 
section

@method addQuestionToSectionHeader

@param {JSON_obejct} question
@param {JSON_obejct} passObject
@param {String} assessmentId

@return n/a
*/
	var addQuestionToSectionHeader = function(question, passObject, assessmentId) {

		try {
			var alcrmGroupType = Alloy.Globals.localParser.getQuestionGroup(question);
			var groupType = passObject.pageID + alcrmGroupType;

			for (var i = 0; i < self.sectionHeaderList.length; i++) {
				if (groupType == self.sectionHeaderList[i].groupType) {
					var newQuestionObject = createQuestionObject(question, passObject, groupType, assessmentId, passObject.questionMap);

					if (newQuestionObject != null) {
						self.sectionHeaderList[i].questionList.push(newQuestionObject);
					}
					return;
				}
			}

			var newSectionHeader = {
				title : getSectionDisplayName(question, passObject),
				groupType : groupType,
				alcrmGroupType : alcrmGroupType,
				pageName : passObject.pageName,
				pageType : passObject.pageType,
				pageID : passObject.pageID,
				associatedFileName : passObject.associatedFileName,
				questionList : []
			};
			var newQuestionObject = createQuestionObject(question, passObject, groupType, assessmentId, passObject.questionMap);
			if (newQuestionObject != null) {
				newSectionHeader.questionList.push(newQuestionObject);
			}
			self.sectionHeaderList.push(newSectionHeader);
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in addQuestionToSectionHeader >> " + JSON.stringify(e), "info");
			return;
		}
	};

/**
`testIfQuestionMandatory` called in `postInterpretSettings()` will test if a question 
should be displayed as mandatory

@method testIfQuestionMandatory

@param {JSON_obejct} questionObject

@return {JSON_obejct} questionObject
*/
	var testIfQuestionMandatory = function(questionObject) {

		var conditionalMandatoryList = questionObject.validation.conditionalMandatory;
		for (var conditionalMandatoryIndex = 0; conditionalMandatoryIndex < conditionalMandatoryList.length; conditionalMandatoryIndex++) {

			if (conditionalMandatoryList[conditionalMandatoryIndex].question.name in self.questionMap) {

				var questionValues = self.questionMap[conditionalMandatoryList[conditionalMandatoryIndex].question.name].value;

				for (var questionValuesIndex = 0; questionValuesIndex < questionValues.length; questionValuesIndex++) {
					if (questionValues[questionValuesIndex] == conditionalMandatoryList[conditionalMandatoryIndex].value) {

						mandatory = true;

						if (questionObject.title.text.slice(-1) != "*") {
							questionObject.title.text = questionObject.title.text + "*";
							questionObject.title.font = Alloy.Globals.Styles["titleFontMandatory"];
						}

						return questionObject;
					}
				}
			}
		}

		return questionObject;
	};

/**
`testIfQuestionVisable` called in `postInterpretSettings()` will test if a question 
should be displayed or hidden

@method testIfQuestionVisable

@param {JSON_obejct} questionObject

@return {JSON_obejct} questionObject
*/
	var testIfQuestionVisable = function(questionObject) {

		for (var renderValueIndex = 0; renderValueIndex < questionObject.renderValue.length; renderValueIndex++) {

			if (questionObject.renderValue[renderValueIndex].question.name in self.questionMap) {
				var questionValues = self.questionMap[questionObject.renderValue[renderValueIndex].question.name].value;

				for (var questionValuesIndex = 0; questionValuesIndex < questionValues.length; questionValuesIndex++) {
					if (questionValues[questionValuesIndex] == questionObject.renderValue[renderValueIndex].value) {

						questionObject.visable = true;
						return questionObject;
					}
				}
			}
		}

		return questionObject;
	};

/**
`lookQuestionDependencies` will build up a list for all qustions a renderDependencyList
and mandatoryDependenciesList. these are list of questions that are dependent on the value of the question

@method lookQuestionDependencies

@return n/a
*/
	var lookQuestionDependencies = function() {
		try {

			for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
				for (var questionIndex = 0; questionIndex < self.sectionHeaderList[sectionIndex].questionList.length; questionIndex++) {

					var name = self.sectionHeaderList[sectionIndex].questionList[questionIndex].name;

					//adds a list of all questions that have a Dependencies on if it is visable based on this question
					if ( typeof renderDependenciesMap[name] !== "undefined") {

						//creates a list of Dependent question names with no repeated names
						var questionNameArray = renderDependenciesMap[name];
						questionNameArray = questionNameArray.filter(function(elem, pos) {
							return questionNameArray.indexOf(elem) == pos;
						});

						//builds a list objects for all of the render Dependent question for this question
						renderDependenciesQuestionList = [];
						for (var i = 0; i < questionNameArray.length; i++) {
							if (questionNameArray[i] in self.questionMap) {
								renderDependenciesQuestionList.push({
									name : questionNameArray[i],
									groupType : self.questionMap[questionNameArray[i]].groupType
								});

							}
						}

						self.sectionHeaderList[sectionIndex].questionList[questionIndex].renderDependencyList = renderDependenciesQuestionList;
					}

					//adds a list of all questions that have a Dependencies on if it is mandatory based on this question
					if ( typeof mandatoryDependenciesMap[name] !== "undefined") {

						//creates a list of Dependent question names with no repeated names
						var questionNameArray = mandatoryDependenciesMap[name];
						questionNameArray = questionNameArray.filter(function(elem, pos) {
							return questionNameArray.indexOf(elem) == pos;
						});

						//builds a list objects for all of the render Dependent question for this question
						mandatoryDependenciesQuestionList = [];
						for (var i = 0; i < questionNameArray.length; i++) {
							if (questionNameArray[i] in self.questionMap) {
								mandatoryDependenciesQuestionList.push({
									name : questionNameArray[i],
									groupType : self.questionMap[questionNameArray[i]].groupType
								});
							}
						}

						self.sectionHeaderList[sectionIndex].questionList[questionIndex].mandatoryDependenciesList = mandatoryDependenciesQuestionList;
					}

				}
			}

		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in lookQuestionDependencies >> " + JSON.stringify(e), "info");
		}
	};

/**
`addQuestionToSubsectionList` called buy `addSubsections`. adds a question to its respective subsection list.
is used to group questions of the same subGroup together.

@method addQuestionToSubsectionList

@param {JSON_List} subSectionList
@param {JSON_obejct} question

@return {List of JSON_obejct} subSectionList
*/
	var addQuestionToSubsectionList = function(subSectionList, question) {

		for (var i = 0; i < subSectionList.length; i++) {
			if (subSectionList[i].title == question.subsectionTitle) {
				subSectionList[i].questionList.push(question);
				return subSectionList;
			}
		}

		var newSubsection = {
			title : question.subsectionTitle,
			questionList : [],
			order : question.order
		};
		newSubsection.questionList.push(question);
		subSectionList.push(newSubsection);
		return subSectionList;
	};

/**
`createSubsectionHeader` called buy `addSubsections`.  used to create a subsection header to add to the question list
using the template subsectionHeaderTemplate

@method createSubsectionHeader

@param {String} title

@return {JSON_obejct} subsectionHeader
*/
	var createSubsectionHeader = function(title) {
		try {
			return {
				isAQuestion : false,
				readOnly : false,
				template : "subsectionHeaderTemplate",
				headerView : Alloy.Globals.Styles["headerViewSubsection"],
				title : {
					text : title,
					font : {"fontSize":"20sp","fontFamily":"Helvetica Neue","fontWeight":"bold"}
				},
				visable : true,
				name : "",
				questionToChangeTemplate : "singleSelectTemplate",
				selections : [{
					displayValue : "Yes",
					value : 1
				}, {
					displayValue : "No",
					value : 0
				}],
				renderValue : []
			};
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in createSubsectionHeader >> " + JSON.stringify(e), "info");
			return null;
		}
	};

/**
`addSubsectionsBackIntoQuestionList` called buy `addSubsections`. when all of the question in a secion have been added in to there
relevent subsections, this function is called to insert the questions back in to the main question list

@method addSubsectionsBackIntoQuestionList

@param {JSON_List} questionList
@param {JSON_List} subSectionList

@return {List of JSON_obejct} questionList
*/
	var addSubsectionsBackIntoQuestionList = function(questionList, subSectionList) {

		try {
			var subSectionIndex = 0;
			var newQuestionList = [];
			
			if(subSectionList.length == 0){
				return questionList;
			}
			
			for (var questionIndex = 0; questionIndex < questionList.length; questionIndex++) {
				if (questionList[questionIndex].subsectionTitle != null) {
					continue;
				} else if ( typeof questionList[questionIndex].order === "undefined") {
					newQuestionList.push(questionList[questionIndex]);
				} else if (subSectionIndex >= subSectionList.length){
					newQuestionList.push(questionList[questionIndex]);
				}
				else if (parseInt(subSectionList[subSectionIndex].order) < parseInt(questionList[questionIndex].order)) {

					newQuestionList.push(createSubsectionHeader(subSectionList[subSectionIndex].title));

					//subsectionHeaderTemplate
					for (var subSectionQuestionIndex = 0; subSectionQuestionIndex < subSectionList[subSectionIndex].questionList.length; subSectionQuestionIndex++) {
						newQuestionList.push(subSectionList[subSectionIndex].questionList[subSectionQuestionIndex]);
					}
					subSectionIndex++;
					questionIndex--;
				}
				else{
					newQuestionList.push(questionList[questionIndex]);
				}
			}

			for (subSectionIndex; subSectionIndex < subSectionList.length; subSectionIndex++) {

				newQuestionList.push(createSubsectionHeader(subSectionList[subSectionIndex].title));

				for (var subSectionQuestionIndex = 0; subSectionQuestionIndex < subSectionList[subSectionIndex].questionList.length; subSectionQuestionIndex++) {
					newQuestionList.push(subSectionList[subSectionIndex].questionList[subSectionQuestionIndex]);
				}
				subSectionIndex++;
			}

			return newQuestionList;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in addSubsectionsBackIntoQuestionList >> " + JSON.stringify(e), "info");
			return [];
		}
	};

/**
`addSubsections` loops through all sections and creates any subsections need. is the root function 

@method addSubsections

@return n/a
*/
	var addSubsections = function() {
		try {
			for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
				if (self.sectionHeaderList[sectionIndex].alcrmGroupType == "Sighting") {

					var subSectionList = [];

					var oldQuestionList = self.sectionHeaderList[sectionIndex].questionList;
					for (var questionIndex = 0; questionIndex < oldQuestionList.length; questionIndex++) {

						if (oldQuestionList[questionIndex].subsectionTitle != null) {
							addQuestionToSubsectionList(subSectionList, oldQuestionList[questionIndex]);
						}

					}

					self.sectionHeaderList[sectionIndex].questionList = addSubsectionsBackIntoQuestionList(oldQuestionList, subSectionList);
				}
			}
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in addSubsections >> " + JSON.stringify(e), "info");
			return;
		}
	};

/**
`postInterpretSettings` this is called to add any hard coded effect to the question set

@method postInterpretSettings

@param {JSON_obejct} passObject

@return n/a
*/
	var postInterpretSettings = function(passObject) {
		try {
			var userPreferences = Alloy.Globals.User.getPreferences();

			for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {

				if (self.sectionHeaderList[sectionIndex].alcrmGroupType in removedSectionsMap) {
					self.sectionHeaderList.splice(sectionIndex, 1);
					sectionIndex = sectionIndex - 1;
				} else if (self.sectionHeaderList[sectionIndex].alcrmGroupType == "Photograph") {
					var selections = [{
							displayValue : "YES 1",
							value : 1
						}, {
							displayValue : "NO 1",
							value : 0
						}];
					
					if("0I_UPSIDE_APPROACH" in self.questionMap) {
						selections = self.questionMap["0I_UPSIDE_APPROACH"].selections;
					}
					
					
					var newRow = {
						isAQuestion : false,
						readOnly : false,
						template : "setEntireSectionTemplate",

						title : {
							text : "Set all photograph questions to",
							font : {"fontSize":"20sp","fontFamily":"Helvetica Neue","fontWeight":"normal"}
						},
						visable : true,
						name : "",
						questionToChangeTemplate : "singleSelectTemplate",
						selections : selections,
						renderValue : []
					};
					self.sectionHeaderList[sectionIndex].questionList.unshift(newRow);
					//adds row to front of the list
				} else if (self.sectionHeaderList[sectionIndex].alcrmGroupType == "CensusGeneral") {
					self.sectionHeaderList[sectionIndex].questionList.unshift(createCensusDateQuestion(passObject, self.sectionHeaderList[sectionIndex]));
				}

				for (var questionIndex = 0; questionIndex < self.sectionHeaderList[sectionIndex].questionList.length; questionIndex++) {

					if (self.sectionHeaderList[sectionIndex].questionList[questionIndex] == null) {
						self.sectionHeaderList[sectionIndex].questionList[questionIndex].splice(questionIndex, 1);
						questionIndex--;
						Alloy.Globals.Logger.log("question object is null!!!", "info");
					};

					if (self.sectionHeaderList[sectionIndex].questionList[questionIndex].isAQuestion == false)
						continue;

					var questionObject = self.sectionHeaderList[sectionIndex].questionList[questionIndex];

					if (questionObject.alcrmQuestionID in hiddenQuestionsMap) {
						questionObject.visable = false;
						questionObject.renderDependencyList = [];
					}
					if (questionObject.alcrmQuestionID in censusCounterQuestionMap) {
						questionObject.template = "censusCounterTemplate";
						questionObject.value[0] = "0";
						questionObject.displayValue.value = "0";
						
					    questionObject.questionResponse =
					    	"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
					    	"<ques:parameterValue>"+"0"+"</ques:parameterValue>";
					}

					if (questionObject.alcrmQuestionID in timerPickerQuestionMap) {
						questionObject.template = "minuteHourTimeTemplate";
						questionObject.type = "timerPicker";
						questionObject.duration = timerPickerQuestionMap[questionObject.alcrmQuestionID];
					}
					
					if(Alloy.CFG.debug == true && questionObject.alcrmQuestionID == "I_CENSUS_TYPE"){
						questionObject.template = "textFieldTemplate";
						questionObject.notesBackground.backgroundImage = 'images/questionSelectedNote.png';
						questionObject.notes = "full(24 hours) = 19, quick = 20, estimated(24) = 745, estimated = 21";
					}

					questionObject = testIfQuestionVisable(questionObject);
					questionObject = testIfQuestionMandatory(questionObject);

					if (questionObject.mandatory == true) {
						if (questionObject.title.text.slice(-1) != "*") {
							questionObject.title.text = questionObject.title.text + "*";
							questionObject.title.font.fontWeight = "bold";
						}
					}

					if (passObject.readOnly == true) {
						questionObject.readOnly = true;
						questionObject.mandatory = false;
						questionObject.displayValue.clearButtonMode = false;
						questionObject.displayValue.touchEnabled  = false;
						questionObject.template = "textFieldTemplate";
						questionObject.headerView = Alloy.Globals.Styles["headerViewReadOnly"];
						if (questionObject.title.text.slice(-1) == "*") {
							questionObject.title.text = questionObject.title.text.substring(0, questionObject.title.text.length - 1);
							questionObject.title.font.fontWeight = "normal";
						}
					}
					
					if (passObject.pageType == "trainInfo" && parseInt(passObject.pageID) > 1) {
						questionObject.mandatory = false;
						questionObject.validation.mandatory  = false;
						questionObject.validation.conditionalMandatory = [];
						questionObject.title.font.fontWeight = "normal";
						if (questionObject.title.text.slice(-1) == "*") {
							questionObject.title.text = questionObject.title.text.substring(0, questionObject.title.text.length - 1);
						
						}
					}

					if (questionObject.type === "numeric") {
						questionObject.displayValue.keyboardType = Ti.UI.KEYBOARD_NUMBER_PAD;
					}
					if (questionObject.type === "decimal") {
						if(Alloy.Globals.Util.isIOS7Plus()){
							questionObject.displayValue.keyboardType = Ti.UI.KEYBOARD_DECIMAL_PAD;
						}
						else{
							questionObject.displayValue.keyboardType = Ti.UI.KEYBOARD_NUMBER_PAD;
						}
					}
					if (Ti.App.deployType === 'test' && questionObject.alcrmQuestionID == "I_CENSUS_TYPE") {
						questionObject.template = "textFieldTemplate";
					}

					if (questionObject.alcrmQuestionID == "I_COLLECTOR_NAME") { 
						questionObject.value = [userPreferences.name];
						questionObject.mandatory = false;
						questionObject.displayValue = {
							value : userPreferences.name
						};
						questionObject.questionResponse =
					    	"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
					    	"<ques:parameterValue>"+userPreferences.name+"</ques:parameterValue>";
					    	
					} else if (questionObject.alcrmQuestionID == "PHONE_NUMBER") {
						questionObject.value = [userPreferences.mobile];
						questionObject.mandatory = false;
						questionObject.displayValue = {
							value : userPreferences.mobile
						};
						questionObject.questionResponse =
					    	"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
					    	"<ques:parameterValue>"+userPreferences.mobile+"</ques:parameterValue>";
					    	
					} else if (questionObject.alcrmQuestionID == "EMAIL_ADDRESS") {
						questionObject.value = [userPreferences.email];
						questionObject.mandatory = false;
						questionObject.displayValue = {
							value : userPreferences.email
						};
						questionObject.questionResponse =
					    	"<ques:parameterName>"+questionObject.alcrmQuestionID+"</ques:parameterName>"+
					    	"<ques:parameterValue>"+userPreferences.email+"</ques:parameterValue>";
					    	
					} else if (questionObject.alcrmQuestionID == "I_CENSUS_QUICK_START") {
						questionObject.template = "censusStartTimerTemplate";
					}

					for (var renderValueIndex = 0; renderValueIndex < questionObject.renderValue.length; renderValueIndex++) {
						if (questionObject.renderValue[renderValueIndex].question.name in self.questionMap) {
							questionObject.renderValue[renderValueIndex].question.groupType = self.questionMap[questionObject.renderValue[renderValueIndex].question.name].groupType;
						} else {
							Alloy.Globals.Logger.log("interpreterModule2 :: NOT FOUND = " + questionObject.renderValue[renderValueIndex].question.name, "info");
						}
					}

					for (var conditionalMandatoryIndex = 0; conditionalMandatoryIndex < questionObject.validation.conditionalMandatory.length; conditionalMandatoryIndex++) {
						if (questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name in self.questionMap) {

							questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.groupType = self.questionMap[questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name].groupType;
						} else {
							Alloy.Globals.Logger.log("interpreterModule2 :: NOT FOUND = " + questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name, "info");
						}
					}


					self.sectionHeaderList[sectionIndex].questionList[questionIndex] = questionObject;
				}
			}

			addSubsections();
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in postInterpretSettings >> " + JSON.stringify(e), "info");
		}
	};

/**
`sortQuestionsByOrder` sorts all questions based on the question order property

@method sortQuestionsByOrder

@return n/a
*/
	var sortQuestionsByOrder = function() {
		try {
			//sort the question by order within each section
			for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
				self.sectionHeaderList[sectionIndex].questionList.sort(function(a, b) {
					return parseInt(a.order) - parseInt(b.order);
				});
			}

			//sort the sections by order of the first question in the section
			self.sectionHeaderList.sort(function(a, b) {
				return parseInt(a.questionList[0].order) - parseInt(b.questionList[0].order);
			});
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.Logger.log("Exception in sortQuestionsByOrder >> " + JSON.stringify(e), "info");
		}
	};

/**
`readAppconfig` using the cms settings from the server or the local settings in appcofig.json
add changes to map variables to be used latter.

@method readAppconfig

@return n/a
*/
	var readAppconfig = function() {

		var removedSections = Ti.App.Properties.getList("removedSections", []);
		Alloy.Globals.Logger.log("removedSections = " + JSON.stringify(removedSections), "info");
		removedSectionsMap = [];
		for (var i = 0; i < removedSections.length; i++) {
			removedSectionsMap[removedSections[i]] = true;
		}

		var removedQuestions = Ti.App.Properties.getList("removedQuestions", []);
		Alloy.Globals.Logger.log("removedQuestions = " + JSON.stringify(removedQuestions), "info");
		removedQuestionsMap = [];
		for (var i = 0; i < removedQuestions.length; i++) {
			removedQuestionsMap[removedQuestions[i]] = true;
		}

		var hiddenQuestions = Ti.App.Properties.getList("hiddenQuestions", []);
		Alloy.Globals.Logger.log("hiddenQuestions = " + JSON.stringify(hiddenQuestions), "info");
		hiddenQuestionsMap = [];
		for (var i = 0; i < hiddenQuestions.length; i++) {
			hiddenQuestionsMap[hiddenQuestions[i]] = true;
		}

		var censusCounterQuestions = Ti.App.Properties.getList("censusCounterQuestions", []);
		Alloy.Globals.Logger.log("censusCounterQuestions = " + JSON.stringify(censusCounterQuestions), "info");
		censusCounterQuestionMap = [];
		for (var i = 0; i < censusCounterQuestions.length; i++) {
			censusCounterQuestionMap[censusCounterQuestions[i]] = true;
		}

		var timerPickerQuestions = Ti.App.Properties.getList("timerPickerQuestions", []);
		Alloy.Globals.Logger.log("timerPickerQuestions = " + JSON.stringify(timerPickerQuestions), "info");
		timerPickerQuestionMap = [];
		for (var i = 0; i < timerPickerQuestions.length; i++) {
			timerPickerQuestionMap[timerPickerQuestions[i].name] = timerPickerQuestions[i].duration;
		}

	};

/**

/`interpret` the rooot function to call to translate the question set from the server in to a workable
question set for questionRender

@method interpret

@param {JSON_List} allQuestions this is the Json question data set from the server
@param {JSON_obejct} passObject this is the settings object for this question set file.

@return {List of JSON_obejct} questionList
*/
	self.interpret = function(allQuestions, passObject) {

		try {
			readAppconfig();

			self.sectionHeaderList = [];
			self.questionMap = [];
			questionMap = [];
			renderDependenciesMap = [];
			mandatoryDependenciesMap = [];

			for (var i = 0; i < allQuestions.length; i++) {
				addQuestionToSectionHeader(allQuestions[i], passObject, passObject.assessmentId);
			}

			lookQuestionDependencies();
			sortQuestionsByOrder();
			postInterpretSettings(passObject);

			renderDependenciesMap = [];
			self.questionMap = [];
			questionMap = [];
			mandatoryDependenciesMap = [];

			return self.sectionHeaderList;
		} catch(e) {
			Alloy.Globals.Logger.logException(e);
			Alloy.Globals.aIndicator.hide();
			Alloy.Globals.Logger.log("Interpreter.interpret has an exception: " + JSON.stringify(e), "error");
			return [];
		}
	};

}

module.exports = new interpreterModule2; 