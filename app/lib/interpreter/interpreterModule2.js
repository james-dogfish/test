function interpreterModule2(){
	
	//self.QUESTION_ROW_TYPE = "question";
	//self.NON_QUESTION_ROW_TYPE = "NonQuestion";
	
	var self = this;
	self.sectionHeaderList = [];
	var User = require('core/User');
	var userPreferences = User.getPreferences();
	
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
	
	
	//header Object Format
	var sectionHeader = {
		title : "",
		groupType : "",
		alcrmGroupType : "",
		pageName : "",
		pageType : "",
		associatedFileName : "",
		questionList : []
	};
	
	var question = {
		isAQuestion : true,
		template : "", // this is the template used to show the question in the list view
		type : "", // this is the alcrem question type
		name : "", // this is the id of the question
		alcrmQuestionID : "",
		visable : true, 
		order : "", 
		associatedFileName : "", // file the question is in
		
		notesBackground : {backgroundImage: 'images/questionNote.png'},//{backgroundImage: 'images/questionSelectedNote.png'}
		notes : "",
		
		value : [""],// a list of all values set for this question
		renderValue : [], // a list of condtions if the question is visable
		selections : [], // a list of possible values for the question
		validation : {},
		
		title : {text : ""}, // the title text for this question
		displayValue : {value : ""}, 
		displayValue2 : {value : ""}, 
		
		questionResponse: null,
		
		errorMessageVisable : false,
		questionErrorMessageView : {},
		questionErrorMessage : {},
		
		debugQuestionDependencyList : [],
		headerView : {}
	};
	
	var createQuestionObject = function(question, passObject, sectionGroupType){
		
		var type = Alloy.Globals.localParser.getQuestionType(question);
		var templateType = "";
		if(type in ui_types_map){	
			templateType = ui_types_map[type];
		}
		else{
			alert("question_type_key "+question_type_key);
			return null;
		}
		
		questionRenderValues = [];
		var allRenderValues=Alloy.Globals.localParser.getRenderValue(question);
		var questionVisable = true;
		if(allRenderValues != 0){
			questionVisable = false;
		}
		for(var i=0;i<allRenderValues.length;i++){
			questionRenderValues.push(
				{
					name : passObject.pageID + Alloy.Globals.localParser.getRenderValueParamName(allRenderValues[i]),
					value : Alloy.Globals.localParser.getRenderValueParamValue(allRenderValues[i])
				});
		}
		
		questionSelections = [];
		var allSelections=Alloy.Globals.localParser.getAllSelections(question);
		for(var i=0;i<allSelections.length;i++){
			questionSelections.push({
				displayValue: Alloy.Globals.localParser.getSelectionDisplayValue(allSelections[i]),
				value: Alloy.Globals.localParser.getSelectionValue(allSelections[i])
			});
		}
		
		
		
		var questionValidation = {
			validationTest : false,
			min : null,
			max : null,
			minLenght : null,
			maxLenght : null,
			format : null,
			mandatory : false,
			conditionalMandatory : []
		};
		
		
		var validation = Alloy.Globals.localParser.getValidation(question);
		
		if(typeof validation !== "undefined"){
			questionValidation.validationTest = true;
			
			var mandatory = validation.mandatory;
			if(typeof mandatory !== "undefined"){
				if(mandatory["#text"] == "true"){
					questionValidation.mandatory = true;
				}
			}
			
			var conditionalMandatory = Alloy.Globals.localParser.getConditionalMandatory(validation);
			for(var i = 0; i< conditionalMandatory.length; i++){
				
				questionValidation.conditionalMandatory.push({
						name : conditionalMandatory[i].name, 
						value : conditionalMandatory[i].value
					});
			}
			
			if(typeof validation.min !== "undefined"){
				questionValidation.min = parseInt(validation.min["#text"]);
			}
			
			if(typeof validation.max !== "undefined"){
				questionValidation.max = parseInt(validation.max["#text"]);
			}
			
			if(typeof validation.minLenght !== "undefined"){
				questionValidation.max = validation.minLenght(minLenght["#text"]);
			}
			
			if(typeof validation.maxLenght !== "undefined"){
				questionValidation.maxLenght = parseInt(validation.maxLenght["#text"]);
			}
			
			if(typeof validation.format !== "undefined"){
				questionValidation.format = validation.format["#text"];
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
			order : Alloy.Globals.localParser.getQuestionOrder(question), 
			associatedFileName : passObject.associatedFileName, // file the question is in
			questionResponse : null,
			
			notesBackground : {backgroundImage: 'images/questionNote.png'},//{backgroundImage: 'images/questionSelectedNote.png'}
			notes : "",
			
			value : [""],// a list of all values set for this question
			renderValue : questionRenderValues, // a list of condtions if the question is visable
			selections : questionSelections, // a list of possible values for the question
			validation : questionValidation,
			
			title : {text : Alloy.Globals.localParser.getQuestionText(question)}, // the title text for this question
			displayValue : {value : ""}, 
			displayValue2 : {value : ""}, 
			
			errorMessageVisable : false,
			questionErrorMessageView : {},
			questionErrorMessage : {},
			
			debugQuestionDependencyList : [],
			headerView : {}
		};
		return questionObject;
	};
	
	var addQuestionToSectionHeader  = function(question, passObject){
		
		var alcrmGroupType = Alloy.Globals.localParser.getQuestionGroup(question);
		var groupType = passObject.pageID + alcrmGroupType;
		
		
		for(var i=0; i< self.sectionHeaderList.length; i++){
			if(groupType == self.sectionHeaderList[i].groupType){
				var newQuestionObject = createQuestionObject(question, passObject, groupType);
				if(newQuestionObject != null){
					self.sectionHeaderList[i].questionList.push(newQuestionObject);
				}
				return;
			}
		}
		
		var newSectionHeader = {
			title : alcrmGroupType,
			groupType : groupType,
			alcrmGroupType : alcrmGroupType,
			pageName : passObject.pageName,
			pageType : passObject.pageType,
			associatedFileName : passObject.associatedFileName,
			questionList : []
		};
		var newQuestionObject = createQuestionObject(question, passObject, groupType);
		if(newQuestionObject != null){
			newSectionHeader.questionList.push(newQuestionObject);
		}
		self.sectionHeaderList.push(newSectionHeader);
	};
	
	var postInterpretSettings = function(passObject){
		for(var sectionIndex =0;  sectionIndex < self.sectionHeaderList.length; sectionIndex++){
			
			
			if(self.sectionHeaderList[sectionIndex].alcrmGroupType == "Photograph"){
				var newRow = {
					isAQuestion : false,
					template : "setEntireSectionTemplate",
					
					title : {text : "Set all photograph questions to"},
					visable : true,
					name : "",
					questionToChangeTemplate : "singleSelectTemplate",
					selections : [{displayValue : "Yes", value : 1},{displayValue : "No", value : 0}],
					renderValue : []
				};
				self.sectionHeaderList[sectionIndex].questionList.unshift(newRow);//adds row to front of the list
			}
			
			
			
			
			
			for(var questionIndex =0; questionIndex < self.sectionHeaderList[sectionIndex].questionList.length; questionIndex++){
				
				if(self.sectionHeaderList[sectionIndex].questionList[questionIndex].isAQuestion == false)continue;
				
				var questionObject = self.sectionHeaderList[sectionIndex].questionList[questionIndex];
				
				//self.sectionHeaderList[sectionIndex].questionList[questionIndex]
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
				
				self.sectionHeaderList[sectionIndex].questionList[questionIndex] = questionObject;
			}
		}
	};
	
	
	//passObject = {associatedFileName : "", pageName : "", pageID : "", pageType : ""}
	self.interpret = function(allQuestions, passObject){
		self.sectionHeaderList = [];
		
		for(var i=0; i< allQuestions.length; i++){
			addQuestionToSectionHeader(allQuestions[i], passObject);
		}
		postInterpretSettings(passObject);
		return self.sectionHeaderList;
	};
	
	

}
module.exports = new interpreterModule2;