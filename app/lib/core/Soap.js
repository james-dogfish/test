// Soap Module
// ----------------
// Helper file for executing soap requests

var _Soap = function () {

    var targetNS = 'http://com/icon/networkrail/alcrm/', // url for namespace
        serverUrl = Alloy.CFG.serverUrl.ppte, // url for server
        wsSecurity = true,
        suds = require('tools/Suds2_fat');


    // Check to see if ian has left an endpoint override file in to the app dir
    var overRide = Alloy.Globals.Util.getOverrideFile();
    if (overRide.uri) {

        var uri = overRide.uri,
            lastChar = uri.substr(-1); // Selects the last character

        if (lastChar !== '/') { // If the last character is not a slash
            uri += '/';
        }
        serverUrl = uri;
    }

    if (overRide.ws_security) { //overriding ws here
        wsSecurity = overRide.ws_security;
    }
    
    var loginUrl = serverUrl + 'adminService/admin.wsdl',
    assessmentUrl = serverUrl + 'assessmentService/assessment.wsdl',
    questionsUrl = serverUrl + 'questionsService/questions.wsdl',
    crossingUrl = serverUrl + 'crossingService/crossing.wsdl',
    censusUrl = serverUrl + 'censusService/census.wsdl',
    trainUrl = serverUrl + 'trainService/train.wsdl';

    var soapObject = {

/**
 * `login` - deals with login functionality. Invokes the SUDS client for Login.
 * 
 * @params args
 * @params password
 * @params success
 * @params failure
 * 
 * @method login
 * 
 * @return {} N/A
 */
        login: function (args, password, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    '   <wsse:Username>' + args.name + '</wsse:Username>' +
                    '   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + /*Kafk3TB4JlTq+QvwDUDBOYnVMfM=*/ password + '</wsse:Password>' +
                '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Admin</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetUserRequest', args, success, failure);
            
           return sudsClient;
        },

/**
 * `searchCrossingRequest` - Returns the core crossing details for a given crossing
 * 
 * @params args    - the arguments we want to use with 
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method searchCrossingRequest
 * 
 * @return {} N/A
 */
        searchCrossingRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    '   <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    '   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Crossing</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('SearchCrossingRequest', args, success, failure);
            
           return sudsClient;
        },
        
        advSearchCrossingRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    '   <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    '   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Crossing</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('AdvancedSearchRequest', args, success, failure);
            
           return sudsClient;
        },
        
 /**
 * `getCrossingRequest` - Returns the core crossing details for a given crossing
 * 
 * @params args    - the arguments we want to use with 
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method getCrossingRequest
 * 
 * @return {} N/A
 */       
         getCrossingRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: crossingUrl,
                targetNamespace: targetNS + 'crossing',
                ns: 'cros',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cros="http://com/icon/networkrail/alcrm/crossing">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    '   <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    '   <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Crossing</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetCrossingRequest', args, success, failure);
            
            return sudsClient;
        },


 /**
 * `getAssessment` - Returns a specific assessment
 * 
 * @params args    - the arguments we want to use with 
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method getAssessment
 * 
 * @return {} N/A
 */    
        getAssessment: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetAssessmentRequest', args, success, failure);
            
           return sudsClient;
        },

 /**
 * `searchAssessment` - Returns a specific assessment based on the search criteria
 * 
 * @params args    - the arguments we want to use with (such as search criteria for example)
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method searchAssessment
 * 
 * @return {} N/A
 */ 
        searchAssessment: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('SearchAssessmentRequest', args, success, failure);
            
           return sudsClient;
        },

        copyAssessment: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('CopyAssessmentRequest', args, success, failure);
            
           return sudsClient;
        },
 /**
 * `createAssessment` - Creates an assessment with the given payload.
 * 
 * @params args    - the arguments we want to use with (such as xml payload)
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method createAssessment
 * 
 * @return {} N/A
 */ 
        createAssessment: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('CreateAssessmentRequest', args, success, failure);
            
            return sudsClient;
        },
   
 /**
 * `updateAssessment` - Updates an assessment with the given payload.
 * 
 * @params args    - the arguments we want to use with (such as xml payload)
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method updateAssessment
 * 
 * @return {} N/A
 */     
        updateAssessment: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Assessment</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('UpdateAssessmentRequest', args, success, failure);
            
            return sudsClient;
        },

