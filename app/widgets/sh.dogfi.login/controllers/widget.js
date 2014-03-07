// Get orientation on load to assign right bg image
// get max width and height
//var User = Alloy.Globals.User; //require('core/User');
//var Util = require('core/Util');
Alloy.Globals.Util.downloadConfig();
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

    var offlineLogin = false;
    Alloy.Globals.aIndicator.show('Logging in...');
    if (!Titanium.Network.online && Alloy.Globals.User.activeUser()) {
        offlineLogin = true;
    } else if (!Titanium.Network.online) {
        Alloy.Globals.aIndicator.hide();
        Alloy.Globals.Util.showAlert('Please make sure that you are connected to the Internet');
        return false;
    }

    if (!Titanium.Network.online && !offlineLogin) {
        Alloy.Globals.aIndicator.hide();
        var alertDialog = Titanium.UI.createAlertDialog({
            title: L('no_connectivity_title'),
            message: L('no_connectivity_body'),
            buttonNames: ['OK']
        });
        alertDialog.show();
        return;
    }

    var loginError = function(message) {
        // Performs an animation and displays an error message
        Alloy.Globals.aIndicator.hide();
        var animation = require('alloy/animation');
        animation.shake($.loginView, 0, function() {
            Alloy.Globals.Util.showAlert(message);
            Alloy.Globals.Logger.log(message, 'info');

        });

    };

    // Get username and password
    var user = $.userField.value,
        pass = $.passField.value;

    if (user && user.length > 1 && pass && pass.length > 1) {
        // do the offline login method rather than going via the internet.
        if (offlineLogin) {
            var offlineAttempt = Alloy.Globals.User.offlineLogin({
                username: user,
                password: pass
            });

            if (offlineAttempt) {
                // $.window.close();
                // Remove the login fields now
                $.loginWin.removeAllChildren();

                //$.loginButton.touchEnabled = false;
                try {
                    Ti.Gesture.removeEventListener('orientationchange', changeBg);
                } catch (e) {
                    Alloy.Globals.Logger.logException(e);
                }

                Alloy.Globals.Index.CloseLogin();
                Alloy.Globals.Index.Startup();
                return;

            } else {
                Alloy.Globals.aIndicator.hide();
                Alloy.Globals.Util.showAlert(L('wrong_user_pass'));
            }
            return;
        }
        // Fire up loading indicator here

        //$.loginButton.touchEnabled = false;
        Alloy.Globals.Logger.log("Login button pressed", 'info');
        // Making sure both are valid entries
        Alloy.Globals.Soap.login({
                name: user
            }, pass,
            function(xmlDoc) {

                Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
                    function(data) {
                        // callback
                        var loginObject = JSON.parse(data);
                        Alloy.Globals.Logger.log("loginObject >> " + JSON.stringify(loginObject), "info");

                        $.loginButton.touchEnabled = true;
                        var accessCode = Number(loginObject.response.Envelope.Body.GetUserResponse.user.access);
                        if (accessCode === 0) {
                            // Error - No access rights! 
                            loginError(L('invalid_login'));
                        } else {

                            // Will return a boolean if the route 
                            // passed in is turned on in the CMS
                            // if returnenabledroutes is true then
                            // this function will return routes applicable
                            // to the user that are allowed in the CMS
                            var isRouteEnabled = function(routes, returnEnabledRoutes) {
                                var rollOutRoutesArray = JSON.parse(Ti.App.Properties.getString('stagedRollOutRoutes'));
                                var rollOutRoutes = [];
                                for (var i = 0; i < rollOutRoutesArray.length; i++) {
                                    rollOutRoutes.push(rollOutRoutesArray[i]);
                                }
                                if (typeof routes === 'string') {
                                    // Route returned by WS is a string
                                    if (rollOutRoutes.indexOf(routes) === -1) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                } else {
                                    // Route returned by WS is an array
                                    var rollOutLength = rollOutRoutes.length;
                                    while (rollOutLength--) {
                                        if (routes.indexOf(rollOutRoutes[rollOutLength]) == -1) {
                                            rollOutRoutes.splice(rollOutLength, 1);
                                        }
                                    }
                                    if (returnEnabledRoutes) {
                                        return rollOutRoutes;
                                    } else {
                                        if (rollOutRoutes.length === 0) {
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    }
                                }
                            };


                            // Success Callback

                            var logTheUserIn = function(route, user, pass, access) {

                                // Remove the login fields now
                                $.loginWin.removeAllChildren();

                                Alloy.Globals.Logger.setUserName(user);

                                // Build out arguments object to check login
                                var args = {
                                    username: user,
                                    password: pass,
                                    access: access,
                                    route: route
                                };

                                Alloy.Globals.User.setLogin(args, function(args) {
                                    // Success callback
                                    // Shows the home screen now

                                    var isStagedRollOutOn = require('alloy').CFG.stagedRollOut;

                                    if (typeof route == 'string' && isStagedRollOutOn == false) {
                                        Ti.App.Properties.setString('SelectedRoute', route);
                                        Alloy.Globals.Index.CloseLogin();
                                        Alloy.Globals.Index.Startup();
                                    } else if (isStagedRollOutOn == true) {
                                        if (typeof route === 'string') {
                                            Ti.App.Properties.setString('SelectedRoute', route);
                                            Alloy.Globals.Index.CloseLogin();
                                            Alloy.Globals.Index.Startup();
                                        } else {
                                            var rollOutRoutes = isRouteEnabled(route, true);
                                            Alloy.createController('selectRouteWindow').show(rollOutRoutes, function() {
                                                Alloy.Globals.Index.CloseLogin();
                                                Alloy.Globals.Index.Startup();
                                            });
                                        }
                                    } else {
                                        Alloy.createController('selectRouteWindow').show(route, function() {
                                            Alloy.Globals.Index.CloseLogin();
                                            Alloy.Globals.Index.Startup();
                                        });
                                    }

                                    Alloy.Globals.Analytics.trackNav('login', 'home', 'login:success');

                                }, function(args) {
                                    // Error - No access rights! 
                                    loginError('Login invalid - Access code is ' + args.access + ' and route returned is ' + args.route);
                                });
                            };

                            var access = loginObject.response.Envelope.Body.GetUserResponse.user.access;
                            route = null;

                            var routeLength;

                            // 22-08 - Multi-route login
                            // Update for bugfix
                            if (typeof loginObject.response.Envelope.Body.GetUserResponse.user.areas === 'string') {
                                routeLength = 1;
                            } else {
                                routeLength = loginObject.response.Envelope.Body.GetUserResponse.user.areas.length;
                            }

                            if (Number(routeLength) > 1) {
                                var routes = [];
                                for (var i = 0; i < routeLength; i++) {
                                    routes.push(loginObject.response.Envelope.Body.GetUserResponse.user.areas[i]);
                                }

                                if (isRouteEnabled(routes)) {
                                    logTheUserIn(routes.sort(), user, pass, access);
                                } else {
                                    loginError(L('no_valid_routes'));
                                }

                            } else {
                                if (typeof loginObject.response.Envelope.Body.GetUserResponse.user.areas === 'string') {
                                    route = loginObject.response.Envelope.Body.GetUserResponse.user.areas;
                                } else {
                                    route = loginObject.response.Envelope.Body.GetUserResponse.user.areas;
                                }
                                if (isRouteEnabled(route)) {
                                    logTheUserIn(route, user, pass, access);
                                } else {
                                    loginError(L('no_valid_routes'));
                                }
                            }
                        }
                    }
                );
            }, function(xmlDoc) {
                Alloy.Globals.aIndicator.hide();
            });

    } else {
        loginError(L('enter_email_and_password'));
    }
}

function focusPassword() {
    $.passField.focus();
}