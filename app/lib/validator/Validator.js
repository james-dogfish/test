// Contains validation functions

function _Validator() {

	this.isEmail = function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	};

	this.isDecimal = function(number) {
		if (number.toString().indexOf('.') !== -1) {
			var decimalReg = /^\d*\.?\d*$/;
			return decimalReg.test(number);
		} else {
			var numReg = /^\d+$/;
			return numReg.test(number);;
		}
	};

	this.numberLiesBetween = function(number, lbound, ubound, charLength) {
		if (charLength) {
			if ((number >= lbound && number <= ubound) && (number.toString().length <= charLength)) {
				return true;
			} else {
				return false;
			}
		} else {
			if (number >= lbound && number <= ubound) {
				return true;
			} else {
				return false;
			}
		}
	};

	this.isNumber = function(number, lengthtoCheck) {
		var re = /^\d+$/;
		if (lengthtoCheck) {
			return (re.test(number) && number.toString().trim().length <= lengthtoCheck);
		} else {
			return re.test(number);
		}
	};

	/*
	|---------------------------------------------------------------------------------
	| will check input text against a character limit
	|---------------------------------------------------------------------------------
	*/
	this.isValidText = function(inputText, characterLength) {
		var charLength = characterLength ? characterLength : 1500;
		if (inputText.length >= charLength) {
			return false;
		} else {
			return true;
		}
	};
	
	this.isValidFormat = function(inputFormat)
	{
		var re=/^0[0-9]|1[0-9]|2[0-3]:[0-5][0-9]$/;

		return re.test(inputFormat);
	};

	return this;

};

module.exports = new _Validator();