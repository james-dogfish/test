// File deals with a User = an LCM
function _User() {

    var keychain = require('com.obscure.keychain'),
        moment = require('alloy/moment'),
        userKeychain = keychain.createKeychainItem('User'),
        passKeychain = keychain.createKeychainItem('Pass'),
        loginKeychain = keychain.createKeychainItem("LoggedIn");

    	/*
		|---------------------------------------------------------------------------------
		| Public Interface 
		|---------------------------------------------------------------------------------
		*/

    userObject = {

        setLoginTimestamp: function () {
            Ti.App.Properties.setString('lastLogin', moment().format('YYYY-MM-DD'));
        },
        howLongLeft: function () {
            today = moment(),
            todayFormatted = today.format('YYYY-MM-DD');
            var lastLogin = Ti.App.Properties.getString('lastLogin', todayFormatted);
            return Number(moment().diff(lastLogin, 'days'));
        },
        isLoginExpired: function () {
            var moment = require('alloy/moment'),
                today = moment(),
                todayFormatted = today.format('YYYY-MM-DD');
            var lastLogin = Ti.App.Properties.getString('lastLogin', todayFormatted);
            if (Number(moment().diff(lastLogin, 'days') >= 14)) {
                return true;
            } else {
                return false;
            }
        },

        	/*
			|---------------------------------------------------------------------------------
			| Logs a user into the app i.e - stores username, password and route if they are 
			| valid
			|---------------------------------------------------------------------------------
			*/

        setLogin: function (args, success, failure) {
            Ti.API.info('Set login function called ' + JSON.stringify(args));

            var loginFailed = false,
                that = this;
            if (args.username && args.password && args.access && args.route) {
                if (args.access !== 0 && args.route) {
                    // Log a user in
                    userKeychain.valueData = args.username;
                    passKeychain.valueData = args.password;
                    Ti.App.Properties.setString('LCM_ACCESS', args.access);
                    Ti.App.Properties.setString('LCM_ROUTE', args.route);
                    that.setLoginTimestamp(); // Recording login time
                    if (success) {
                        loginKeychain.valueData = "true";
                        success(args);
                    } else {
                        return true;
                    }

                } else {
                    loginFailed = true;
                }
            } else {
                loginFailed = true;
            }

            if (loginFailed === true) {
                failure(args);
                return false;
            }
        },

        	/*
			|---------------------------------------------------------------------------------
			| Returns the username and password in an object
			|---------------------------------------------------------------------------------
			*/

        setRoute: function (chosenRoute) {
            Ti.App.Properties.setString('LCM_ROUTE', chosenRoute);
        },

        getLogin: function () {
            var toReturn = {
                username: userKeychain.valueData,
                password: passKeychain.valueData,
                route: Ti.App.Properties.getString('LCM_ROUTE', null),
                access: Ti.App.Properties.getString('LCM_ACCESS', null)
            };
            return toReturn;
        },

        	/*
			|---------------------------------------------------------------------------------
			| Checks if a user is logged in
			|---------------------------------------------------------------------------------
			*/

        isLoggedIn: function () {
            if (userKeychain.valueData && loginKeychain.valueData && passKeychain.valueData &&
                Ti.App.Properties.getString('LCM_ROUTE', null) !== null) {
                return true;
            } else {
                return false;
            }
        },

       		 /*
			|---------------------------------------------------------------------------------
			| Returns route for a user
			|---------------------------------------------------------------------------------
			*/

        getRoute: function () {
            if (Ti.App.Properties.getString('LCM_ROUTE', null) !== null) {
                return Ti.App.Properties.getString('LCM_ROUTE', null);
            }
        },

        	/*
			|---------------------------------------------------------------------------------
			| Saves user preference to the app
			|---------------------------------------------------------------------------------
			*/

        setPreferences: function (object) {
            Ti.App.Properties.setString('userName', object.name);
            Ti.App.Properties.setString('userEmail', object.email);
            Ti.App.Properties.setString('userMobile', object.mobile);
            Ti.App.Properties.setBool('userSingleView', object.singleView);
        },

        getPreferences: function () {
            var settingsObj = {
                name: Ti.App.Properties.getString('userName', ''),
                mobile: Ti.App.Properties.getString('userMobile', ''),
                email: Ti.App.Properties.getString('userEmail', ''),
                singleView: Ti.App.Properties.getBool('userSingleView', false)
            };
            return settingsObj;
        },

        hasPreferences: function () {
            var prefHash = this.getPreferences();
            if (prefHash.name && prefHash.mobile && prefHash.email) {
                return true;
            } else {
                return false;
            }
        },

        getEmail: function () {
            return Ti.App.Properties.getString('userEmail', '');
        },

        getName: function () {
            return Ti.App.Properties.getString('userName', '');
        },

        getMobile: function () {
            return Ti.App.Properties.getString('userMobile', '');
        },

        	/*
			|---------------------------------------------------------------------------------
			| Returns true if a user likes a single view layout
			|---------------------------------------------------------------------------------
			*/
        prefersSingleView: function () {
            return Ti.App.Properties.getBool('userSingleView', false);
        },

        	/*
			|---------------------------------------------------------------------------------
			| Logs a user out of the application, i.e - clears only the login keychain but keeps all route access / user information.
			|---------------------------------------------------------------------------------
			*/
        logOut: function () {
            loginKeychain.reset();
        },

        offlineLogin: function (data) {
            if (data.username == userKeychain.valueData && data.password == passKeychain.valueData) {
                return true;
            } else {
                return false;
            }
        },

        activeUser: function () {
            return (userKeychain.valueData) ? true : false;
        }
    };

    return userObject;

};

module.exports = new _User();