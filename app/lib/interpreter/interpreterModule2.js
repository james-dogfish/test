function interpreterModule2() {

    //self.QUESTION_ROW_TYPE = "question";
    //self.NON_QUESTION_ROW_TYPE = "NonQuestion";
    //var Alloy.Globals.Styles = require('styles/styles');

    var self = this;
    self.sectionHeaderList = [];
    
    var questionMap = [];
    
    //var Alloy.Globals.User = require('core/Alloy.Globals.User');
    //var userPreferences = Alloy.Globals.User.getPreferences();
   

    var renderDependenciesMap = [];
    
    var mandatoryDependenciesMap = [];
    
    var removedSectionsMap = [];
	var removedQuestionsMap = [];
	var hiddenQuestionsMap = [];
	var censusCounterQuestionMap = [];


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


    //header Object Format
    var sectionHeader = {
        title: "",
        groupType: "",
        alcrmGroupType: "",
        pageName: "",
        pageType: "",
        associatedFileName: "",
        questionList: []
    };

    var question = {
        isAQuestion: true,
        template: "", // this is the template used to show the question in the list view
        type: "", // this is the alcrem question type
        name: "", // this is the id of the question
        alcrmQuestionID: "",
        visable: true,
        order: "",
        associatedFileName: "", // file the question is in

        assessmentId: "",

        notesBackground: {
            backgroundImage: 'images/questionNote.png'
        }, //{backgroundImage: 'images/questionSelectedNote.png'}
        notes: "",
        alcrmNotes : "",
        help : "",
        selected: false,
        value: [], // a list of all values set for this question
        renderValue: [], // a list of condtions if the question is visable
        selections: [], // a list of possible values for the question
        validation: {},
        mandatory : false, //can be changed at run time with conditionalMandatory
		subsectionTitle : null,
        title: {
            text: ""
        }, // the title text for this question
        displayValue: {
            value: ""
        },
        displayValue2: {
            value: ""
        },

        questionResponse: null,
        
        backgroundView : {},

        errorMessageVisable: false,
        questionErrorMessageView: {},
        questionErrorMessage: {},

        renderDependencyList: [],
        mandatoryDependenciesList : [],
        headerView: {}
    };
    
    var getSectionDisplayName = function(question, passObject){
    	
    	try{
	    	var displayName = "N/A";
	    	
	    	if(passObject.pageType == "riskAssessment"){
	    		
	    		if(typeof question.firstTab !== "undefined")
		    	{
		    		displayName = question.firstTab;
		    		
		    	}
		    	if(typeof question.secondTab !== "undefined"){
	    		
		    		displayName = displayName + " "+ question.secondTab;
		    	}
		    	return displayName;
	    	}
	    	
	    	if(typeof question.firstTab !== "undefined")
	    	{
	    		displayName = question.firstTab;
	    		
	    	}
	    	
	    	if(typeof question.secondTab !== "undefined"){
	    		
	    		displayName = question.secondTab;
	    	}
	    	
	    	return displayName;
	    }catch(e){
	    	Ti.API.info("Exception occured in getSectionDisplayName. Error Details: "+JSON.stringify(e));
       		return "";
	    }
    };
    
    var createCensusDateQuestion = function(passObject, section){
    	try{
	    	return  {
		        isAQuestion: true,
		        template: "dateTemplate", // this is the template used to show the question in the list view
		        type: "date", // this is the alcrem question type
		        groupType: section.groupType,
		        alcrmGroupType: section.alcrmGroupType,
		        name: passObject.pageID +"I_CENSUS_DATE", // this is the id of the question
		        alcrmQuestionID: "I_CENSUS_DATE",
		        visable: true,
		        order: "1",
		        associatedFileName: passObject.associatedFileName, // file the question is in
		
		        assessmentId: passObject.assessmentId,
		        
		        backgroundView : Alloy.Globals.Styles["normalQuestionBackground"],
		
		        notesBackground: {
		            backgroundImage: 'images/questionNote.png'
		        }, //{backgroundImage: 'images/questionSelectedNote.png'}
		        notes: "",
		        alcrmNotes : "I_CENSUS_DATE Notes",
		        help : "",
		        selected: false,
		        value: [""], // a list of all values set for this question
		        renderValue: [], // a list of condtions if the question is visable
		        selections: [], // a list of possible values for the question
		        validation: {
		            validationTest: false,
		            min: null,
		            max: null,
		            minLength: null,
		            maxLength: null,
		            format: null,
		            mandatory: false,
		            conditionalMandatory: []
		        },
		        mandatory : true, //can be changed at run time with conditionalMandatory
				subsectionTitle : null,
		        title: {
		            text: "Date of Census"
		        }, // the title text for this question
		        displayValue: {
		            value: ""
		        },
		        displayValue2: {
		            value: ""
		        },
		
		        questionResponse: null,
		
		        errorMessageVisable: false,
		        questionErrorMessageView: {},
		        questionErrorMessage: {},
		
		        renderDependencyList: [],
		        mandatoryDependenciesList : [],
		        headerView: {}
	    	};
	    }catch(e){
	    	alert("Exception occured in createCensusDateQuestion. Error Details: "+JSON.stringify(e));
       		return null;
	    }
    	
    };


    var createQuestionObject = function (question, passObject, sectionGroupType, assessmentId, questionMap) {
    	
    	try{
			var questionName = passObject.pageID + Alloy.Globals.localParser.getQuestionName(question);
	        var type = Alloy.Globals.localParser.getQuestionType(question);
	        var templateType = "";
	        if (type in ui_types_map) {
	            templateType = ui_types_map[type];
	        } else {
	            //Ti.API.info("questionNull type =" + type+", question = "+JSON.stringify(question));
	            return null;
	        }
	        
	        if(Alloy.Globals.localParser.getQuestionName(question) in removedQuestionsMap){
	        	//Ti.API.info("Alloy.Globals.localParser.getQuestionName(question) in hiddenQuestionsMap TRUE");
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
	
	            if (typeof renderDependenciesMap[dependencieName] === "undefined") {
	                renderDependenciesMap[dependencieName] = [];
	            }
	            renderDependenciesMap[dependencieName].push(questionName);
				
	
	            questionRenderValues.push({
	            	question : {name : dependencieName, groupType : ""},
	                //name: dependencieName,
	                value: dependencieValue
	            });
	        }
	
	        questionSelections = [];
	        var allSelections = Alloy.Globals.localParser.getAllSelections(question);
	        for (var i = 0; i < allSelections.length; i++) {
	            questionSelections.push({
	                displayValue: Alloy.Globals.localParser.getSelectionDisplayValue(allSelections[i]),
	                value: Alloy.Globals.localParser.getSelectionValue(allSelections[i])
	            });
	        }
	
	
	
	        var questionValidation = {
	            validationTest: false,
	            min: null,
	            max: null,
	            minLength: null,
	            maxLength: null,
	            format: null,
	            mandatory: false,
	            conditionalMandatory: []
	        };
	
	
	        var validation = Alloy.Globals.localParser.getValidation(question);
	        //Ti.API.info("VALIDATION OBJECT PASSED = "+JSON.stringify(validation));
	        
	        var isMandatory = false;
	
	        if (typeof validation !== "undefined") {
	            questionValidation.validationTest = true;
	
	            var mandatory = validation.mandatory;
	            if (typeof mandatory !== "undefined") {
	                if (mandatory == "true") {
	                    questionValidation.mandatory = true;
	                    isMandatory = true;
	                }
	            }
	
	            var conditionalMandatory = Alloy.Globals.localParser.getConditionalMandatory(validation);
	            for (var i = 0; i < conditionalMandatory.length; i++) {
	
					var dependencieName = passObject.pageID +conditionalMandatory[i].name;
	                questionValidation.conditionalMandatory.push({
	                    //name: conditionalMandatory[i].name,
	                    question : {name : dependencieName, groupType : ""},
	                    value: conditionalMandatory[i].value
	                });
	                
	                if (typeof mandatoryDependenciesMap[dependencieName] === "undefined") {
		                mandatoryDependenciesMap[dependencieName] = [];
		            }
	                mandatoryDependenciesMap[dependencieName].push(questionName);
	                
	            }
	
	            if (typeof validation.min !== "undefined") {
	                questionValidation.min = parseInt(validation.min);
	            }
	
	            if (typeof validation.max !== "undefined") {
	                questionValidation.max = parseInt(validation.max);
	            }
	
	            if (typeof validation.minLength !== "undefined") {
	                questionValidation.minLength = parseInt(validation.minLength);
	            }
	
	            if (typeof validation.maxLength !== "undefined") {
	                questionValidation.maxLength = parseInt(validation.maxLength);
	            }
	
	            if (typeof validation.format !== "undefined") {
	                questionValidation.format = validation.format;
	            }
	        }
	
	
	
	        var questionObject = {
	            isAQuestion: true,
	            template: templateType, // this is the template used to show the question in the list view
	            type: type,
	            groupType: sectionGroupType,
	            name: passObject.pageID + Alloy.Globals.localParser.getQuestionName(question),
	            alcrmQuestionID: Alloy.Globals.localParser.getQuestionName(question),
	            alcrmGroupType: Alloy.Globals.localParser.getQuestionGroup(question),
	            visable: questionVisable,
	            readOnly : false,
	            backgroundView : Alloy.Globals.Styles["normalQuestionBackground"],
	            order: Alloy.Globals.localParser.getQuestionOrder(question),
	            associatedFileName: passObject.associatedFileName, // file the question is in
	            questionResponse: null,
	
	            assessmentId: assessmentId,
	
	            notesBackground: {
	                backgroundImage: 'images/questionNote.png'
	            }, //{backgroundImage: 'images/questionSelectedNote.png'}
	            notes: "",
	            alcrmNotes : Alloy.Globals.localParser.getNotesText(question),
	            help : Alloy.Globals.localParser.getHelpText(question),
	            selected: false,
	
	            value: [""], // a list of all values set for this question
	            renderValue: questionRenderValues, // a list of condtions if the question is visable
	            selections: questionSelections, // a list of possible values for the question
	            validation: questionValidation,
	            mandatory : isMandatory, //can be changed at run time with conditionalMandatory
	            
	            subsectionTitle : Alloy.Globals.localParser.getTableRowText(question),
	
	            title: {
	                text: Alloy.Globals.localParser.getQuestionText(question)
	            }, // the title text for this question
	            displayValue: {
	                value: ""
	            },
	            displayValue2: {
	                value: ""
	            },
	
	            errorMessageVisable: false,
	            questionErrorMessageView: {},
	            questionErrorMessage: {},
	
	            renderDependencyList: [],
	            mandatoryDependenciesList : [],
	            headerView: {}
	        };
	        
	        if(passObject.readOnly == true){
		        questionObject.readOnly = true;
		        questionObject.headerView = Alloy.Globals.Styles["headerViewReadOnly"];
		    }
	        
	        questionObject = questionSetPastVariables(questionObject, questionMap);
	        
	        self.questionMap[questionObject.name] = questionObject;
	     	return questionObject;
	    }catch(e){
	    	Ti.API.info("Exception in createQuestionObject >> "+JSON.stringify(e));
	    	return null;
	    }
    };

    var questionSetPastVariables = function (questionObject, questionMap) {
    	
    	try{
	        if (questionObject.alcrmQuestionID in questionMap) {
	            if (questionObject.template === "dateTemplate" || questionObject.template === "textFieldTemplate") {
	            	            	
	                questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
	                questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];
	
	            } else if (questionObject.template === "singleSelectTemplate") {
	                questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
	                questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];
	
	                for (var i = 0; i < questionObject.selections.length; i++) {
	                    if (questionObject.selections[i].value === questionMap[questionObject.alcrmQuestionID].value) {
	                        questionObject.displayValue.value = questionObject.selections[i].displayValue;
	                        break;
	                    }
	                }
	            } else if (questionObject.template === "multiSelectTemplate") {
	                questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value;
	                questionObject.value = [questionMap[questionObject.alcrmQuestionID].value];
	
	                var temp = "";
					
					if(typeof questionMap[questionObject.alcrmQuestionID].value === "undefined" 
						|| !(questionMap[questionObject.alcrmQuestionID].value instanceof Array)) return questionObject;
						
	                for (var t = 0; t < questionMap[questionObject.alcrmQuestionID].value.length; t++) {
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
	            } else if (questionObject.template === "rangeFieldTemplate" || questionObject.template === "dateRangeTemplate") {
	                if (typeof questionMap[questionObject.alcrmQuestionID].value !== "undefined" &&
	                    questionMap[questionObject.alcrmQuestionID].value instanceof Array) {
	                    if (questionMap[questionObject.alcrmQuestionID].value.length >= 2) {
	                        questionObject.displayValue.value = questionMap[questionObject.alcrmQuestionID].value[0];
	                        questionObject.displayValue2.value = questionMap[questionObject.alcrmQuestionID].value[1];
	                    }
	                }
	            }
	
	        }
	        return questionObject;
		}catch(e){
			Ti.API.info("Exception in questionSetPastVariables >> "+JSON.stringify(e));
			return questionObject;
		}
    };

    var addQuestionToSectionHeader = function (question, passObject, assessmentId) {

		try{
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
	            title: getSectionDisplayName(question ,passObject),
	            groupType: groupType,
	            //displayName :getSectionDisplayName(question), 
	            alcrmGroupType: alcrmGroupType,
	            pageName: passObject.pageName,
	            pageType: passObject.pageType,
	            pageID: passObject.pageID,
	            associatedFileName: passObject.associatedFileName,
	            questionList: []
	        };
	        var newQuestionObject = createQuestionObject(question, passObject, groupType, assessmentId, passObject.questionMap);
	        if (newQuestionObject != null) {
	            newSectionHeader.questionList.push(newQuestionObject);
	        }
	        self.sectionHeaderList.push(newSectionHeader);
	     }catch(e){
	     	Ti.API.info("Exception in addQuestionToSectionHeader >> "+JSON.stringify(e));
	     	return null;
	     }
    };
    var testIfQuestionMandatory = function(questionObject){
    	
		var conditionalMandatoryList = questionObject.validation.conditionalMandatory;
    	for(var conditionalMandatoryIndex =0 ; conditionalMandatoryIndex < conditionalMandatoryList.length; conditionalMandatoryIndex++){
    		
    		if(conditionalMandatoryList[conditionalMandatoryIndex].question.name in self.questionMap){

    			var questionValues = self.questionMap[conditionalMandatoryList[conditionalMandatoryIndex].question.name].value;
    			
    			for(var questionValuesIndex = 0;questionValuesIndex < questionValues.length; questionValuesIndex++){
    				if(questionValues[questionValuesIndex] == conditionalMandatoryList[conditionalMandatoryIndex].value){
    					
    					mandatory = true;
    					
				        if (questionObject.title.text.slice(-1) != "*") {
				            questionObject.title.text = questionObject.title.text + "*";
				        }
					    
    					return questionObject;
    				}
    			}
    		}
    	}
    	
    	return questionObject;
    };
    
    var testIfQuestionVisable = function(questionObject){
    	
    	
    	for(var renderValueIndex =0 ; renderValueIndex < questionObject.renderValue.length; renderValueIndex++){
    		
    		if(questionObject.renderValue[renderValueIndex].question.name in self.questionMap){
    			var questionValues = self.questionMap[questionObject.renderValue[renderValueIndex].question.name].value;
    			
    			for(var questionValuesIndex = 0;questionValuesIndex < questionValues.length; questionValuesIndex++){
    				if(questionValues[questionValuesIndex] == questionObject.renderValue[renderValueIndex].value){
    					
    					questionObject.visable = true;
    					return questionObject;
    				}
    			}
    		}
    	}
    	
    	return questionObject;
    };

    var lookQuestionDependencies = function () {
      try{

        for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
            for (var questionIndex = 0; questionIndex < self.sectionHeaderList[sectionIndex].questionList.length; questionIndex++) {

                var name = self.sectionHeaderList[sectionIndex].questionList[questionIndex].name;

				//adds a list of all questions that have a Dependencies on if it is visable based on this question
                if (typeof renderDependenciesMap[name] !== "undefined") {
                    //Ti.API.info(name);

					//creates a list of Dependent question names with no repeated names
                    var questionNameArray = renderDependenciesMap[name];
                    questionNameArray = questionNameArray.filter(function (elem, pos) {
                        return questionNameArray.indexOf(elem) == pos;
                    });
                    
                    //builds a list objects for all of the render Dependent question for this question
                    renderDependenciesQuestionList = [];
                    for(var i=0; i< questionNameArray.length; i++){
                    	if(questionNameArray[i] in self.questionMap){
                    		renderDependenciesQuestionList.push({name : questionNameArray[i],  groupType : self.questionMap[questionNameArray[i]].groupType});
                    		
                    	}
                    }

                    self.sectionHeaderList[sectionIndex].questionList[questionIndex].renderDependencyList = renderDependenciesQuestionList;
                }
                
                //adds a list of all questions that have a Dependencies on if it is mandatory based on this question
                if (typeof mandatoryDependenciesMap[name] !== "undefined") {
                	
					//creates a list of Dependent question names with no repeated names
                    var questionNameArray = mandatoryDependenciesMap[name];
                    questionNameArray = questionNameArray.filter(function (elem, pos) {
                        return questionNameArray.indexOf(elem) == pos;
                    });
                    
                    //builds a list objects for all of the render Dependent question for this question
                   mandatoryDependenciesQuestionList = [];
                    for(var i=0; i< questionNameArray.length; i++){
                    	if(questionNameArray[i] in self.questionMap){
                    		mandatoryDependenciesQuestionList.push({name : questionNameArray[i],  groupType : self.questionMap[questionNameArray[i]].groupType});
                    	}
                    }
                    
                    self.sectionHeaderList[sectionIndex].questionList[questionIndex].mandatoryDependenciesList = mandatoryDependenciesQuestionList;
                }

            }
        }
        
       }catch(e){
       		Ti.API.info("Exception in lookQuestionDependencies >> "+JSON.stringify(e));
       }
    };
    
    
   	var addQuestionToSubsectionList = function(subSectionList, question){
   		
   		for(var i=0; i< subSectionList.length; i++){
   			if(subSectionList[i].title == question.subsectionTitle){
   				subSectionList[i].questionList.push(question);
   				return subSectionList;
   			}
   		}
   		
   		var newSubsection = {title : question.subsectionTitle, questionList : [], order : question.order};
   		newSubsection.questionList.push(question);
   		subSectionList.push(newSubsection);
   		return subSectionList;
   	};
   	
   	var createSubsectionHeader = function(title){
   		try{
	   		return {
	            isAQuestion: false,
	            readOnly : false,
	            template: "subsectionHeaderTemplate",
	            headerView : Alloy.Globals.Styles["headerViewSubsection"],
	            title: {
	                text: title
	            },
	            visable: true,
	            name: "",
	            questionToChangeTemplate: "singleSelectTemplate",
	            selections: [{
	                displayValue: "Yes",
	                value: 1
	            }, {
	                displayValue: "No",
	                value: 0
	            }],
	            renderValue: []
	        };
		}catch(e){
			Ti.API.info("Exception in createSubsectionHeader >> "+JSON.stringify(e));
			return null;
		}
   	};
   	
   	var addSubsectionsBackIntoQuestionList = function(questionList, subSectionList){
   		
   		//backgroundView
        try{       
	   		var subSectionIndex =0;
	   		var newQuestionList = [];
	   		for (var questionIndex = 0; questionIndex < questionList.length && subSectionIndex < subSectionList.length; questionIndex++) {
	   			if (questionList[questionIndex].subsectionTitle != null){
	   				continue;
	   			}
	   			else if (typeof questionList[questionIndex].order === "undefined"){
	   				newQuestionList.push(questionList[questionIndex]);
	   			}
	     		else if(parseInt(subSectionList[subSectionIndex].order) < parseInt(questionList[questionIndex].order)){
	     			
	     			newQuestionList.push(createSubsectionHeader(subSectionList[subSectionIndex].title));
	     			
	     			//subsectionHeaderTemplate
	     			for (var subSectionQuestionIndex = 0; subSectionQuestionIndex < subSectionList[subSectionIndex].questionList.length; subSectionQuestionIndex++) {	
	     				//subSectionList[subSectionIndex].questionList[subSectionQuestionIndex].backgroundView = Alloy.Globals.Styles["subsectionsQuestionBackground"];
	     				newQuestionList.push(subSectionList[subSectionIndex].questionList[subSectionQuestionIndex]);
	     			}
	     			subSectionIndex++;
	     		}
	     	}
	     	
	     	for(subSectionIndex; subSectionIndex < subSectionList.length; subSectionIndex++){
	     		
				newQuestionList.push(createSubsectionHeader(subSectionList[subSectionIndex].title));
	     			
	     		for (var subSectionQuestionIndex = 0; subSectionQuestionIndex < subSectionList[subSectionIndex].questionList.length; subSectionQuestionIndex++) {	
	 				//subSectionList[subSectionIndex].questionList[subSectionQuestionIndex].backgroundView = Alloy.Globals.Styles["subsectionsQuestionBackground"];
	 				newQuestionList.push(subSectionList[subSectionIndex].questionList[subSectionQuestionIndex]);
	 			}
	 			subSectionIndex++;
	     	}
	     	
	     	return newQuestionList;
		}catch(e){
			Ti.API.info("Exception in addSubsectionsBackIntoQuestionList >> "+JSON.stringify(e));
			return [];
		}
   	};
    
    
    
     var addSubsections = function () {
     	try{
	     	for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
	     		if (self.sectionHeaderList[sectionIndex].alcrmGroupType == "Sighting") {
	     			
	     			//var newQuestionList = [];
	     			var subSectionList = [];
	     			
	     			var oldQuestionList = self.sectionHeaderList[sectionIndex].questionList;
	     			for (var questionIndex = 0; questionIndex < oldQuestionList.length; questionIndex++) {
	     				
	     				if(oldQuestionList[questionIndex].subsectionTitle != null){
	     					//newQuestionList.push(oldQuestionList[questionIndex]);
	     					addQuestionToSubsectionList(subSectionList, oldQuestionList[questionIndex]);
	     				}
	   
	     				
	     			}
	     			
	     			self.sectionHeaderList[sectionIndex].questionList = addSubsectionsBackIntoQuestionList(oldQuestionList, subSectionList);
	     		}
	     	}
	    }catch(e){
			Ti.API.info("Exception in addSubsections >> "+JSON.stringify(e));
			return [];
		}
     };

    var postInterpretSettings = function (passObject) {
    	try{
    		var userPreferences = Alloy.Globals.User.getPreferences();
	    	//Ti.API.info("censusCounterQuestions = "+Ti.App.Properties.getString('censusCounterQuestions'));
	    	//var censusCounterQuestions = JSON.parse(Ti.App.Properties.getString('censusCounterQuestions'));
	    		
	        for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
	        	
	        	if(self.sectionHeaderList[sectionIndex].alcrmGroupType in removedSectionsMap){
	        		//Ti.API.info("self.sectionHeaderList[sectionIndex].alcrmGroupType in hiddenSectionsMap TRUE");
	        		self.sectionHeaderList.splice(sectionIndex, 1);
	        		sectionIndex = sectionIndex - 1;
	        	}
	            else if (self.sectionHeaderList[sectionIndex].alcrmGroupType == "Photograph") {
	                var newRow = {
	                    isAQuestion: false,
	                    readOnly : false,
	                    template: "setEntireSectionTemplate",
	
	                    title: {
	                        text: "Set all photograph questions to"
	                    },
	                    visable: true,
	                    name: "",
	                    questionToChangeTemplate: "singleSelectTemplate",
	                    selections: [{
	                        displayValue: "Yes",
	                        value: 1
	                    }, {
	                        displayValue: "No",
	                        value: 0
	                    }],
	                    renderValue: []
	                };
	                self.sectionHeaderList[sectionIndex].questionList.unshift(newRow); //adds row to front of the list
	            }
	            else if(self.sectionHeaderList[sectionIndex].alcrmGroupType == "CensusGeneral"){
	            	self.sectionHeaderList[sectionIndex].questionList.unshift(createCensusDateQuestion(passObject, self.sectionHeaderList[sectionIndex]));
	            }  
	
				
	            for (var questionIndex = 0; questionIndex < self.sectionHeaderList[sectionIndex].questionList.length; questionIndex++) {
					
					if (self.sectionHeaderList[sectionIndex].questionList[questionIndex] == null){
						self.sectionHeaderList[sectionIndex].questionList[questionIndex].splice(questionIndex,1);
						questionIndex--;
						Ti.API.info("question object is null!!!");
					};
					
	                if (self.sectionHeaderList[sectionIndex].questionList[questionIndex].isAQuestion == false) continue;
	                
	                if(self.sectionHeaderList[sectionIndex].questionList[questionIndex].alcrmQuestionID in hiddenQuestionsMap){
	                	self.sectionHeaderList[sectionIndex].questionList[questionIndex].visable = false;
	                	self.sectionHeaderList[sectionIndex].questionList[questionIndex].renderDependencyList = [];
	                }
	                if(self.sectionHeaderList[sectionIndex].questionList[questionIndex].alcrmQuestionID in censusCounterQuestionMap){
	                	self.sectionHeaderList[sectionIndex].questionList[questionIndex].template = "censusCounterTemplate";
	                }
	                
	                if(self.sectionHeaderList[sectionIndex].questionList[questionIndex].alcrmQuestionID == "I_DURATION"){
	                	self.sectionHeaderList[sectionIndex].questionList[questionIndex].template = "minuteHourTimeTemplate";
	                	self.sectionHeaderList[sectionIndex].questionList[questionIndex].type = "timerPicker";
	                }
	                
	
	                var questionObject = self.sectionHeaderList[sectionIndex].questionList[questionIndex];
	                
	                
	                
	                questionObject =  testIfQuestionVisable(questionObject);
	                questionObject =  testIfQuestionMandatory(questionObject);
	                
	                if(questionObject.mandatory == true){
	                	if (questionObject.title.text.slice(-1) != "*") {
				            questionObject.title.text = questionObject.title.text + "*";
				        }
	                }
	                
	                if(passObject.readOnly == true){
				        questionObject.readOnly = true;
				        questionObject.template = "textFieldTemplate";
				        questionObject.headerView = Alloy.Globals.Styles["headerViewReadOnly"];
				        if (questionObject.title.text.slice(-1) == "*") {
				            questionObject.title.text = questionObject.title.text.substring(0, questionObject.title.text.length - 1);
				        }
				    }
				    
				    if(questionObject.type == "numeric"){
				    	questionObject.displayValue.keyboardType = Ti.UI.KEYBOARD_NUMBER_PAD;
				    }
				    if(questionObject.type == "decimal"){
				    	questionObject.displayValue.keyboardType = Ti.UI.KEYBOARD_DECIMAL_PAD;
				    }
                    
	
	                //self.sectionHeaderList[sectionIndex].questionList[questionIndex]
	                if (questionObject.alcrmQuestionID == "I_COLLECTOR_NAME") {
	                    questionObject.value = [userPreferences.name];
	                    questionObject.mandatory = false;
	                    questionObject.displayValue = {
	                        value: userPreferences.name
	                    };
	                } else if (questionObject.alcrmQuestionID == "PHONE_NUMBER") {
	                    questionObject.value = [userPreferences.mobile];
	                    questionObject.mandatory = false;
	                    questionObject.displayValue = {
	                        value: userPreferences.mobile
	                    };
	                } else if (questionObject.alcrmQuestionID == "EMAIL_ADDRESS") {
	                    questionObject.value = [userPreferences.email];
	                    questionObject.mandatory = false;
	                    questionObject.displayValue = {
	                        value: userPreferences.email
	                    };
	                } 
	               else if(questionObject.alcrmQuestionID == "I_CENSUS_QUICK_START") {
	                	questionObject.template = "censusStartTimerTemplate";
	               }
	               /*
	               //Ti.App.Properties.getString('censusCounterQuestions') //TODO : add this
	               else if(questionObject.alcrmQuestionID == "I_CAR_COUNT" ||
	               			questionObject.alcrmQuestionID == "I_LOR_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_BUS_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_HGV_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_PED_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_CYC_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_HOOF_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_EQUESTRIAN_COUNT" || 
	               			questionObject.alcrmQuestionID == "I_TRACTOR_COUNT") {
	                	questionObject.template = "censusCounterTemplate";
	               }
	               */
	               
	            	/*
	               else if(questionObject.alcrmGroupType == "CrossingGeneral") {
	                	questionObject.readOnly = true;
	                	questionObject.headerView = Alloy.Globals.Styles["headerViewReadOnly"];
	               }
	               */
	               
	               /*
	               for(var censusCounterQuestionsIndex =0; censusCounterQuestionsIndex < censusCounterQuestions.length; censusCounterQuestionsIndex++){
	               		if(questionObject.alcrmQuestionID == censusCounterQuestions[censusCounterQuestionsIndex]){
	               			questionObject.template = "censusCounterTemplate";
	               		}
	               }
	               */
	               
	               
	                
	                for(var renderValueIndex = 0; renderValueIndex < questionObject.renderValue.length; renderValueIndex++){
	                	if(questionObject.renderValue[renderValueIndex].question.name in self.questionMap){
	                		questionObject.renderValue[renderValueIndex].question.groupType = self.questionMap[questionObject.renderValue[renderValueIndex].question.name].groupType;
	                	}
	                	else{
	                		Ti.API.info("interpreterModule2 :: NOT FOUND = "+questionObject.renderValue[renderValueIndex].question.name);
	                	}
	                }
	                
	                for(var conditionalMandatoryIndex = 0; conditionalMandatoryIndex < questionObject.validation.conditionalMandatory.length; conditionalMandatoryIndex++){
	                	if(questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name in self.questionMap){
	                		
	                		questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.groupType = self.questionMap[questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name].groupType;
	                	}
	                	else{
	                		Ti.API.info("interpreterModule2 :: NOT FOUND = "+questionObject.validation.conditionalMandatory[conditionalMandatoryIndex].question.name);
	                	}
	                }
	                
	                
	                
	                //validation.conditionalMandatory
	
	                self.sectionHeaderList[sectionIndex].questionList[questionIndex] = questionObject;
	            }
	        }
	        
	        addSubsections();
		}catch(e){
			Ti.API.info("Exception in postInterpretSettings >> "+JSON.stringify(e));
		}
    };

    var sortQuestionsByOrder = function () {
		try{
	        //sort the question by order within each section
	        for (var sectionIndex = 0; sectionIndex < self.sectionHeaderList.length; sectionIndex++) {
	            self.sectionHeaderList[sectionIndex].questionList.sort(function (a, b) {
	                return parseInt(a.order) - parseInt(b.order);
	            });
	        }
	
	        //sort the sections by order of the first question in the section
	        self.sectionHeaderList.sort(function (a, b) {
	            return parseInt(a.questionList[0].order) - parseInt(b.questionList[0].order);
	        });
	    }catch(e){
			Ti.API.info("Exception in sortQuestionsByOrder >> "+JSON.stringify(e));
		}
    };
    
    
    var readAppconfig = function(){

	    	var removedSections = Ti.App.Properties.getList("removedSections", []);
	    	Ti.API.info("removedSections = "+JSON.stringify(removedSections));
	    	removedSectionsMap = [];
			for(var i=0; i< removedSections.length; i++){
				removedSectionsMap[removedSections[i]] = true;
			}
			
    		var removedQuestions = Ti.App.Properties.getList("removedQuestions", []);
    		Ti.API.info("removedQuestions = "+JSON.stringify(removedQuestions));
    		removedQuestionsMap = [];
			for(var i=0; i< removedQuestions.length; i++){
				removedQuestionsMap[removedQuestions[i]] = true;
			}
    		
    		var hiddenQuestions = Ti.App.Properties.getList("hiddenQuestions", []);
    		Ti.API.info("hiddenQuestions = "+JSON.stringify(hiddenQuestions));
    		hiddenQuestionsMap = [];
			for(var i=0; i< hiddenQuestions.length; i++){
				hiddenQuestionsMap[hiddenQuestions[i]] = true;
			}
			
			var censusCounterQuestions = Ti.App.Properties.getList("censusCounterQuestions", []);
    		Ti.API.info("censusCounterQuestions = "+JSON.stringify(censusCounterQuestions));
    		censusCounterQuestionMap = [];
			for(var i=0; i< censusCounterQuestions.length; i++){
				censusCounterQuestionMap[censusCounterQuestions[i]] = true;
			}
			
			
			
    };
    

    self.interpret = function (allQuestions, passObject) {
    	

    	try{
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
	    }catch(e){
	    	Alloy.Globals.aIndicator.hide();
	    	Ti.API.info("self.interpret failed");
	    	Ti.API.error("Interpreter.interpret has an exception: "+JSON.stringify(e));
	    	return [];
	    }
    };

}
module.exports = new interpreterModule2;