/**
 * `getQuestionsRequest` - Returns a set of questions based on the specified
 * 						   type (e.g. assessment or census or crossing etc.)
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method getQuestionsRequest
 * 
 * @return {} N/A
 */  
        getQuestionsRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Questions</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetQuestionsRequest', args, success, failure);
            
            return sudsClient;
        },

        getQuestionsResponse: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
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
                    '<wsse:Username>' + userPass.username + '</wsse:Username>' +
                    '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Questions</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetQuestionsResponse', args, success, failure);
            
            return sudsClient;
        },

/**
 * `getCensus` - Returns a specific census.
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method getCensus
 * 
 * @return {} N/A
 */  
        getCensus: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: censusUrl,
                targetNamespace: targetNS + 'census',
                ns: 'cen',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://com/icon/networkrail/alcrm/census" xmlns:cen1="http://census.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Census</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetCensusRequest', args, success, failure);
            
            return sudsClient;
        },

/**
 * `createCensus` - Creates a new census
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method createCensus
 * 
 * @return {} N/A
 */  
        createCensus: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: censusUrl,
                targetNamespace: targetNS + 'census',
                ns: 'cen',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://com/icon/networkrail/alcrm/census" xmlns:cen1="http://census.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Census</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('CreateCensusRequest', args, success, failure);
            
            return sudsClient;
        },
 
 /**
 * `searchCensus` - Search for a census - used for past censuses...
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method searchCensus
 * 
 * @return {} N/A
 */       
        searchCensus: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: censusUrl,
                targetNamespace: targetNS + 'census',
                ns: 'cen',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://com/icon/networkrail/alcrm/census" xmlns:cen1="http://census.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Census</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('SearchCensusRequest', args, success, failure);
            
            return sudsClient;
        },

 /**
 * `getTrainGroupRequest` - retrieves train info groups
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method getTrainGroupRequest
 * 
 * @return {} N/A
 */    
        getTrainGroupRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: trainUrl,
                targetNamespace: targetNS + 'train',
                ns: 'tra',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tra="http://com/icon/networkrail/alcrm/train">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Train</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('GetTrainGroupRequest', args, success, failure);
            
            return sudsClient;
        },

 /**
 * `createTrainGroupRequest` - Creates a train info group
 * 
 * @params args    - the arguments we want to use with
 * @params success - the callback success function
 * @params failure - the callback failure function
 * 
 * @method createTrainGroupRequest
 * 
 * @return {} N/A
 */ 
 	createTrainGroupRequest: function (args, success, failure) {
            var userPass = Alloy.Globals.User.getLogin();
            var sudsClient = new suds({
                endpoint: trainUrl,
                targetNamespace: targetNS + 'train',
                ns: 'tra',
                includeNS: true,
                xmlDeclaration: '',
                envelopeBegin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tra="http://com/icon/networkrail/alcrm/train" xmlns:tra1="http://trains.beans.alcrm.networkrail.icon.com" xmlns:ques="http://questions.beans.alcrm.networkrail.icon.com">',
                bodyBegin: '<soapenv:Body>',
                bodyEnd: '</soapenv:Body>',
                envelopeEnd: '</soapenv:Envelope>',
                headerBegin: '<soapenv:Header>',
                headerContent: '<wsse:Security soapenv:mustUnderstand="1"' +
                    '   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"' +
                    '   xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                    ' <wsse:UsernameToken wsu:Id="UsernameToken-1">' +
                    ' <wsse:Username>' + userPass.username + '</wsse:Username>' +
                    ' <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + userPass.password + '</wsse:Password>' +
                    '</wsse:UsernameToken>' +
                    '</wsse:Security>' +
                    '<versionInfo xmlns="http://com.icon.networkrail.alcrm/version"><version>0.1</version><module>Train</module></versionInfo>',
                headerEnd: '</soapenv:Header>',
                enableWs: wsSecurity
            });

            sudsClient.invoke('CreateTrainGroupRequest', args, success, failure);
            
            return sudsClient;
       },
    };

    return soapObject;

};

module.exports = new _Soap();