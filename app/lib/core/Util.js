function _Util() {

	var self = this,
		docsFolder, templatesFolder, cmsUrl, cheatSheetUrl, templateFiles, crossingTypes, routeFiles, Alloy = require("alloy");
	//downloader = require('tools/downloader');

	self.connectivityChecker = function() {
		//listen for any network changes
		Titanium.Network.addEventListener('change', function(e) {
			if (e.online) {
				//do nothing   
			} else {
				Alloy.Globals.aIndicator.hide();
				self.showAlert('Please make sure that you are connected to the Internet');
				return false;
			}
		});
	};

	self.isIOS7Plus = function() {
		// iOS-specific test
		if (Titanium.Platform.name === 'iPhone OS') {
			var version = Titanium.Platform.version.split(".");
			var major = parseInt(version[0], 10);

			// Can only test this support on a 3.2+ device
			if (major >= 7) {
				return true;
			}
		}
		return false;
	};

	self.getCmsUrl = function() {
		return cmsUrl;
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Downloads a file -> if localFile is present, data is saved in this file
	 | callback -> will be fired when download is complete and data is passed to callback
	 |---------------------------------------------------------------------------------
	 */
	self.downloadFile = function(url, localFile, callback) {

		Ti.API.info('Downloading file at ' + url + ' to ' + localFile);
		var c = Ti.Network.createHTTPClient({
			onload: function() {

				if (localFile) {
					var f = Ti.Filesystem.getFile(localFile);
					f.write(this.responseData);
					//self.log('Writing ' + this.responseData + ' to file ' + localFile);
					f = null;
				}
				// Passing data back to callback
				if (callback && url.search(".pdf") === -1) {
					callback(JSON.parse(this.responseData));
				}
			},
			onerror: function(e) {
				self.log('There has been an error downloading file ' + e.error);
			},
			timeout: 40000
		});

		c.open('GET', url);
		c.send();

	};

	self.downloadFileConditionally = function(url, localFile, condition, callback) {

		Ti.API.info('Downloading file at ' + url + ' to ' + localFile);
		var c = Ti.Network.createHTTPClient({
			onload: function() {
				if (condition(c)) {
					if (localFile) {
						var f = Ti.Filesystem.getFile(localFile);
						f.write(this.responseData);
						//self.log('Writing ' + this.responseData + ' to file ' + localFile);
						f = null;
					}
					// Passing data back to callback
					if (callback && url.search(".pdf") === -1) {
						callback(JSON.parse(this.responseData), c);
					}
				}
			},
			onerror: function(e) {
				self.log('There has been an error downloading file ' + e.error);
			},
			timeout: 40000
		});

		c.open('GET', url);
		c.send();

	};

	/*
	 |---------------------------------------------------------------------------------
	 | Downloads app level help for the app
	 |---------------------------------------------------------------------------------
	 */

	self.downloadConfig = function(callback) {
		

		
		if (self.phoneConnected()) {
			var fileName = 'appconfig.json';
			self.downloadFileConditionally(cmsUrl + '/data/appconfig.json', docsFolder + fileName, function(c) {
				// get last modified date
				var lastModified = c.getResponseHeader('Last-Modified');
				var previousDate = Ti.App.Properties.getString('helpLastModified', '');
				if (lastModified !== previousDate) {
					return true;
				}

			}, function(data, client) {
				//alert(JSON.stringify(data));
				Ti.App.Properties.setString('helpContent', data.help);
				Ti.App.Properties.setString('stagedRollOutRoutes', JSON.stringify(data.routes));
				Ti.App.Properties.setList('censusCounterQuestions', data.censusCounterQuestions);
				Ti.App.Properties.setList('removedQuestions', data.removedQuestions);
				Ti.App.Properties.setList('hiddenQuestions', data.hiddenQuestions);
				Ti.App.Properties.setList('timerPickerQuestions', data.timerPickerQuestions);
				Ti.App.Properties.setString('wsTimeout', JSON.stringify(data.wsTimeout));
				Ti.App.Properties.setString('maxCrossings',data.maxCrossings);
				Ti.App.Properties.setString('helpLastModified', client.getResponseHeader('Last-Modified'));
				if (callback) {
					callback();
				}
			});
		} else {
			var file = Ti.Filesystem.getFile("appconfig.json");
			var data = JSON.parse(file.read().text);
			Ti.App.Properties.setString('helpContent', data.help);
			Ti.App.Properties.setString('stagedRollOutRoutes', JSON.stringify(data.routes));
			Ti.App.Properties.setList('censusCounterQuestions', data.censusCounterQuestions);
			Ti.App.Properties.setList('removedSections', data.removedSections);
			Ti.App.Properties.setList('removedQuestions', data.removedQuestions);
			Ti.App.Properties.setList('hiddenQuestions', data.hiddenQuestions);
			Ti.App.Properties.setList('timerPickerQuestions', data.timerPickerQuestions);
			Ti.App.Properties.setString('wsTimeout', JSON.stringify(data.wsTimeout));
			//Ti.App.Properties.setString('helpLastModified', client.getResponseHeader('Last-Modified'));
			if (callback) {
				callback();
			}
		}
		
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Downloads cheat sheet pdf
	 |---------------------------------------------------------------------------------
	 */

	self.downloadCheatSheet = function(callback) {
		if (self.phoneConnected()) {
			var fileName = 'pdf.pdf';
			self.downloadFileConditionally(cheatSheetUrl, docsFolder + fileName, function(c) {
				// get last modified date
				var lastModified = c.getResponseHeader('Last-Modified');
				var previousDate = Ti.App.Properties.getString('cheatSheetLastModified', '');
				if (lastModified !== previousDate) {
					return true;
				}

			}, function(data, client) {
				Ti.App.Properties.setString('cheatSheetPath', docsFolder + fileName);
				Ti.App.Properties.setString('cheatSheetLastModified', client.getResponseHeader('Last-Modified'));
				if (callback) {
					callback();
				}
			});
		}
	};

	//cmsUrl = 'http://95.138.166.94/alcrm_cms';
	cmsUrl = 'http://dogfishdata.com/alcrm_cms';
	cheatSheetUrl = 'http://www.pdf995.com/samples/pdf.pdf';
	templateFiles = ['abcl.json', 'ahb.json', 'aocl.json', 'barrow.json', 'fp.json', 'fpmwl.json', 'fps.json', 'mcb.json', 'mcbcctv.json', 'mcg.json', 'oc.json', 'uwc.json', 'uwcmwl.json', 'uwct.json'];
	crossingTypes = ['abcl', 'ahb', 'aocl', 'barrow', 'fp', 'fpmwl', 'fps', 'mcb', 'mcbcctv', 'mcg', 'oc', 'uwc', 'uwcmwl', 'uwct'];
	routeFiles = ['anglia.json', 'engineering.json', 'kent.json', 'london_north_east.json', 'london_north_west.json', 'midland_and_continental.json', 'scotland.json', 'sussex.json', 'training.json', 'wales.json', 'wessex.json', 'western.json'];
	docsFolder = Ti.Filesystem.getApplicationDataDirectory();

	// Function to bring the route picker up
	self.showRoutePicker = function(data) {
		var routes = data;
		Alloy.createController('selectRouteWindow').getView().open();
	};

	self.convertDate = function(date) {
		var date = date.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
		if (date == null) {
			return false;
		} else {
			var dateObj = {
				dateFormat1: date[3] + '.' + date[2] + '.' + date[1],
				dateFormat2: date[1] + '-' + date[2] + '-' + date[3],
				dateFormat3: date[3] + '/' + date[2] + '/' + date[1],
				dateFormat4: date[3] + '-' + date[2] + '-' + date[1],
				time: date[4] + ':' + date[5] + ':' + date[6],
			};
			return dateObj;
		}
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Checks whether all route template files are downloaded completely
	 |---------------------------------------------------------------------------------
	 */
	self.allRouteTemplatesAvailable = function() {
		var templatesFolder = Ti.Filesystem.getFile(docsFolder, 'routes');
		var localTemplateFiles = templatesFolder.getDirectoryListing();

		if (!localTemplateFiles)
			return false;

		// Iterate through the file list and remove any files
		// that aren't JSON
		var localFileLength = localTemplateFiles.length;
		while (localFileLength--) {
			if (localTemplateFiles[localFileLength].indexOf('json') === -1) {
				localTemplateFiles.splice(localFileLength, 1);
			}
		}

		if (localTemplateFiles.length === routeFiles.length) {
			templatesFolder = null;
			localTemplateFiles = null;
			return true;
		} else {
			templatesFolder = null;
			localTemplateFiles = null;
			return false;
		}
	};
	/*
	 |---------------------------------------------------------------------------------
	 | Download all route templates
	 |---------------------------------------------------------------------------------
	 */

	self.downloadAllRouteTemplates = function(callback) {
		if (self.phoneConnected()) {
			routesFolder = Ti.Filesystem.getFile(docsFolder, 'routes');
			if (!routesFolder.exists()) {
				routesFolder.createDirectory();
			}

			for (var i in routeFiles) {
				if (callback && (i == (routeFiles.length - 1))) {
					self.downloadFile(cmsUrl + '/data/compiled/routes/' + routeFiles[i], docsFolder + '/routes/' + routeFiles[i], callback);

				} else {
					self.downloadFile(cmsUrl + '/data/compiled/routes/' + routeFiles[i], docsFolder + '/routes/' + routeFiles[i]);
				}
			}
			routesFolder = null;
		} else {
			self.showAlert('Error downloading route files - No Internet Connection');
		}
	};

	self.getRouteCrossings = function(route, callback) {

		var routeFile = route.toLowerCase() + '.json';
		for (var i in routeFiles) {
			if (routeFile === routeFiles[i]) {
				var localFile = Ti.Filesystem.getFile(docsFolder + '/routes/' + routeFile);
				if (localFile.exists() && localFile.size) {
					if (callback) {
						callback(JSON.parse(localFile.read()));
					} else {
						return JSON.parse(localFile.read());
					}
					localFile = null;
				} else {
					if (self.phoneConnected()) {
						// Download the file from the internet and return data
						self.downloadFile(cmsUrl + '/data/compiled/routes/' + routeFile, docsFolder + '/routes/' + routeFile, function(data, callback) {
							if (callback) {
								callback(data);
							} else {
								return data;
							}
						});
					} else {
						self.showAlert('Error downloading search template files - No Internet Connection');
					}
				}
			}
		}

	};

	/*
	 |---------------------------------------------------------------------------------
	 | Fetches a risk assessment template from local folder and if file not found,
	 | download it and return JSON data
	 |---------------------------------------------------------------------------------
	 */
	self.getAssessment = function(crossingType) {
		var crossingType = crossingType.toLowerCase().trim();
		for (var i in crossingTypes) { // Note crossingTypes is global var declared above
			if (crossingTypes[i] === crossingType) {
				// Try and get the file locally
				var localFile = Ti.Filesystem.getFile(docsFolder + '/templates/' + templateFiles[i]);
				if (localFile.exists() && localFile.size) {
					return JSON.parse(localFile.read());
					localFile = null;
				} else {
					if (self.phoneConnected()) {
						// Download the file and return data
						self.downloadFile(cmsUrl + '/data/compiled/' + templateFiles[i], docsFolder + '/templates/' + templateFiles[i], function(data) {
							return data;
						});
					} else {
						self.showAlert('Error downloading assessment template files - No Internet Connection');
					}
				}

			}
		}
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Saves a RA to filesystem
	 |---------------------------------------------------------------------------------
	 */
	self.saveAssessment = function(filename, data) {

		var assessmentsFolder = Ti.Filesystem.getFile(docsFolder, 'assessments');
		if (!assessmentsFolder.exists()) {
			assessmentsFolder.createDirectory();
		}

		var assessmentFile = Ti.Filesystem.getFile(docsFolder + '/assessments/' + filename);

		if (assessmentFile.exists()) {
			assessmentFile.deleteFile();
		}

		// Now write to file
		assessmentFile.write(data);
		assessmentFile = null;
		assessmentsFolder = null;

	};

	self.saveFile = function(filename, nfolder, data) {
		var folder = Ti.Filesystem.getFile(docsFolder, nfolder);
		if (!folder.exists()) {
			folder.createDirectory();
		}

		var file = Ti.Filesystem.getFile(docsFolder + '/' + nfolder + '/' + filename);

		if (file.exists()) {
			file.deleteFile();
		}

		// Now write to file
		file.write(data);
		file = null;
		folder = null;
	};

	self.deleteFile = function(folder, fileName) {
		var file = Ti.Filesystem.getFile(docsFolder + folder + fileName);
		if (file.exists()) {
			file.deleteFile();
		}
		file = null;
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Get all active assessments
	 |---------------------------------------------------------------------------------
	 */
	self.getActiveAssessments = function() {
		var assessmentsFolder = Ti.Filesystem.getFile(docsFolder, 'assessments'),
			dirFiles = assessmentsFolder.getDirectoryListing(),
			outputObj = [];
		if (!dirFiles) {
			return false;
		}
		for (var i = 0; i < dirFiles.length; i++) {
			// Get all the json files
			if (dirFiles[i].indexOf('json') !== -1) {
				var file = Ti.Filesystem.getFile(docsFolder + '/assessments/' + dirFiles[i]),
					data = JSON.parse(file.read());
				timestamp = file.modificationTimestamp();

				outputObj.push({
					data: data,
					timeStamp: timestamp
				});

				file = null;
			}
		}

		// Now sort based on timeStamp
		outputObj.sort(function(a, b) {
			return (b.timeStamp - a.timeStamp);
		});

		// Now extract to another array
		var outputArray = [];
		for (var i in outputObj) {
			outputArray.push(outputObj[i].data);
		}

		assessmentsFolder = null;
		dirFiles = null;
		return outputArray;
	};

	self.escapeXML = function(s) {
		// From https://gist.github.com/panzi/1857360
		var XML_CHAR_MAP = {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			'"': '&quot;',
			"'": '&apos;'
		};

		return s.replace(/[<>&"']/g, function(ch) {
			return XML_CHAR_MAP[ch];
		});
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Emails assessment and question notes to the user
	 |---------------------------------------------------------------------------------
	 */
	self.emailNotes = function(payload) {
		//var Alloy.Globals.User = require('core/Alloy.Globals.User');
		var userEmail = Alloy.Globals.User.getEmail();
		Ti.API.info("userEmail = " + userEmail);

		if (userEmail === '') {
			return false;
		}

		var params = {
			email: userEmail,
			//message: message,
			archived: JSON.stringify(payload)
		};
		Ti.API.info(params.archived);

		var c = Ti.Network.createHTTPClient({
			onload: function() {
				self.log('Assessment and Question Notes emailed successfully');
			},
			onerror: function(e) {
				self.log('Error emailing Assessment and Question Notes');
			},
			timeout: 40000
		});

		c.open('POST', cmsUrl + '/api/email.php');
		c.send(params);
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Function to check whether we a nested json structure exists
	 |---------------------------------------------------------------------------------
	 */
	self.checkNested = function(obj /*, level1, level2, ... levelN*/ ) {
		var args = Array.prototype.slice.call(arguments),
			obj = args.shift();

		for (var i = 0; i < args.length; i++) {
			if (!obj.hasOwnProperty(args[i])) {
				return false;
			}
			obj = obj[args[i]];
		}
		return true;
	};

	self.retryJson = function(payload, callback) {
		var alertYesNo = Titanium.UI.createAlertDialog({
			message: 'An error occured, would you like to retry?',
			buttonNames: ['Yes', 'No']
		});

		alertYesNo.addEventListener('click', function(e) {
			if (e.index == 0) {
				/*
				 * YES was clicked.
				 */
				Alloy.Globals.aIndicator.show("Loading...");
				self.convertJson(payload, callback);
			} else if (e.index == 1) {
				/*
				 * Put the row back since it will be removed from the view even if NO is clicked.
				 */
				Alloy.Globals.aIndicator.hide();
			}
		});

		alertYesNo.show();
	};
	/*
	 |---------------------------------------------------------------------------------
	 | Convert xml to json by executing a web request
	 |---------------------------------------------------------------------------------
	 */
	self.convertJson = function(payload, callback) {

		var params = {
			xmlContent: payload
		};

		var c = Ti.Network.createHTTPClient({
			onload: function(e) {
				var response = this.responseText;
				if (response === 'error') {
					//alert('Error converting xml');
					self.retryJson(payload, callback);
				} else {
					if (callback) {
						callback(response);
					} else {
						return response;
					}
				}
			},
			onerror: function(e) {
				// alert('Error converting xml');
				self.retryJson(payload, callback);
			},
			timeout: 60000
		});

		c.open('POST', cmsUrl + '/api/xmlConvertor.php');
		c.send(params);
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Submits all completed assessments
	 | TODO - Email notes to assessor
	 |---------------------------------------------------------------------------------
	 */

	self.submitCompletedAssessments = function() {
		var that = this;
		if (!self.phoneConnected()) {
			self.showAlert('Error submitting assessments - Please make sure you are connected to the internet');
		}

		var activeAssessments = self.getActiveAssessments();
		var toSend = [];
		for (var i = 0; i < activeAssessments.length; i++) {
			var ra = activeAssessments[i];
			if (ra.completed === ra.questionCount) {
				var Helper = require('core/Ra'),
					Helper = new Helper();
				Helper.setAssessment(ra.assessment);
				Helper.setQuestionNotes(ra.questionNotes);
				Helper.setAssessmentTitleInfo(ra.crossingDetail, ra.initDate);
				// needed for generating unique assessment title
				// Shouldn't submit if already sent
				if (ra.alcrmStatus !== 'Sent') {
					toSend.push({
						fileName: ra.fileName,
						crossingDetail: ra.crossingDetail,
						crossingName: ra.crossingName,
						xmlToSend: Helper.buildXMLAnswer(),
						questionNotes: Helper.buildQuestionNotes(),
						assessmentNotes: ra.assessmentNotes,
						archiveInformation: Helper.buildArchiveArray(),
						alcrmStatus: ra.alcrmStatus
					});
				}

			}
		}

		var toSendLength = toSend.length;

		if (toSendLength !== 0) {
			var //Soap = require('core/Soap'),
			//Alloy.Globals.User = require('core/Alloy.Globals.User'),
			userDetails = Alloy.Globals.User.getLogin();
			username = userDetails.username, password = userDetails.password, i = toSendLength;
			while (i !== 0) {
				// Creating function scope so that alert messages will pick up crossing name
				(function(i) {

					Soap.createAssessment({
						arg0: toSend[i - 1].xmlToSend,
						arg1: toSend[i - 1].crossingDetail,
						arg2: username,
						arg3: password
					}, function(xmlDoc) {
						// Success Callback
						//var XMLTools = require("tools/XMLTools");
						XMLTools.setDoc(xmlDoc);
						//docElement.getElementsByTagName('coreType')
						Ti.API.info(XMLTools.toJSON());
						self.showAlert(toSend[i - 1].crossingName + ' submitted to ALCRM successfully! \n Assessment and Question notes have been emailed to you.');
						// email stuff
						var subject = 'Risk Assessment Notes for ' + toSend[i - 1].crossingName,
							assessmentNotes = toSend[i - 1].assessmentNotes || 'No assessment notes found',
							questionNotes = toSend[i - 1].questionNotes || '\n No question notes found',
							archivedInfo = toSend[i - 1].archiveInformation || null;

						self.emailNotes(subject, assessmentNotes, questionNotes, archivedInfo);
						// Email notes
						// Also save this assessment after changing the alcrm status
						var fileName = toSend[i - 1].fileName;
						var file = Ti.Filesystem.getFile(docsFolder + '/assessments/' + fileName);
						var data = JSON.parse(file.read());

						// Now change the submission status
						data.alcrmStatus = 'Sent';
						var seen = [];

						// Now save this file
						that.saveFile(fileName, 'assessments', JSON.stringify(data, function(key, val) {
							if (typeof val == "object") {
								if (seen.indexOf(val) >= 0) {
									return;
								}
								seen.push(val);
							}
							return val;
						}));

						// Refresh the tableview
						Ti.App.fireEvent('refreshAssessments');

					}, function(xmlDoc) {
						if (xmlDoc) {
							// Error Callback
							var faultString;
							try {
								faultString = xmlDoc.documentElement.getElementsByTagName('faultstring').item(0).text;
							} catch (e) {
								Alloy.Globals.Util.showAlert('An error occured while submitting ' + toSend[i - 1].crossingName + ' to ALCRM. Error details - ' + e.message);
								Alloy.Globals.Util.log('An error occured while submitting ' + toSend[i - 1].crossingName + ' to ALCRM. Error details - ' + JSON.stringify(e));
							}
							if (faultString) {
								Alloy.Globals.Util.showAlert('An error occured while submitting ' + toSend[i - 1].crossingName + ' to ALCRM. \n Error details - ' + faultString);
							}
						}

					});
				})(i);
				i--;
			};
		}
	};

	self.log = function(toLog) {
		if (self.phoneConnected()) {
			//Alloy.Globals.testFlight.passCheckpoint(toLog);
		}
		Ti.API.info(toLog);
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Function accepts a table and blurs all the textfields in that table
	 |---------------------------------------------------------------------------------
	 */
	self.blurAllTextFields = function(table) {
		var tableSections = table.data,
			tableSectionLength = tableSections.length;

		// First iterate through all table sections

		for (section in tableSections) {

			var tableRows = tableSections[section].rows;

			// Now iterate through all the rows in a section

			for (row in tableRows) {

				var rowChildren = tableRows[row].getChildren();

				// Now iterate through all the children in a row - question which is
				// a view and answer - which is a view

				for (child in rowChildren) {

					var rowGrandChildren = rowChildren[child].getChildren();

					// Inside each view, look at the sub-views -> textfields, buttons
					// and blur textfield

					for (grandChild in rowGrandChildren) {

						if (rowGrandChildren[grandChild].toString().toLowerCase().indexOf("tiuitextfield") != -1) {
							// Blur all textfields
							rowGrandChildren[grandChild].blur();
						}

					}
				}

			}

		}
	};

	self.getRandomThreeDigit = function() {
		return Math.floor(Math.random() * 2000) + 1;
	};

	self.getRandom = function(From) {
		/*
		 * Returns a random number from param limit
		 */
		return Math.floor(Math.random() * From);
	};

	self.phoneConnected = function() {
		if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
			return false;
		} else {
			return true;
		}

	};

	self.getFont = function(size, bold) {

		return {
			fontFamily: "HelveticaNeue-Light",
			fontSize: size,
			fontWeight: bold ? "Bold" : "Normal"
		};

	};

	self.showDebugAlert = function(message) {
		var isDebugOn = require('alloy').CFG.debug;

		if (isDebugOn) {
			alert(message);
		}
	};

	self.showAlert = function(message, callback) {
		var alert = Titanium.UI.createAlertDialog({
			title: 'Network Rail',
			message: message,
			buttonNames: callback ? ['OK', 'Cancel'] : ['OK']
		});

		if (callback) {
			alert.addEventListener('click', callback);
		}

		alert.show();

	};

	// Returns a new object with the prototype of the old one
	self.objectify = function(o) {
		var F = function() {};
		F.prototype = o;
		return new F();
	};

	self.sliderVisible = false;
	// tracks if slider is currently visible on screen
	self.sliderProxy = null;
	self.slideNotify = function(bottom, message, hideAll) {
		/*
		 * Function will show a notifier that slides in
		 */
		var win = Ti.UI.createWindow({
			bottom: bottom,
			statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
			height: 300
		});
		var completedAnimation = function() {
			var newAnimation = Ti.UI.createAnimation();
			newAnimation.duration = 200;
			newAnimation.left = -50;
			newAnimation.opacity = 0;

			newAnimation.addEventListener('complete', function() {
				sliderView.remove(noConnectionText);
				win.remove(sliderView);
				noConnectionText = null;
				sliderView = null;
				self.sliderVisible = false;
				self.sliderProxy = false;
				win.close();
			});

			newAnimation.animate(sliderView);
			
		};

		if (self.sliderVisible || hideAll) {
			try {
				self.sliderProxy.fireEvent('click');
			} catch (e) {
				Ti.API.info('Error with slider click' + JSON.stringify(e));
				self.sliderVisible = false;
			}
			
			return;
		}

		var sliderView = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			zIndex: 9999,
			backgroundGradient: {
				type: 'linear',
				startPoint: {
					x: '100%',
					y: '0%'
				},
				endPoint: {
					x: '100%',
					y: '100%'
				},
				colors: ['#b11616', '#871d1d']
			},
			bottom: bottom ? bottom : 0,
			opacity: 0,
			left: -50
		});

		var noConnectionText = Ti.UI.createLabel({
			text: message,
			color: '#ffffff',
			font: self.getFont(18, 1),
			top: 5,
			bottom: 5,
			height: Ti.UI.SIZE,
			textAlign: 'center'
		});

		sliderView.add(noConnectionText);

		var animation = Ti.UI.createAnimation();
		animation.duration = 200;
		animation.left = 5;
		animation.opacity = 1;

		var animationHandler = function() {
			var newAnimation = Ti.UI.createAnimation();
			newAnimation.duration = 100;
			newAnimation.left = 0;
			newAnimation.backgroundGradient = {
				type: 'linear',
				startPoint: {
					x: '0%',
					y: '50%'
				},
				endPoint: {
					x: '100%',
					y: '50%'
				},
				colors: ['#282828', '#1d1c1c']
			};
			sliderView.animate(newAnimation);
			animation.removeEventListener('complete', animationHandler);
			self.sliderVisible = true;
			self.sliderProxy = sliderView;
		};
		animation.addEventListener('complete', animationHandler);
		sliderView.animate(animation);

		sliderView.addEventListener('click', function() {
			completedAnimation();
		});

		//Adding a timeout so that the animation completes after 10 seconds
		setTimeout(completedAnimation, 10000);

		win.add(sliderView);
		win.open();
	};

	/*
	 |---------------------------------------------------------------------------------
	 | Walk through a given table and execute a function at a particular level
	 |---------------------------------------------------------------------------------
	 */
	self.traverseTable = function(table, level, toExecute) {

		var tableSections = table.data,
			tableSectionLength = tableSections.length,
			sectionCounter = 0;
		// Will record the section you are in

		// First iterate through all table sections

		for (section in tableSections) {

			var tableRows = tableSections[section].rows;

			// Now iterate through all the rows in a section

			for (row in tableRows) {

				if (level === 'row' && toExecute) {

					toExecute(tableRows[row], sectionCounter);

				}
			}
			sectionCounter += 1;
		}
	};

	return self;

};

module.exports = new _Util();