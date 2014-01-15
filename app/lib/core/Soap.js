/*
|---------------------------------------------------------------------------------
| Helper file for executing soap requests
|---------------------------------------------------------------------------------
*/

var _Soap = function() {

	/*
	|---------------------------------------------------------------------------------
	| Setting up URL endpoints
	| Requiring Suds, XMLTools
	|---------------------------------------------------------------------------------
	*/

	var targetNS,
		wsSecurity = false,
		loginUrl,
		crossingUrl,
		assessmentUrl,
		questionsUrl,
		suds;


	var XMLTools = require('tools/XMLTools'),
		User = require('core/User'),
		Util = require('core/Util');



		targetNS = 'http://com/icon/networkrail/alcrm/',
		loginUrl = 'http://server.iconsolutions.com/alcrm3/adminService/admin.wsdl',
		assessmentUrl = 'http://server.iconsolutions.com/alcrm3/assessmentService/assessment.wsdl',
		questionsUrl = 'http://server.iconsolutions.com/alcrm3/questionsService/questions.wsdl',
		crossingUrl  = 'http://server.iconsolutions.com/alcrm3/crossingService/crossing.wsdl',
		censusUrl = 'http://server.iconsolutions.com/alcrm3/censusService/census.wsdl',
		suds = require('tools/Suds2_fat');



	var soapObject = {
		/*
		|---------------------------------------------------------------------------------
		| Logs a user into ALCRM
		|---------------------------------------------------------------------------------
		*/
		
		login: function(args, success, failure, pwd) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: loginUrl,
						targetNamespace: targetNS + 'admin',
						ns: 'adm',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:adm="http://com/icon/networkrail/alcrm/admin">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										'   <wsse:Username>'+args.name+'</wsse:Username>' + 
										'   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+/*Kafk3TB4JlTq+QvwDUDBOYnVMfM=*/pwd.password+'</wsse:Password>'+
										//'   <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">BWN4LrrN+32eFQUId/sylQ==</wsse:Nonce>'+
										//'   <wsu:Created>' +new Date().getTime()/*2013-12-10T16:46:20.877Z*/+'</wsu:Created>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Admin</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('GetUserRequest', args, success, failure);
		},
			
		/*
		|---------------------------------------------------------------------------------
		| Returns the core crossing details for a given crossing
		|---------------------------------------------------------------------------------
		*/
		searchCrossingRequest: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: crossingUrl,
						targetNamespace: targetNS + 'crossing',
						ns: 'cros',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cros="http://com/icon/networkrail/alcrm/crossing" xmlns:com="http://common.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										'   <wsse:Username>'+ userPass.username +'</wsse:Username>' + 
										'   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Crossing</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('AdvancedSearchRequest', args, success, failure);
		},
		
		/*
		|---------------------------------------------------------------------------------
		| ==== ASSESSMENT OPERATIONS ====
		|---------------------------------------------------------------------------------
		*/
		getAssessment: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'assessment',
						ns: 'ass',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ass="http://com/icon/networkrail/alcrm/assessment">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('GetAssessmentRequest', args, success, failure);
		},
		
		searchAssessment: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'assessment',
						ns: 'ass',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ass="http://com/icon/networkrail/alcrm/assessment" xmlns:com="http://common.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('SearchAssessmentRequest', args, success, failure);
		},
		
		copyAssessment: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'assessment',
						ns: 'ass',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ass="http://com/icon/networkrail/alcrm/assessment">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('CopyAssessmentRequest', args, success, failure);
		},

		createAssessment: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'assessment',
						ns: 'ass',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ass="http://com/icon/networkrail/alcrm/assessment" xmlns:ass1="http://assessment.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com" xmlns:risk="http://risk.beans.alcrm.networkrail.icon.com">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('CreateAssessmentRequest', args, success, failure);
		},
		
		/*
		|---------------------------------------------------------------------------------
		| Returns the question request
		| TODO: replace hard coded username and password with loggedIn User Details
		|---------------------------------------------------------------------------------
		*/
		getQuestionsRequest: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: questionsUrl,
						targetNamespace: targetNS + 'questions',
						ns: 'ques',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ques="http://com/icon/networkrail/alcrm/questions">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Questions</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('GetQuestionsRequest', args, success, failure);
		},
		
		/*
		|---------------------------------------------------------------------------------
		| Returns the questions for the given args
		| TODO: replace hard coded username and password with loggedIn User Details
		|---------------------------------------------------------------------------------
		*/
		getQuestionsResponse: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: questionsUrl,
						targetNamespace: targetNS + 'questions',
						ns: 'ques',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ques="http://com/icon/networkrail/alcrm/questions">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										' xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										' xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										'<wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										'<wsse:Username>'+userPass.username+'</wsse:Username>' + 
										'<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Questions</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('GetQuestionsResponse', args, success, failure);
		},
		
		/*
		|---------------------------------------------------------------------------------
		| CENSUS OPERATIONS
		|---------------------------------------------------------------------------------
		*/
		getCensus: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'census',
						ns: 'cen',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://com/icon/networkrail/alcrm/census">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('GetCensusRequest', args, success, failure);
		},
		
		createCensus: function(args, success, failure) {
			var userPass = User.getLogin();
			var sudsClient = new suds({
						endpoint: assessmentUrl,
						targetNamespace: targetNS + 'census',
						ns: 'cen',
						includeNS: true,
						xmlDeclaration: '',
						envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://com/icon/networkrail/alcrm/census">',
						bodyBegin: '<soapenv:Body>',
						bodyEnd: '</soapenv:Body>',
						envelopeEnd: '</soapenv:Envelope>',
						headerBegin: '<soapenv:Header>',
						headerContent: '<wsse:Security soapenv:mustUnderstand="1"' + 
										'   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
										'   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' + 
										' <wsse:UsernameToken wsu:Id="UsernameToken-1">' + 
										' <wsse:Username>'+userPass.username+'</wsse:Username>' + 
										' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+userPass.password+'</wsse:Password>'+
										'</wsse:UsernameToken>' + 
										'</wsse:Security>' + 
										'<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
						headerEnd: '</soapenv:Header>',
						enableWs: true
			});

			sudsClient.invoke('CreateCensusRequest', args, success, failure);
		},
		
		/*
		|---------------------------------------------------------------------------------
		| RISK OPERATIONS TODO
		|---------------------------------------------------------------------------------
		*/
		

	};

	return soapObject;

};

module.exports = new _Soap();