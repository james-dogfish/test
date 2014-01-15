

function interpreterModule()
{
	var self = this;
	
	var User = require('core/User'),
	Validator = require('validator/Validator'),
	Util = require('core/Util');

	var userPreferences = User.getPreferences();
	
	var Alloy = require('alloy'), _ = require("alloy/underscore")._, Backbone = require("alloy/backbone");
	
	self.question_selections_list =[];
	self.question_data =[];
	self.questionObjectList =[];
	
	self.rawSelectionsData = [];
	
	var ui_types_map = {};
		ui_types_map["date"] 			= "censusCounterTemplate";
		ui_types_map["alpha"] 			= "textFieldTemplate";
		ui_types_map["radio"] 			= "singleSelectTemplate";
		ui_types_map["select"] 			= "singleSelectTemplate";
		ui_types_map["alphanumeric"] 	= "textFieldTemplate";
		ui_types_map["numeric"] 		= "textFieldTemplate";
		ui_types_map["multiSelect"] 	= "multiSelectTemplate";
		ui_types_map["decimal"] 		= "textFieldTemplate";
		ui_types_map["dateRange"] 		= "dateRangeTemplate";
		ui_types_map["numericRange"] 	= "rangeFieldTemplate";
		ui_types_map["decimalRange"] 	= "rangeFieldTemplate";
		ui_types_map["alphaRange"] 		= "rangeFieldTemplate";
		
	var group_types_map = {};
		group_types_map["Approach"] 			= "Approach";
		group_types_map["CensusEnvironment"] 	= "Census Environment";
		group_types_map["CensusGeneral"] 		= "Census General";
		group_types_map["CensusUsage"] 			= "Census Usage";
		group_types_map["Misuse"] 				= "Misuse";
		group_types_map["EnvironmentGeneral"] 	= "Environment General";
		group_types_map["EnvironmentUp"] 		= "Environment Up";
		group_types_map["EnvironmentDown"] 		= "Environment Down";
		group_types_map["Photograph"] 			= "Photograph";
		group_types_map["Layout"] 				= "Layout";
		group_types_map["Collector"] 			= "Collector";
		group_types_map["ReferenceSource"] 		= "ReferenceSource";
		group_types_map["RiskAssessmentInfo"] 	= "RiskAssessment Info";
		group_types_map["Train"] 				= "Train";
		group_types_map["Mitigation"] 			= "Mitigation";
		group_types_map["CrossingSearch"] 		= "Crossing Search";
		group_types_map["AssessmentSearch"] 	= "Assessment Search";
		group_types_map["OptionSearch"] 		= "Option Search";
		group_types_map["Census"] 				= "Census";
		group_types_map["Environment"] 			= "Environment";
		group_types_map["Options"] 				= "Options";
		group_types_map["Assessment"] 			= "Assessment";
		
		
	
	var biuldValidationObject = function(questionJsonObject){
		validationList = [];
		
		var validationObject = Alloy.Globals.localParser.getValidation(questionJsonObject);
		
		var format = validationObject.format;
		if(typeof format === "undefined"){
			//validationList.push()
		}
	};
	
	var setDefaultValues = function(questionObject){

		if(questionObject.name == "I_COLLECTOR_NAME"){
			questionObject.value = [userPreferences.name];
			questionObject.displayValue = {value : userPreferences.name};
		}
		else if(questionObject.name == "PHONE_NUMBER"){
			questionObject.value = [userPreferences.mobile];
			questionObject.displayValue = {value : userPreferences.mobile};
		}
		else if(questionObject.name == "EMAIL_ADDRESS"){
			questionObject.value = [userPreferences.email];
			questionObject.displayValue = {value : userPreferences.email};
		}
		
		/*
			var responseObject = [
			{name : item.name},
			{value : dateString},
			{notes : ""}
		];
		*/
		//Titanium.API.info("jsonObject "+JSON.stringify(questionObject.jsonObject.value));
		if(questionObject.jsonObject.value != undefined){
		
			questionObject.value = questionObject.jsonObject.value[0];
			
			if(questionObject.template == "textFieldTemplate" && questionObject.jsonObject.value.length == 1){
				questionObject.displayValue = {value : questionObject.jsonObject.value[0]};
			}
			else if(questionObject.template == "censusCounterTemplate" && questionObject.jsonObject.value.length == 1){
				questionObject.displayValue = {value : questionObject.jsonObject.value[0]};
			}
			else if(questionObject.template == "singleSelectTemplate" && questionObject.jsonObject.value.length == 1){
				questionObject.displayValue = {value : questionObject.jsonObject.value[0]};
			}
			else if(questionObject.template == "dateTemplate" && questionObject.jsonObject.value.length == 1){
				questionObject.displayValue = {value : questionObject.jsonObject.value[0]};
			}
			else if(questionObject.template == "rangeFieldTemplate" && questionObject.jsonObject.value.length == 2){
				questionObject.displayValue = {value : questionObject.jsonObject.value[0]};
				questionObject.displayValue2 = {value : questionObject.jsonObject.value[1]};
			}
			else if(questionObject.template == "multiSelectTemplate"){
				var stringValue = "";
				
				for(var i=0;i< questionObject.jsonObject.value.length; i++){
					if(i == 0){
						stringValue = questionObject.jsonObject.value[i];
					}
					else{
						stringValue = stringValue +", "+questionObject.jsonObject.value[i];
					}					
				}
				questionObject.displayValue = {value : stringValue};
			}
				
		}
		
	};
	
	var generateQuestionObject = function(questionJsonObject){
		var question_type_key = Alloy.Globals.localParser.getQuestionType(questionJsonObject);
		var templateType = ui_types_map[question_type_key];
		if(question_type_key in ui_types_map){	
		}
		else{
			alert("question_type_key "+question_type_key);
		}
		
		//Titanium.API.info("jsonObject "+questionJsonObject);
		var questionObject = {
			properties : {},
			errorMessageVisable : false,
			questionErrorMessageView : {},
			questionErrorMessage : {},
			pageName : questionJsonObject.pageName,
			pageType : questionJsonObject.pageType,
			template : templateType,
			name : questionJsonObject.pageID + Alloy.Globals.localParser.getQuestionName(questionJsonObject),
			notesBackground : {backgroundImage: 'images/questionNote.png'},//{backgroundImage: 'images/questionSelectedNote.png'}
			notes : questionJsonObject.notes, 
			value : [""],
			visable : true,
			title : {text : Alloy.Globals.localParser.getQuestionText(questionJsonObject)},
			type : Alloy.Globals.localParser.getQuestionType(questionJsonObject),
			order : Alloy.Globals.localParser.getQuestionOrder(questionJsonObject),
			groupType : questionJsonObject.pageID + Alloy.Globals.localParser.getQuestionGroup(questionJsonObject),
			displayValue : {value : ""},
			displayValue2 : {value : ""},  
			
			//associatedFileName is the local file the question is saved in
			associatedFileName : questionJsonObject.associatedFileName,
			
			jsonObject : questionJsonObject,
			renderValue : [],
			selections : [],
			debugQuestionDependencyList : [],
			debugTitleView : {}
		};
		
		if(questionJsonObject.notes != ""){
			questionObject.notesBackground = {backgroundImage: 'images/questionSelectedNote.png'};
		}
		
		setDefaultValues(questionObject);
		
		var allSelections=Alloy.Globals.localParser.getAllSelections(questionJsonObject);

		for(var i=0;i<allSelections.length;i++){
			questionObject.selections.push({
				displayValue: Alloy.Globals.localParser.getSelectionDisplayValue(allSelections[i]),
				value: Alloy.Globals.localParser.getSelectionValue(allSelections[i])
			});
		}
		
		var allRenderValues=Alloy.Globals.localParser.getRenderValue(questionJsonObject);
		for(var i=0;i<allRenderValues.length;i++){
			questionObject.renderValue.push(
				{
					name : questionJsonObject.pageID + Alloy.Globals.localParser.getRenderValueParamName(allRenderValues[i]),
					value : Alloy.Globals.localParser.getRenderValueParamValue(allRenderValues[i])
				});
		}
		
		
		return questionObject;
	};
	
	var addSelectionsList = function(questionJsonObject){
		//rawSelectionsData
		var groupType = questionJsonObject.pageID + Alloy.Globals.localParser.getQuestionGroup(questionJsonObject);
		for(var i=0; i< self.question_selections_list.length; i++){
			if(self.question_selections_list[i].groupType == groupType){
				self.question_selections_list[i].appendItems([generateQuestionObject(questionJsonObject)]);
				return;
			}
		}
		
		//var DisplayGroup = Alloy.Globals.localParser.getQuestionDisplayGroup(questionJsonObject);
		//alert(DisplayGroup);
		
		var newQuestionsSection = Titanium.UI.createListSection();
		//newQuestionsSection.headerView =  Alloy.createController("questionSectionHeader", {title : group_types_map[groupType]}).getView() ;
		var sectionName = groupType;
		if(groupType in group_types_map){
			sectionName = group_types_map[groupType];
		}
		newQuestionsSection.headerTitle = sectionName;
		newQuestionsSection.title = sectionName;
		newQuestionsSection.groupType = groupType;
		newQuestionsSection.pageName = questionJsonObject.pageName;
		newQuestionsSection.pageType = questionJsonObject.pageType;
		newQuestionsSection.setItems([generateQuestionObject(questionJsonObject)]);
		self.question_selections_list.push(newQuestionsSection);
	};
	
	var sortSelctionByOrder = function(questionsSection){
		
		var itemList = questionsSection.getItems();
		
		itemList.sort(function(a,b) { 
				return parseInt(a.order) - parseInt(b.order); 
			});
		questionsSection.setItems(itemList);
	};
	
	var sortSelctionListByOrderOfFirstQuestion = function(selectionsList){
		
		selectionsList.sort(function(a,b) { 
				return parseInt(a.getItems()[0].order) - parseInt(b.getItems()[0].order);
			});
	};
		
	self.interpret = function(allQuestions){
		
		self.question_selections_list =[];
		self.question_data =[];
		self.questionObjectList =[];
		
		self.rawSelectionsData = [];
	
		for(var i=0; i< allQuestions.length; i++){
			//alert("order : '"+Alloy.Globals.localParser.getQuestionOrder(allQuestions[i])+"'");
			//Titanium.API.info("allQuestions length = "+allQuestions.length);
			//Titanium.API.info(allQuestions[i]);
			var question_type_key = Alloy.Globals.localParser.getQuestionType(allQuestions[i]);
			
			//Titanium.API.info("question name = "+Alloy.Globals.localParser.getQuestionText(allQuestions[i]) + "type = "+ question_type_key);
			if(question_type_key in ui_types_map){
				addSelectionsList(allQuestions[i]);
			}
			else{
				Titanium.API.info("question_type not found, question_type_key = "+question_type_key);
			}
		}
		
		for(var i=0; i< self.question_selections_list.length; i++){
			sortSelctionByOrder(self.question_selections_list[i]);
		}
		
		sortSelctionListByOrderOfFirstQuestion(self.question_selections_list);
		
		return self.question_selections_list;
	};
}

module.exports = new interpreterModule;