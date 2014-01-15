require('/test-framework/tijasmine').infect(this);

describe("Parser Test Suite", function () {
	
    var Parser = require('parser/localParser');
 	
 	//getGuestions
    it('test parser parses exactly 3 questions', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			
			expect(all_questions.length).toEqual(3);
    });
    
    it('test parser getGuestions does not return null', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			
			expect(all_questions).not.toBe(null);
    });
    
    it('test parser getGuestions does return null', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse();
			var all_questions = localParser.getQuestions(censusData);
			
			expect(all_questions).toBe(null);
    });
    

    it('test parser is not undefined', function(){
		 	localParser = new localParser();
			expect(localParser).not.toBeUndefined();
    });
    
    //parse()
    it('test parser parse() does not return null', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			
			expect(censusData).not.toBe(null);
    });
    it('test parser parse() does not return undefined', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse('local_xml/CensusData.xml');
			
			expect(censusData).not.toBeUndefined();
    });
    
    it('test parser parse() does return null', function(){
		 	localParser = new localParser();
		 	
			var censusData = localParser.parse();
			var all_questions = localParser.getQuestions(censusData);
			
			expect(censusData).not.toBe(null);
    });
    
    //getGuestionText()
     it('test getGuestionText() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var question_text = localParser.getQuestionText(all_questions[0]);

			expect(question_text).not.toBeUndefined();
    });
    it('test getQuestionGroup() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var question_group = localParser.getQuestionGroup(all_questions[0]);

			expect(question_group).not.toBeUndefined();
    });
    it('test getQuestionGroup() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var question_group = localParser.getQuestionGroup(all_questions[0]);

			expect(question_group).not.toBeUndefined();
    });
     it('test getQuestionOrder() to be undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var question_order = localParser.getQuestionOrder(all_questions[999]);

			expect(question_order).toBeUndefined();
    });
    it('test getGuestionText() for question 0 is = Date of census', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var question_text = localParser.getQuestionText(all_questions[0]);

			expect(question_text).toEqual("Date of census");
    });
    
    //getValidation()
    it('test getValidation() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validation = localParser.getValidation(all_questions[0]);

			expect(question_text).not.toBeUndefined();
    });
     it('test getValidation() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validation = localParser.getValidation(all_questions[999]);

			expect(question_text).toBeUndefined();
    });
    
    //getValidationFormat()
    it('test getValidationFormat() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationFormat = localParser.getValidationFormat(all_questions[0]);

			expect(validationFormat).not.toBeUndefined();
    });
     it('test getValidationFormat() returns some text', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationFormat = localParser.getValidationFormat(all_questions[0]);

			expect(validationFormat.toString().length).toBeGreaterThan(0);
    });
    
    it('test getValidationFormat() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationFormat = localParser.getValidationFormat(all_questions[999]);

			expect(validationFormat).toBeUndefined();
    });
    it('test getValidationFormat() does not returns any text', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationFormat = localParser.getValidationFormat(all_questions[999]);

			expect(validationFormat.toString().length).toBeGreaterThan(0);
    });
    
    //isValidationMandatory()
     it('test isValidationMandatory() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationMandatory = localParser.isValidationMandatory(all_questions[0]);

			expect(validationMandatory).not.toBeUndefined();
    });
    it('test isValidationMandatory() returns TRUE', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationFormat = localParser.getValidationFormat(all_questions[0]);

			expect(validationMandatory).toEqual(true);
    });
     it('test isValidationMandatory() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationMandatory = localParser.isValidationMandatory(all_questions[999]);

			expect(validationMandatory).toBeUndefined();
    });
    it('test isValidationMandatory() does NOT returns TRUE', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var validationMandatory = localParser.isValidationMandatory(all_questions[0]);
			if(validationMandatory) 
			{
				validationMandatory = false;
			}
			expect(validationMandatory).not.toEqual(true);
    });
    
    //getAllByType()
    it('test getAllByType(all_questions,"type","date") is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var getAllByTypeDate = localParser.getBy(all_questions, "type", "date");

			expect(getAllByTypeDate).not.toBe(null);
    });
    it('test getAllByType(all_questions,"type","date") is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var getAllByTypeDate = localParser.getBy(all_questions, "type", "date");

			expect(getAllByTypeDate).not.toBeUndefined();
    });
    it('test getAllByType(all_questions,"type","date") is null', function(){
		 	localParser = new localParser();

			var all_questions = {};
			var getAllByTypeDate = localParser.getBy(all_questions, "type", "date");

			expect(getAllByTypeDate).toBe(null);
    });
    it('test getAllByType(all_questions,"type","date") is undefined', function(){
		 	localParser = new localParser();

			var all_questions = undefined;
			var getAllByTypeDate = localParser.getBy(all_questions, "type", "date");

			expect(getAllByTypeDate).toBeUndefined();
    });
    //TODO: add other tests here for different types and to cover ALL types
    
    //getAllByGroup
	 it('test getAllByGroup(all_questions,"group","CensusGeneral") is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var getAllByGroupCensusGeneral = localParser.getBy(all_questions, "group", "CensusGeneral");

			expect(getAllByGroupCensusGeneral).not.toBe(null);
    });
    it('test getAllByGroup(all_questions,"group","CensusGeneral") is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var getAllByGroupCensusGeneral = localParser.getBy(all_questions, "group", "CensusGeneral");

			expect(getAllByGroupCensusGeneral).not.toBeUndefined();
    });
    it('test getAllByGroup(all_questions,"group","CensusGeneral") is null', function(){
		 	localParser = new localParser();

			var all_questions = {};
			var getAllByGroupCensusGeneral = localParser.getBy(all_questions, "group", "CensusGeneral");

			expect(getAllByGroupCensusGeneral).toBe(null);
    });
    it('test getAllByGroup(all_questions,"group","CensusGeneral") is undefined', function(){
		 	localParser = new localParser();

			var all_questions = undefined;
			var getAllByGroupCensusGeneral = localParser.getBy(all_questions, "group", "CensusGeneral");

			expect(getAllByTypeDate.length).toBeUndefined();
    });
    
    //getAllSelections()
     it('test getAllSelections() is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var all_selections = localParser.getAllSelections(all_questions[0]);

			expect(all_selections).not.toBe(null);
    });
    it('test getAllSelections() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var all_selections = localParser.getAllSelections(all_questions[0]);

			expect(all_selections).not.toBeUndefined();
    });
    it('test getAllSelections() is null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var all_selections = localParser.getAllSelections(all_questions[999]);

			expect(all_selections).not.toBe(null);
    });
    it('test getAllSelections() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var all_selections = localParser.getAllSelections(all_questions[999]);

			expect(all_selections).toBeUndefined();
    });
    
    //getQuestionType()
     it('test getQuestionType() is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var questionType = localParser.getQuestionType(all_questions[0]);

			expect(questionType).not.toBe(null);
    });
    it('test getQuestionType() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var questionType = localParser.getQuestionType(all_questions[0]);

			expect(questionType).not.toBeUndefined();
    });
    it('test getQuestionType() is null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var questionType = localParser.getQuestionType(all_questions[0]);
			if(questonType) { questionType = null }
			expect(questionType).toBe(null);
    });
    it('test getQuestionType() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var questionType = localParser.getQuestionType(all_questions[0]);
			if(questonType) { questionType = undefined }
			expect(questionType).toBeUndefined();
    });
    it('test getQuestionType() for question 0 is date', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var questionType = localParser.getQuestionType(all_questions[0]);

			expect(questionType).toEqual("date");
    });
   	//getSelectionName()
   	it('test getSelectionName() is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionName = localParser.getSelectionName(selection[0]);

			expect(selectionName).not.toBe(null);
    });
    it('test getSelectionName() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionName = localParser.getSelectionName(selection[0]);

			expect(selectionName).not.toBeUndefined();
    });
    it('test getSelectionName() is null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionName = localParser.getSelectionName(selection[0]);
			if(selectionName) { selectionName = null; }
			expect(selectionName).toBe(null);
    });
    it('test getSelectionName() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionName = localParser.getSelectionName(selection[0]);
			if(selectionName) { selectionName = undefined; }
			expect(selectionName).toBeUndefined();
    });
    
   //getSelectionValue()
   it('test getSelectionValue() is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionValue = localParser.getSelectionValue(selection[0]);

			expect(selectionValue).not.toBe(null);
    });
    it('test getSelectionValue() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionValue = localParser.getSelectionValue(selection[0]);

			expect(selectionValue).not.toBeUndefined();
    });
    it('test getSelectionValue() is null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionValue = localParser.getSelectionValue(selection[0]);
			if(selectionValue) { selectionValue = null; }
			expect(selectionValue).toBe(null);
    });
    it('test getSelectionValue() is undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var selection = question.getElementsByTagName("selection");
			var selectionValue = localParser.getSelectionValue(selection[0]);
			if(selectionValue) { selectionValue = undefined; }
			expect(selectionValue).toBeUndefined();
    });
    
    //getRenderValue() 
     it('test getRenderValue() is not null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);

			expect(renderValue).not.toBe(null);
    });
    it('test getRenderValue() is not undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);

			expect(renderValue).not.toBeUndefined();
    });
    it('test getRenderValue() has at least 2 leafs', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);

			expect(renderValue.length).toBeGreaterThan(1);
    });
    it('test getRenderValue() leafs are valid', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);
			
			var renderParamName = localParser.getRenderValueParamName(renderValue);
			var renderParamValue = localParser.getRenderValueParamValue(renderValue);
			
			expect(renderParamName).not.toBe(null);
			expect(renderParamValue).not.toBe(null);
    });
    
    it('test getRenderValue() is null', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);
			if(renderValue) {renderValue = null;}
			
			expect(renderValue).toBe(null);
    });
    it('test getRenderValue() is  undefined', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);
			if(renderValue) {renderValue = undefined;}
			
			expect(renderValue).toBeUndefined();
    });
    it('test getRenderValue() does not have at least 2 leafs', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[999]);
			
			expect(renderValue.length).toBeLessThan(1);
    });
    it('test getRenderValue() leafs are NOT valid', function(){
		 	localParser = new localParser();
		 	
		 	var censusData = localParser.parse('local_xml/CensusData.xml');
			var all_questions = localParser.getQuestions(censusData);
			var renderValue = localParser.getRenderValue(all_questions[0]);
			
			var renderParamName = localParser.getRenderValueParamName(renderValue);
			var renderParamValue = localParser.getRenderValueParamValue(renderValue);
			
			if(renderParamName) { renderParamName = null; }
			if(renderParamValue) { renderParamValue = null; }
			
			expect(renderParamName).toBe(null);
			expect(renderParamValue).toBe(null);
    });
    /* END OF TEST SUITE */
});