/*jslint maxerr:1000 */
/**
 * *
 * Sud2 is forked from Kevin Whinnery's suds.js project
 * Updates to Suds2 can be found at https://github.com/benbahrenburg/Suds2
 *
 * Suds: A Lightweight JavaScript SOAP Client
 * Copyright: 2009 Kevin Whinnery (http://www.kevinwhinnery.com)
 * License: http://www.apache.org/licenses/LICENSE-2.0.html
 * Source: http://github.com/kwhinnery/Suds
 */
var retry_counter = 0;
var SudsClient = function(_options) {

  //A generic extend function - thanks MooTools
  function extend(original, extended) {
    for (var key in (extended || {})) {
      if (original.hasOwnProperty(key)) {
        original[key] = extended[key];
      }
    }
    return original;
  }

  function endWith(str, suffix) {
    str = str + '';
    var lastIndex = str.lastIndexOf(suffix);
    return (lastIndex != -1) && (lastIndex + suffix.length == str.length);
  };

  //Check if an object is an array

  function isArray(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  }

  //Grab an XMLHTTPRequest Object

  function getXHR() {
    return Titanium.Network.createHTTPClient();
  }

  //Parse a string and create an XML DOM object

  function xmlDomFromString(_xml) {
    //var Util = require('core/Util'),
      var xmlDoc;
    try {
      xmlDoc = Titanium.XML.parseString(_xml);
    } catch (e) {
      //Util.showAlert('Invalid server response received from ALCRM. Please retry!');
      Util.log('Invalid server response received from ALCRM. Please retry! LOG -' + e);
      return false;
    }
    if(xmlDoc) {
      return xmlDoc;
    }

  };

  // Convert a JavaScript object to an XML string - takes either an

  function convertToXml(_obj, namespacePrefix) {
    var xml = '';
    if (isArray(_obj)) {
      for (var i = 0; i < _obj.length; i++) {
        xml += convertToXml(_obj[i], namespacePrefix);
      }
    } else {
      //For now assuming we either have an array or an object graph
      for (var key in _obj) {
        if (namespacePrefix && namespacePrefix.length) {
          xml += '<' + namespacePrefix + ':' + key + '>';
        } else {
          xml += '<' + key + '>';
        }
        if (isArray(_obj[key]) || (typeof _obj[key] == 'object' && _obj[key] != null)) {
          xml += convertToXml(_obj[key]);
        } else {
          xml += _obj[key];
        }
        if (namespacePrefix && namespacePrefix.length) {
          xml += '</' + namespacePrefix + ':' + key + '>';
        } else {
          xml += '</' + key + '>';
        }
      }
    }
    return xml;
  }

  // Client Configuration
  var config = extend({
    endpoint: 'http://localhost',
    targetNamespace: 'http://localhost',
    xmlDeclaration: '<?xml version="1.0" encoding="utf-8"?>',
    envelopeBegin: '<soap:Envelope xmlns:ns0="PLACEHOLDER" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">',
    bodyBegin: '<soap:Body>',
    bodyEnd: '</soap:Body>',
    envelopeEnd: '</soap:Envelope>',
    headerBegin: '<soap:Header>',
    headerNode: 'head',
    headerEnd: '</soap:Header>',
    timeout: 150000,
    includeNS: true,
    emptyHeader: '',
    addTargetSchema: false,
    authorization: '',
    ns: 'ns0'
  }, _options);

  function wrapNS(nsOnly) {
    if (config.includeNS) {
      return ((nsOnly) ? config.ns : (config.ns + ':'));
    } else {
      return '';
    }
  };

  function addTargetSchema() {
    if (config.addTargetSchema) {
      var temp = config.targetNamespace;
      if (endWith(config.targetNamespace, '/')) {
        temp = temp.substr(0, (temp.length - 1));
      }
      return ' xmlns="' + temp + '"';
    } else {
      return '';
    }
  };

  function invokeService(_soapAction, _body, _callback, _failure, _header) {
  	
  	//CHECK FOR CONNECTIVITY
  	if(!Titanium.Network.online){
  			Alloy.Globals.aIndicator.hide();
     		var alertDialog = Titanium.UI.createAlertDialog({
              title: L('no_connectivity_title'),
              message: L('no_connectivity_body'),
              buttonNames: ['OK']
            });
            alertDialog.show();
            
            return;
	}

    //Build request body 
    var body = _body;
    var header = _options.headerContent;
	
    //Allow straight string input for XML body - if not, build from object

    if (typeof body !== 'string') {
      body = '<' + wrapNS(false) + _soapAction + addTargetSchema() + '>';
      body += convertToXml(_body, wrapNS(true));
      body += '</' + wrapNS(false) + _soapAction + '>';
    }

    var ebegin = config.envelopeBegin;
    config.envelopeBegin = ebegin.replace('PLACEHOLDER', config.targetNamespace);

    //Build Soapaction header - if no trailing slash in namespace, need to splice one in for soap action
    var soapAction = '';
    if (config.targetNamespace.lastIndexOf('/') != config.targetNamespace.length - 1) {
      soapAction = config.targetNamespace + '/' + _soapAction;
    } else {
      soapAction = config.targetNamespace + _soapAction;
    }
    //POST XML document to service endpoint
    var xhr = getXHR();
    xhr.onload = function() {
     // //Ti.API.info('SUDS - Success');
       //Alloy.Globals.aIndicator.hide();
      _callback.call(this, xmlDomFromString(this.responseText));
    };
    xhr.onerror = function(e) {
      ////Ti.API.info('SUDS - Error' + this.responseText);
      //_failure.call(this, xmlDomFromString(this.responseText));
      //var XMLTools = require("tools/XMLTools");
      try{
      Alloy.Globals.aIndicator.hide();
      var errXml = XMLTools.setDoc(xmlDomFromString(this.responseText));
      var errObj = JSON.stringify(errXml.toObject());
      
      
      
      var error_object = JSON.parse(errObj);
      var error_code = null;
      var error_message = null;
      var error_stacktrace = null;
      if(typeof error_object === "undefined" || 
      	typeof error_object["soapenv:Body"] === "undefined" ||
      	typeof error_object["soapenv:Body"]["soapenv:Fault"] === "undefined" ||
      	typeof error_object["soapenv:Body"]["soapenv:Fault"]["detail"] === "undefined")
      {
      		error_code = "0";
      		error_message = JSON.stringify(error_object);
      		error_stacktrace = "";
      		if(typeof error_object["soapenv:Body"]["soapenv:Fault"]["detail"] !=="undefined")
      		{
      			error_message = error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["MESSAGE"] + ". ";
      			error_code = error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["CODE"];
      			if(typeof error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["ADDITIONAL_DETAIL"] !=="undefined")
      			{
      				error_message += error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["ADDITIONAL_DETAIL"];
      			}
      			
      		}
      }else{
  
      		error_code = error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["CODE"];
      		error_message = error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["MESSAGE"];
      		error_stacktrace = error_object["soapenv:Body"]["soapenv:Fault"]["detail"]["STACKTRACE"];
      }
      
      var alert = Titanium.UI.createAlertDialog({
	  	title: 'Error: '+error_code,
		message: error_message + "\n\nWould you like to retry?",
		buttonNames: ['Yes', 'No'],
		cancel: 1,
		stackTrace: error_stacktrace
	  });
	  
	  alert.addEventListener('click', function(e) {
		   //Clicked cancel, first check is for iphone, second for android
	       if (e.cancel === e.index || e.cancel === true) {
	       	  Alloy.Globals.aIndicator.hide();
	          return;
	       }
 
           //now you can use parameter e to switch/case
 
	       switch (e.index) {
	          case 0: invokeService(_soapAction, _body, _callback, _failure, _header);
	          break;
	 
	          //This will never be reached, if you specified cancel for index 1
	          case 1: Alloy.Globals.aIndicator.hide(); 
	          break;
	 
	      }
		}); 
		alert.show();
	}catch(e){
		Alloy.Globals.aIndicator.hide();
	}
    
    };
    xhr.setTimeout(config.timeout);
    var sendXML = '';
    if (!header) {
      sendXML = config.xmlDeclaration + config.envelopeBegin + config.bodyBegin + body + config.bodyEnd + config.envelopeEnd;
    

    } else {
      //Allow straight string input for XML body - if not, build from object
      if (typeof header !== 'string') {
        header = '<' + _soapAction + ' xmlns="' + config.targetNamespace + '">';
        header += convertToXml(_header);
        header += '</' + _soapAction + '>';
      }
      sendXML = config.xmlDeclaration + config.envelopeBegin + config.headerBegin + header + config.headerEnd + config.bodyBegin + body + config.bodyEnd + config.envelopeEnd;
    }

    if (config.emptyHeader) {
      sendXML = config.xmlDeclaration + config.envelopeBegin + config.bodyBegin + body + config.bodyEnd + config.envelopeEnd;
    }

    xhr.open('POST', config.endpoint);
    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.setRequestHeader('SOAPAction', soapAction);
    if (config.authorization !== undefined) {
      xhr.setRequestHeader('Authorization', 'Basic ' + config.authorization);
    }
    //Ti.API.info('SUDS - Soap call sent to >> ' + config.endpoint);
    //alert('SUDS - Soap call sent to >> ' + config.endpoint);
    //Ti.API.info('SUDS - Sending data >> ' + sendXML);
    //alert('SUDS - Sending data >> ' + sendXML);
    xhr.send(sendXML);
  };
  // Invoke a web service
  this.invoke = invokeService;
};


module.exports = SudsClient;