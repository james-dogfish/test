/**
* XMLTools: Titanium module to convert XML to objects
* Copyright: 2013 David Bankier (http://www.yydigital.com)
* License: http://opensource.org/licenses/MIT
* Source: https://github.com/dbankier/XMLTools-For-Appcelerator-Titanium
*/

// In the style of http://www.thomasfrank.se/xml_to_json.html but for Appcelerator with extras. 


function XMLTools () {	
	var self = this;
	var doc = null, obj = null;
	
	self.setDoc = function(inputXml)
	{
		doc = null;
		obj = null;
		
		if(typeof inputXml == 'string'){
			doc = Ti.XML.parseString(inputXml).documentElement;
		}	
		if(typeof inputXml == 'object'){
			doc = inputXml.documentElement;
		}	
	};

	// Changes XML to JSON
	self.xmlToJson = function (xml) {
		
		// Create the return object
		var obj = {};
	
		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName.toString().replace("ns6:","").replace("ns5:","").replace("soapenv:Body","Body")] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}
	
		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName.toString().replace("ns6:","").replace("ns5:","").replace("soapenv:Body","Body");
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = self.xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(self.xmlToJson(item));
				}
			}
		}
		return obj;
	};

	self.getDocument = function() {
		return doc;
	};
	
	self.addToObject = function(obj, key, value) {
		if(obj[key] == null) {
			obj[key] = value;
		} else if(!(obj[key] instanceof Array)) {
			var tmp = obj[key];
			var arr = [tmp, value];
			obj[key] = arr;
		} else {
			obj[key].push(value);
		}
		return obj;
	};
	
	self.traverseTree = function(node) {
		var textOnly = true;
		var part = {};
		if(node.hasChildNodes()) {
			for(var ch_index = 0; ch_index < node.childNodes.length; ch_index++) {
				var ch = node.childNodes.item(ch_index);
				if(ch.nodeName=='#text' && ch.textContent.replace(/\n/g,'').replace(/ /g,'') == "") continue;//skip blank text element
				if(ch.nodeType === 3 || ch.nodeType === ch.CDATA_SECTION_NODE) {//Text Node
	        if (node.childNodes.length === 1 && !node.hasAttributes()) {
					  return ch.textContent;
	        } else {
	          part.text = ch.textContent;
	        }
				} else {
					part = self.addToObject(part, ch.tagName, self.traverseTree(ch));
				}
			}
			textOnly = false;
		}
		if(node.hasAttributes()) {
			for(var att_index = 0; att_index < node.attributes.length; att_index++) {
				var att = node.attributes.item(att_index);
				//part = addToObject(part, att.nodeName, att.nodeValue);
				part[att.nodeName] = att.nodeValue;
			}
			textOnly = false;
		}
		return part;
	};
	
	self.toObject = function() {
		if(doc == null){
		  	return null;
		}
		obj = self.traverseTree(doc);
		return obj;
	};

	self.toJSON = function() {
		if(doc == null){
		  	return null;
		}	
		if(obj == null) {
			obj = self.traverseTree(doc);
		}
		return (JSON.stringify(obj));
	};
};

module.exports = new XMLTools();