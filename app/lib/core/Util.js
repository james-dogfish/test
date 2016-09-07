function _Util() {

    var self = this,
        docsFolder,
        templatesFolder,
        cmsUrl,
        templateFiles,
        crossingTypes,
        routeFiles,
        Alloy = require("alloy");

    var connectivtiy_alert_shown = false;
    self.connectivityChecker = function() {
        //listen for any network changes
        Titanium.Network.addEventListener('change', function(e) {
            if (e.online) {
                //do nothing
                connectivtiy_alert_shown = false;
            } else {
                if (connectivtiy_alert_shown == false) {
                    Alloy.Globals.aIndicator.hide();
                    self.showAlert('Please make sure that you are connected to the Internet');
                    connectivtiy_alert_shown = true;
                    return false;
                }
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

    // Checks for an override file being left in by Iain
    self.getOverrideFile = function() {
        var overRideFile = Ti.Filesystem.getFile(docsFolder, 'endpoint_override.json');

        if (overRideFile.exists() && overRideFile.size) {
            var overRide = JSON.parse(overRideFile.read()),
                toReturn = {};
            if (overRide['uri']) {
                toReturn['uri'] = overRide['uri'];
            }
            if (overRide['ws_security']) {
                toReturn['ws_security'] = overRide['ws_security'];
            }

            return toReturn;
        } else {
            return false;
        }
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
            onload : function() {

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
            onerror : function(e) {
                Alloy.Globals.Logger.log('There has been an error downloading file ' + e.error, "info");
            },
            timeout : 40000
        });

        c.open('GET', url);
        c.send();

    };

    self.downloadFileConditionally = function(url, localFile, condition, callback) {

        Ti.API.info('Downloading file at ' + url + ' to ' + localFile);
        var c = Ti.Network.createHTTPClient({
            onload : function() {
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
            onerror : function(e) {
                //self.log('There has been an error downloading file ' + e.error);
                Alloy.Globals.Logger.log('There has been an error downloading file ' + e.error, "info");
            },
            timeout : 40000
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
                // returning true as last modified date isn't consistent
                return true;

            }, function(data, client) {
                Ti.App.Properties.setString('helpContent', data.help);
                Ti.App.Properties.setString('stagedRollOutRoutes', JSON.stringify(data.routes));
                Ti.App.Properties.setList('censusCounterQuestions', data.censusCounterQuestions);
                Ti.App.Properties.setList('removedSections', data.removedSections);
                Ti.App.Properties.setList('removedQuestions', data.removedQuestions);
                Ti.App.Properties.setList('hiddenQuestions', data.hiddenQuestions);
                Ti.App.Properties.setList('timerPickerQuestions', data.timerPickerQuestions);

                Ti.App.Properties.setString('wsTimeout', JSON.stringify(data.wsTimeout));
                Ti.App.Properties.setString('maxCrossings', JSON.stringify(data.maxCrossings));
                Ti.App.Properties.setString('helpLastModified', client.getResponseHeader('Last-Modified'));
                if (callback) {
                    callback();
                }
            });
        } else {
            var file = Ti.Filesystem.getFile(docsFolder+"appconfig.json");
            if (file.exists()) {
                var contents = file.read();
                var data = JSON.parse(contents.text||{});
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
        }

    };

    cmsUrl = 'http://dogfishdata.com/alcrm_cms';
    //cmsUrl = 'http://phase2.nwrcrossings.co.uk';
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
                dateFormat1 : date[3] + '.' + date[2] + '.' + date[1],
                dateFormat2 : date[1] + '-' + date[2] + '-' + date[3],
                dateFormat3 : date[3] + '/' + date[2] + '/' + date[1],
                dateFormat4 : date[3] + '-' + date[2] + '-' + date[1],
                time : date[4] + ':' + date[5] + ':' + date[6],
            };
            return dateObj;
        }
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
                    data : data,
                    timeStamp : timestamp
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
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;',
            '"' : '&quot;',
            "'" : '&apos;'
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
    self.emailNotes = function(payload, crossingName) {
        //var Alloy.Globals.User = require('core/Alloy.Globals.User');
        Ti.API.info(JSON.stringify(payload));
        var userEmail = Alloy.Globals.User.getEmail();
        Ti.API.info("userEmail = " + userEmail);

        if (userEmail === '') {
            return false;
        }

        var params = {
            email : userEmail,
            subject : "Risk Assessment Notes for " + crossingName,
            archived : JSON.stringify(payload)
        };
        Ti.API.info(params.archived);

        var c = Ti.Network.createHTTPClient({
            onload : function() {
                //self.log('Assessment and Question Notes emailed successfully');
                Alloy.Globals.Logger.log('Assessment and Question Notes emailed successfully', "info");
            },
            onerror : function(e) {
                //self.log('Error emailing Assessment and Question Notes');
                Alloy.Globals.Logger.log('Error emailing Assessment and Question Notes', "info");
            },
            timeout : 40000
        });

        c.open('POST', cmsUrl + '/api/email.php');
        c.send(params);
    };

    /*
     |---------------------------------------------------------------------------------
     | Emails a bug report by using the cms api
     |---------------------------------------------------------------------------------
     */
    self.sendBugReport = function(args, success) {

        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.subject = 'RA App bug report from ' + args.userName;

        emailDialog.messageBody = args.emailBody;
        emailDialog.toRecipients = ['NationalLevelCrossingTeam@networkrail.co.uk'];

        emailDialog.addAttachment(args.docsZip);
        emailDialog.addEventListener('complete', function() {
            args.docsZip.deleteFile();
            args.docsZip = null;
        });
        if (emailDialog.isSupported()) {
            emailDialog.open();
        } else {
            self.showAlert(L('no_email_client'));
        }

    };

    self.zipUpDocumentsFolder = function() {

        // Will return all the files of a folder in an array
        function returnFilesFromDir(folder) {
            var outputArray = [];

            try {
                var dir = Titanium.Filesystem.getFile(folder);
                var dir_files = dir.getDirectoryListing();

                for (var i = 0; i < dir_files.length; i++) {
                    if (dir_files[i].toString() !== 'bugReport.zip') {
                        // get the file now
                        var file = Titanium.Filesystem.getFile(dir_files[i]);
                        // We only need the files inside the folder
                        if (dir_files[i].toString().indexOf('.') !== -1) {
                            outputArray.push(folder + '/' + dir_files[i].toString());
                            // outputArray.push(folder + '/' + dir_files[i].toString());
                        } else if (Alloy.Globals.User.getLogin().username === dir_files[i].toString()) {
                            // maybe a directory
                            // we only need the logged in directory of the user
                            outputArray = outputArray.concat(returnFilesFromDir(folder + '/' + dir_files[i]));
                        }
                        file = null;
                    }
                }
            } catch(e) {

            }

            return outputArray;
        };
        var docsFolder = Ti.Filesystem.applicationDataDirectory;
        var outPutFile = docsFolder + '/bugReport.zip';
        var Compression = require('ti.compression');

        var filesToZip = [];

        filesToZip = returnFilesFromDir(docsFolder);

        if (filesToZip.length !== 0) {
            var result = Compression.zip(outPutFile, filesToZip);
            // Now read the zip file
            var zipFile = Titanium.Filesystem.getFile(outPutFile);
            if (zipFile.exists()) {
                return zipFile;
            } else {
                return null;
            }
        } else {
            return null;
        }
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
            message : 'An error occured, would you like to retry?',
            buttonNames : ['Yes', 'No']
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
            xmlContent : payload
        };

        var c = Ti.Network.createHTTPClient({
            onload : function(e) {
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
            onerror : function(e) {
                // alert('Error converting xml');
                self.retryJson(payload, callback);
            },
            timeout : 60000
        });

        c.open('POST', cmsUrl + '/api/xmlConvertor.php');
        c.send(params);
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

    self.showDebugAlert = function(message) {
        var isDebugOn = require('alloy').CFG.debug;

        if (isDebugOn) {
            alert(message);
        }
    };

    self.showAlert = function(message, callback) {
        var alert = Titanium.UI.createAlertDialog({
            title : 'Network Rail',
            message : message,
            buttonNames : callback ? ['OK', 'Cancel'] : ['OK']
        });

        if (callback) {
            alert.addEventListener('click', callback);
        }

        alert.show();

    };

    self.sliderVisible = false;
    // tracks if slider is currently visible on screen
    self.sliderProxy = null;
    self.slideNotify = function(bottom, message, hideAll) {
        /*
         * Function will show a notifier that slides in
         */
        var win = Ti.UI.createWindow({
            bottom : bottom,
            statusBarStyle : Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
            height : 300
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
                Alloy.Globals.Logger.logException(e);
                Ti.API.info('Error with slider click' + JSON.stringify(e));
                self.sliderVisible = false;
            }

            return;
        }

        var sliderView = Ti.UI.createView({
            width : Ti.UI.FILL,
            height : Ti.UI.SIZE,
            zIndex : 9999,
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '100%',
                    y : '0%'
                },
                endPoint : {
                    x : '100%',
                    y : '100%'
                },
                colors : ['#b11616', '#871d1d']
            },
            bottom : bottom ? bottom : 0,
            opacity : 0,
            left : -50
        });

        var noConnectionText = Ti.UI.createLabel({
            text : message,
            color : '#ffffff',
            font : {
                fontFamily : 'Helvetica',
                fontSize : 18,
                fontWeight : 'bold'
            },
            top : 5,
            bottom : 5,
            height : Ti.UI.SIZE,
            textAlign : 'center'
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
                type : 'linear',
                startPoint : {
                    x : '0%',
                    y : '50%'
                },
                endPoint : {
                    x : '100%',
                    y : '50%'
                },
                colors : ['#282828', '#1d1c1c']
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

    return self;

};

module.exports = new _Util(); 