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

var changeBg = function (e) {
    if (e.source.isLandscape()) {
        $.loginWin.backgroundImage = WPATH('images/bg/landscape.jpg');
    } else {
        $.loginWin.backgroundImage = WPATH('images/bg/portrait.jpg');
    }
};

Ti.Gesture.addEventListener('orientationchange', changeBg);

function doLogin() {



    //Ti.App.fireEvent('doLoginEvent2');
    var theIndex = Alloy.createController('index');
    var loginWin = Alloy.createController('startup');

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

    var loginError = function (message) {
        // Performs an animation and displays an error message
        Alloy.Globals.aIndicator.hide();
        var animation = require('alloy/animation');
        animation.shake($.loginView, 0, function () {
            Alloy.Globals.Util.showAlert(message);
            Alloy.Globals.Util.log(message);
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
                $.loginButton.touchEnabled = false;
                try {
                    Ti.Gesture.removeEventListener('orientationchange', changeBg);
                } catch (e) {

                }

                //Ti.App.fireEvent('closeLoginWin');
                //Ti.App.fireEvent('fireStartup');//startup();
                //loginWin.closeLoginWin();
                theIndex.startup();
                loginWin.closeLoginWin();
                return;

            } else {
                Alloy.Globals.aIndicator.hide();
                Alloy.Globals.Util.showAlert("Sorry but your username or password is incorrect, Please try again.");
            }
            return;
        }
        // Fire up loading indicator here

        $.loginButton.touchEnabled = false;
        Alloy.Globals.Util.log("Login button pressed");
        // Making sure both are valid entries
        Alloy.Globals.Soap.login({
                name: user
            },
            function (xmlDoc) {

                Alloy.Globals.Util.convertJson(Ti.XML.serializeToString(xmlDoc),
                    function (data) {
                        // callback
                        var loginObject = JSON.parse(data);
                        Alloy.Globals.Logger.log("loginObject >> " + JSON.stringify(loginObject), "info");

                        $.loginButton.touchEnabled = true;
                        var accessCode = Number(loginObject.response.Envelope.Body.GetUserResponse.user.access);
                        if (accessCode === 0) {
                            // Error - No access rights! 
                            loginError('Invalid login - ALCRM returned an access code 0. Please check your details and retry!');
                        } else {
                            // Success Callback

                            var logTheUserIn = function (route, user, pass, access) {

                               Alloy.Globals.Logger.setUserName(user);

                                // Build out arguments object to check login
                                var args = {
                                    username: user,
                                    password: pass,
                                    access: access,
                                    route: route
                                };

                                Alloy.Globals.User.setLogin(args, function (args) {
                                    // Success callback
                                    // Shows the home screen now
                                    // $.window.close();
                                    //Ti.App.fireEvent('closeLoginWin');

                                    var isStagedRollOutOn = require('alloy').CFG.stagedRollOut;

                                    if (typeof route == 'string' && isStagedRollOutOn == false) {
                                        Ti.App.Properties.setString('SelectedRoute', route);
                                        //Ti.App.fireEvent('fireStartup');
                                        theIndex.startup();
                                        loginWin.closeLoginWin();
                                    } else if (isStagedRollOutOn == true) {
                                        var rollOutRoutesArray = JSON.parse(Ti.App.Properties.getString('stagedRollOutRoutes'));
                                        var rollOutRoutes = [];
                                        for (var i = 0; i < rollOutRoutesArray.length; i++) {
                                            rollOutRoutes.push({
                                                title: rollOutRoutesArray[i]
                                            });
                                        }
                                        Alloy.createController('selectRouteWindow').show(rollOutRoutes, function () {
                                            //Ti.App.fireEvent('fireStartup');
                                            theIndex.startup();
                                            loginWin.closeLoginWin();
                                        });
                                    } else {
                                        Alloy.createController('selectRouteWindow').show(route, function () {
                                            //$.destroy;
                                            //Ti.App.fireEvent('fireStartup');
                                            theIndex.startup();
                                            loginWin.closeLoginWin();
                                        });
                                    }

                                    //Ti.App.fireEvent('fireStartup');//startup();

                                }, function (args) {
                                    // Error - No access rights! 
                                    loginError('Login invalid - Access code is ' + args.access + ' and route returned is ' + args.route);
                                });
                            };

                            var access = loginObject.response.Envelope.Body.GetUserResponse.user.access;
                            route = null;

                            // 22-08 - Multi-route login
                            var routeLength = loginObject.response.Envelope.Body.GetUserResponse.user.areas.length;

                            if (Number(routeLength) > 1) {
                                var routes = [];
                                for (var i = 0; i < routeLength; i++) {
                                    routes.push({
                                        title: loginObject.response.Envelope.Body.GetUserResponse.user.areas[i]
                                    });
                                }
                                logTheUserIn(routes.sort(), user, pass, access);

                            } else {
                                route = loginObject.response.Envelope.Body.GetUserResponse.user.areas[0];
                                logTheUserIn(route, user, pass, access);
                            }
                        }
                    }
                );
				},
                function (xmlDoc) {}, {
                    password: pass
                });

        } else {
            loginError('Please check your credentials!');
        }
}