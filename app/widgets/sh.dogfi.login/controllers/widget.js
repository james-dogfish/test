// Get orientation on load to assign right bg image
// get max width and height
//var User = Alloy.Globals.User; //require('core/User');
//var Util = require('core/Util');

Util.downloadConfig();

var pWidth = Ti.Platform.displayCaps.platformWidth,
	pHeight = Ti.Platform.displayCaps.platformHeight;

if (pWidth > pHeight) {
	// landscape
	$.loginWin.backgroundImage = WPATH('images/bg/landscape.jpg');
} else {
	// portrait
	$.loginWin.backgroundImage = WPATH('images/bg/portrait.jpg');
}

var changeBg = function(e) {
	if (e.source.isLandscape()) {
		$.loginWin.backgroundImage = WPATH('images/bg/landscape.jpg');
	} else {
		$.loginWin.backgroundImage = WPATH('images/bg/portrait.jpg');
	}
};

Ti.Gesture.addEventListener('orientationchange', changeBg);

function doLogin() {
	//Ti.App.fireEvent('doLoginEvent2');
	var offlineLogin = false;
	Alloy.Globals.aIndicator.show('Logging in...');
    if (!Titanium.Network.online && User.activeUser()) {
        offlineLogin = true;
    } else if (!Titanium.Network.online) {
        Util.showAlert('Please make sure that you are connected to the Internet');
        return false;
    }

    var loginError = function (message) {
        // Performs an animation and displays an error message
		Alloy.Globals.aIndicator.hide();
        var animation = require('alloy/animation');
        animation.shake($.loginView, 0, function () {
            Util.showAlert(message);
            Util.log(message);
        });
        
    };

    // Get username and password
    var user = $.userField.value,
        pass = $.passField.value;

    if (user && user.length > 1 && pass && pass.length > 1) {
        // do the offline login method rather than going via the internet.
        if (offlineLogin) {
            var offlineAttempt = User.offlineLogin({
                username: user,
                password: pass
            });
			
            if (offlineAttempt) {
                //$.window.close();
				
                try {
                    Ti.Gesture.removeEventListener('orientationchange', changeBg);
                } catch (e) {

                }
                Alloy.Globals.aIndicator.hide();
                Ti.App.fireEvent('closeLoginWin');
				Ti.App.fireEvent('fireStartup');//startup();
            
            } else {
            	Alloy.Globals.aIndicator.hide();
                Util.showAlert("Sorry but your username or password is incorrect, Please try again.");
            }
            return;
        }
        // Fire up loading indicator here
        	
        	$.loginButton.touchEnabled = false;
        	Util.log("Login button pressed");
        	// Making sure both are valid entries
        Alloy.Globals.Soap.login({
                name: user
            },
            function (xmlDoc) {
            	//var XMLTools = require("tools/XMLTools");
                var xml = XMLTools.setDoc(xmlDoc);
                //docElement.getElementsByTagName('coreType')

                //alert('Login success response >> ' + xml.toJSON());
                
                $.loginButton.touchEnabled = true;
                var accessCode = Number(xmlDoc.documentElement.getElementsByTagName('access').item(0).text);
                if (accessCode === 0) {
                    // Error - No access rights! 
                    loginError('Invalid login - ALCRM returned an access code 0. Please check your details and retry!');
                } else {
                    // Success Callback

                    var logTheUserIn = function (route, user, pass, access) {
                        // Build out arguments object to check login
                        var args = {
                            username: user,
                            password: pass,
                            access: access,
                            route: route
                        };

                        User.setLogin(args, function (args) {
                            // Success callback
                            // Shows the home screen now
                           // $.window.close();
                           Ti.App.fireEvent('closeLoginWin');
                           var isStagedRollOutOn = require('alloy').CFG.stagedRollOut;
                            
                           if(typeof route == 'string' && isStagedRollOutOn == false) {
                            	Ti.App.Properties.setString('SelectedRoute', route);
  								Ti.App.fireEvent('fireStartup');
							}else if(isStagedRollOutOn == true){
								var rollOutRoutesArray = JSON.parse(Ti.App.Properties.getString('stagedRollOutRoutes'));
								var rollOutRoutes = [];
								for(var i = 0; i<rollOutRoutesArray.length; i++)
								{
									rollOutRoutes.push({
										title: rollOutRoutesArray[i]
									});
								}
	                       		Alloy.createController('selectRouteWindow').show(rollOutRoutes,function(){
	                            	Ti.App.fireEvent('fireStartup');
	                            });
	                        }else{
	                            Alloy.createController('selectRouteWindow').show(route,function(){
	                            	$.destroy;
	                            	Ti.App.fireEvent('fireStartup');
	                            });
	                       }
	                     
							//Ti.App.fireEvent('fireStartup');//startup();
							
                        }, function (args) {
                            // Error - No access rights! 
                            loginError('Login invalid - Access code is ' + args.access + ' and route returned is ' + args.route);
                        });
                    };

                    var access = xmlDoc.documentElement.getElementsByTagName('access').item(0).text,
                        route = null;

                    // 22-08 - Multi-route login
                    var routeLength = xmlDoc.documentElement.getElementsByTagName('areas').length;

                    if (Number(routeLength) > 1) {
                        var routes = [];
                        for (var i = 0; i < routeLength; i++) {
                            routes.push({title:xmlDoc.documentElement.getElementsByTagName('areas').item(i).text});
                        }
                          logTheUserIn(routes.sort(), user, pass, access);
                        
                    } else {
                        route = xmlDoc.documentElement.getElementsByTagName('areas').item(0).text;
                        logTheUserIn(route, user, pass, access);
                    }
                }
            },
            function (xmlDoc) {
                // Debugging response here
                //var XMLTools = require("tools/XMLTools");
                var xml = XMLTools.setDoc(xmlDoc);
                //docElement.getElementsByTagName('coreType')
                Ti.API.info('Login error response >> ' + XMLTools.toJSON());
                Alloy.Globals.aIndicator.hide();
                $.loginButton.touchEnabled = true;

                // Error Callback
                var faultString;
                try {
                    faultString = xmlDoc.documentElement.getElementsByTagName('faultstring').item(0).text;
                } catch (e) {
                    Util.showAlert('An error occured while reading the login response from ALCRM. The error message is ' + e.message);
                    Util.log('An error occured while reading the login response from ALCRM ' + JSON.stringify(e));
                }
                if (faultString) {
                    Util.showAlert('An error occurred while logging in to ALCRM. \n Error Details - ' + faultString);
                }
            }, {
                password: pass
            });

    } else {
        loginError('Please check your credentials!');
    }
}