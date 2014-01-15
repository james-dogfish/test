require('/test-framework/tijasmine').infect(this);

describe("Response Generator Test Suite", function () {
	
    var ResponseGenerator = require('responseGenerator/responseGenerator');
 	
 	//generateResponse
    it('test generateRespons() produces valid XML', function(){
		 	ResponseGenerator = new ResponseGenerator();
		 	
		 	var generatedResponse = undefined;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		var xml = ResponseGenerator.generateResponse(Alloy.Globals.parsedData);
		 		generatedResponse = Ti.XML.parseString(xml);
		 	}

			expect(generatedResponse).not.toBeUndefined();
    });
    
    it('test generateRespons() is undefined', function(){
		 	ResponseGenerator = new ResponseGenerator();
		 	
		 	var generatedResponse = undefined;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		var xml = ResponseGenerator.generateResponse(Alloy.Globals.parsedData);
		 		if(typeof xml !== "undefined")
		 		{
		 			xml = "";
		 		}
		 		generatedResponse = Ti.XML.parseString(xml);
		 	}

			expect(generatedResponse).toBeUndefined();
    });
    /* END OF TEST SUITE */
});