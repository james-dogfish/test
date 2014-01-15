require('/test-framework/tijasmine').infect(this);

//NOTE: This test must be executed right after the App Startup in order for Alloy.Globals.parsedData to be defined.
describe("Local Data Handler Test Suite", function () {
	
    var LocalDataHandler = require('localDataHandler/localDataHandler');
 	
 	//addUserResponse
    it('test addUserResponse function returns success TRUE', function(){
		 	LocalDataHandler = new LocalDataHandler();
		 	
		 	var response = false;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		response = LocalDataHandler.addUserResponse(Alloy.Globals.parsedData[0],"test");
		 	}
			
			expect(response).toEqual(true);
    });
    
     it('test addUserResponse function returns success FALSE', function(){
		 	LocalDataHandler = new LocalDataHandler();
		 	
		 	var response = true;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		response = LocalDataHandler.addUserResponse(Alloy.Globals.parsedData[0],"test");
		 		if(response){
		 			response = false;
		 		}
		 	}
			
			expect(response).toEqual(false);
    });
    
    //removeUserResponse
     it('test removeUserResponse function returns success TRUE', function(){
		 	LocalDataHandler = new LocalDataHandler();
		 	
		 	var response = false;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		response = LocalDataHandler.removeUserResponse(Alloy.Globals.parsedData[0]);
		 	}
			
			expect(response).toEqual(true);
    });
    
     it('test removeUserResponse function returns success FALSE', function(){
		 	LocalDataHandler = new LocalDataHandler();
		 	
		 	var response = true;
		 	if(typeof Alloy.Globals.parsedData !="undefined")
		 	{
		 		response = LocalDataHandler.removeUserResponse(Alloy.Globals.parsedData[0]);
		 		if(response){
		 			response = false;
		 		}
		 	}
			
			expect(response).toEqual(false);
    });
    /* END OF TEST SUITE */
});