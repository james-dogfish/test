
function interpreterModule2(){
	
	var self = this;
	self.sectionHeaderList = [];
	
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
		pageName : "",
		pageType : "",
		questionList : []
	};
	
	var question = {
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
		debugTitleView : {}
	};
	
	var createQuestionObject = function(question, passObject){
		
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
		
		
		var validation = Alloy.Globals.localParser.getConditionalMandatory(validation);
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
				questionValidation.conditionalMandatory.push({name : conditionalMandatory[i].name, value : conditionalMandatory[i].value});
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
			template : templateType, // this is the template used to show the question in the list view
			type : type,
			name : passObject.pageID + Alloy.Globals.localParser.getQuestionName(question),
			alcrmQuestionID : Alloy.Globals.localParser.getQuestionName(question),
			visable : true, 
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
			debugTitleView : {}
		};
		
		
		return questionObject;
	};
	
	var addQuestionToSectionHeader  = function(question, passObject){
		
		var groupName = Alloy.Globals.localParser.getQuestionGroup(question);
		var groupType = passObject.pageID + groupName;
		
		
		for(var i=0; i< self.sectionHeaderList.length; i++){
			if(groupType == self.sectionHeaderList[i].groupType){
				var newQuestionObject = createQuestionObject(question, passObject);
				if(newQuestionObject != null){
					self.sectionHeaderList[i].questionList.push(newQuestionObject);
				}
				return;
			}
		}
		
		var newSectionHeader = {
			title : groupName,
			groupType : groupType,
			pageName : passObject.pageName,
			pageType : passObject.pageType,
			questionList : []
		};
		var newQuestionObject = createQuestionObject(question, passObject);
		if(newQuestionObject != null){
			newSectionHeader.questionList.push(newQuestionObject);
		}
		self.sectionHeaderList.push(newSectionHeader);
		
	};
	
	
	//passObject = {associatedFileName : "", pageName : "", pageID : "", pageType : ""}
	self.interpret = function(allQuestions, passObject){
		self.sectionHeaderList = [];
		
		for(var i=0; i< allQuestions.length; i++){
			
			addQuestionToSectionHeader(allQuestions[i], passObject);
		}
		return self.sectionHeaderList;
	};
	
	

}
module.exports = new interpreterModule2;