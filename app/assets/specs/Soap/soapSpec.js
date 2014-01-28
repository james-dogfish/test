require('/test-framework/tijasmine').infect(this);

describe("Soap Module Test Suite", function () {
	
	var Soap = require('core/Soap');
	
    it('test Soap Object is valid', function(){
			expect(Soap).not.toBeUndefined();
    });
    
 	it('test Soap Object is invalid', function(){
 			if(typeof Soap !== "undefined")
 			{
 				Soap = "undefined";
 			}
			expect(Soap).toBeUndefined();
    });
    
	it('test Login Call is successfull', function(){
		
			var success = true;
			
			Soap.login({
                name: 'Paul Haggett'
           	},
           	function(xmlDoc){
           		var XMLTools = require("tools/XMLTools");
				var xml2 = new XMLTools(xmlDoc);
				var loginObj = JSON.stringify(xml2.toObject());
				if(typeof loginObj === "undefined" || 
			      	typeof loginObj["soapenv:Body"] === "undefined" ||
			      	typeof loginObj["soapenv:Body"]["soapenv:Fault"] === "undefined" ||
			      	typeof loginObj["soapenv:Body"]["soapenv:Fault"]["detail"] === "undefined")
			      {
			      	success = false;
			      }
           	},
           	function(xmlDoc){
           		sucess = false;
           	},
           	{
                password: 'WrksdhfsiuYY45'
            });
            
            
			expect(success).toEqual(true);
    });
    
	it('test Login Call is NOT successfull', function(){
		
			var success = true;
			
			Soap.login({
                name: 'Paul ABC'
           	},
           	function(xmlDoc){
           		var XMLTools = require("tools/XMLTools");
				var xml2 = new XMLTools(xmlDoc);
				var loginObjRes = JSON.stringify(xml2.toObject());
				var loginObj = JSON.parse(loginObjRes);
				
				if(typeof loginObj === "undefined" || 
			      	typeof loginObj["soapenv:Body"] === "undefined" ||
			      	typeof loginObj["soapenv:Body"]["soapenv:Fault"] === "undefined" ||
			      	typeof loginObj["soapenv:Body"]["soapenv:Fault"]["detail"] === "undefined")
			      {
			      	success = false;
			      }
           	},
           	function(xmlDoc){
           		sucess = false;
           	},
           	{
                password: 'Wrksdhxxxxxx'
            });
       
			expect(success).toEqual(false);
    });
    
    it('test searchCrossingRequest Call is successfull', function(){
		
			var success = true;
			
			var User = require('core/User');
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	Soap.searchCrossingRequest({
		    		searchCriteria:{
							'com:searchCriteria':{
								'ques:parameterName':'CROSSING_SEARCH_AREA_NAME',
								'ques:parameterValue':'SCOTLAND',
							},
						},
						sortByELR:true,
						includeDeleted:false
		    	},function(xmlDoc){
		    		var XMLTools = require("tools/XMLTools");
			        var xml = new XMLTools(xmlDoc);
			        var crossingsObject = JSON.stringify(xml.toObject());
			                
			        var data = JSON.parse(crossingsObject);
			        var results = data["soapenv:Body"]["ns9:AdvancedSearchResponse"]["ns9:searchResults"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	success = false;
			                }
		    	},function(xmlDoc){
		    		success = false;
		    	});
		    });	
       
			expect(success).toEqual(true);
    });
    
    it('test searchCrossingRequest Call is NOT successfull', function(){
		
			var success = true;
			
			var User = require('core/User');
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	Soap.searchCrossingRequest({
		    		searchCriteria:{
							'com:searchCriteria':{
								'ques:parameterName':'CROSSING_SEARCH_AREA_NAME',
								'ques:parameterValue':'SOME_RANDOM_THING',
							},
						},
						sortByELR:true,
						includeDeleted:false
		    	},function(xmlDoc){
		    		var XMLTools = require("tools/XMLTools");
			        var xml = new XMLTools(xmlDoc);
			        var crossingsObject = JSON.stringify(xml.toObject());
			                
			        var data = JSON.parse(crossingsObject);
			        var results = data["soapenv:Body"]["ns9:AdvancedSearchResponse"]["ns9:searchResults"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	success = false;
			                }
		    	},function(xmlDoc){
		    		success = false;
		    	});
		    });	
       
			expect(success).toEqual(false);
    });
    
    it('test getCrossingRequest Call is successfull', function(){
		
			var success = true;
			
			var User = require('core/User');
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	Soap.getCrossingRequest({
		    		crossingId: 100, //TODO: add an existent crssoing ID here.
		    	},function(xmlDoc){
		    		var XMLTools = require("tools/XMLTools");
			        var xml = new XMLTools(xmlDoc);
			        var crossingsObject = JSON.stringify(xml.toObject());
			                
			        var data = JSON.parse(crossingsObject);
			        var results = data["soapenv:Body"]["ns8:GetCrossingResponse"]["ns8:crossing"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	success = false;
			                }
		    	},function(xmlDoc){
		    		success = false;
		    	});
		    });	
       
			expect(success).toEqual(true);
    });
    
    it('test getCrossingRequest Call is NOT successfull', function(){
		
			var success = true;
			
			var User = require('core/User');
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	Soap.getCrossingRequest({
		    		crossingId: 'some-invaid-stuff-here',
		    	},function(xmlDoc){
		    		var XMLTools = require("tools/XMLTools");
			        var xml = new XMLTools(xmlDoc);
			        var crossingsObject = JSON.stringify(xml.toObject());
			                
			        var data = JSON.parse(crossingsObject);
			        var results = data["soapenv:Body"]["ns8:GetCrossingResponse"]["ns8:crossing"];
			                if(typeof results === undefined || results === "undefined")
			                {
			                	success = false;
			                }
		    	},function(xmlDoc){
		    		success = false;
		    	});
		    });	
       
			expect(success).toEqual(false);
    });
    /* END OF TEST SUITE */
});
    