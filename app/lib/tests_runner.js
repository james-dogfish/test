//test alessio change

function run() {
    var Alloy = require('alloy');

    var tijasmine = require('test-framework/tijasmine'),
        reporter = new (require('test-framework/tijasmine-console').ConsoleReporter);
	Ti.API.info("============ RUNNING UNIT TESTS ... ===========");
    tijasmine.addSpecModules(
        "specs/Parser/parserSpec",
        "specs/LocalDataHandler/localDataHandler",
        "specs/ResponseGenerator/responseGenerator",
        "specs/Validator/validatorSpec"
    );
    tijasmine.addReporter(reporter);
    tijasmine.execute();
}

exports.run = run;