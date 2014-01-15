require('/test-framework/tijasmine').infect(this);

describe("Validator Test Suite", function () {
	
    var Validator = require('validator/Validator');
 	
 	//isEmail
    it('test valid email', function(){
		 	var valid_email = "email@dogfi.sh";

			expect(Validator.isEmail(valid_email)).toEqual(true);
    });
    it('test invalid email', function(){
		 	var invalid_email = "email@dogfi";

			expect(Validator.isEmail(invalid_email)).toEqual(false);
    });
    
    //isDecimal
     it('test valid decimal', function(){
		 	var valid_decimal = "1.1";

			expect(Validator.isDecimal(valid_decimal)).toEqual(true);
    });
    it('test invalid decimal', function(){
		 	var invalid_decimal = "1";

			expect(Validator.isDecimal(valid_decimal)).toEqual(false);
    });
    it('test invalid decimal with string', function(){
		 	var invalid_decimal = "ffgdfgd";

			expect(Validator.isDecimal(valid_decimal)).toEqual(false);
    });
    it('test if number lies between 1-10', function(){
		 	var start = "1";
		 	var end   = "10";
		 	var number = "5";

			expect(Validator.numberLiesBetween(number,start,end,1)).toEqual(true);
    });
    it('test if number lies between 1-10', function(){
		 	var start = "1";
		 	var end   = "10";
		 	var number = "11";

			expect(Validator.numberLiesBetween(number,start,end,1)).toEqual(false);
    });
    it('test if number is a number', function(){
		 	var number = 5;

			expect(Validator.isNumber(number)).toEqual(true);
    });
    it('test if number is NOT a number', function(){
		 	var number = 'abc';

			expect(Validator.isNumber(number)).toEqual(false);
    });
    it('test if text is valid text', function(){
		 	var some_text = 'abc';

			expect(Validator.isValidText(some_text.length)).toEqual(true);
    });
    it('test if text is NOT valid text', function(){
		 	var some_text = 123;

			expect(Validator.isValidText(some_text.length)).toEqual(false);
    });
    
    //isValidFormat
    it('test HH:MM is valid format', function(){
		 	var format = "HH:MM";

			expect(Validator.isValidFormat(format)).toEqual(true);
    });
     it('test HH:MM:SS is valid format', function(){
		 	var format = "HH:MM:SS";

			expect(Validator.isValidFormat(format)).toEqual(true);
    });
     it('test DD-MM-YYYY is valid format', function(){
		 	var format = "DD-MM-YYY";

			expect(Validator.isValidFormat(format)).toEqual(true);
    });
    it('test HH,MM is NOT valid format', function(){
		 	var format = "HH,MM";

			expect(Validator.isValidFormat(format)).toEqual(false);
    });
     it('test HH,MM:SS is NOT valid format', function(){
		 	var format = "HH,MM:SS";

			expect(Validator.isValidFormat(format)).toEqual(false);
    });
     it('test DD-MM,YYYY is NOT valid format', function(){
		 	var format = "DD-MM,YYY";

			expect(Validator.isValidFormat(format)).toEqual(false);
    });
    /* END OF TEST SUITE */
});