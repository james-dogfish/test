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
                    Ti.App.Properties.setString('LCM_ID', 0/*TODO: add user ID here*/);
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
                access: Ti.App.Properties.getString('LCM_ACCESS', null),
                lcmId: Ti.App.Properties.getString('LCM_ID', null),
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
        
        getUserDir: function () {
           return Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,userKeychain.valueData.replace(/ /g,''));
        },

        	/*
			|---------------------------------------------------------------------------------
			| Saves user preference to the app
			|---------------------------------------------------------------------------------
			*/

        setPreferences: function (object) {
            /*Ti.App.Properties.setString('userName', object.name);
            Ti.App.Properties.setString('userEmail', object.email);
            Ti.App.Properties.setString('userMobile', object.mobile);
            Ti.App.Properties.setBool('userSingleView', object.singleView);*/
             var UserObj = {
		     	userName: object.name,
		     	userEmail: object.email,
		     	userMobile: object.mobile,
		     	userSingleView: object.singleView
		     };
		     
             
             	var UserDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,object.name.replace(/ /g,''));
				Ti.API.info("Created User Directory: " + UserDir.createDirectory());
				Ti.API.info('UserDir ' + UserDir);
				var newFile = Titanium.Filesystem.getFile(UserDir.nativePath,'userSettings.json');
				
				
				if (newFile.exists()){
					newFile.deleteFile();
					newFile.createFile();
				    newFile.write(JSON.stringify(UserObj));
				    Ti.API.info('userFile: '+newFile.read());
				}    
		     //userPrefs.write(JSON.stringify(UserObj));			    
		},

        getPreferences: function () {
            /*var settingsObj = {
                name: Ti.App.Properties.getString('userName', ''),
                mobile: Ti.App.Properties.getString('userMobile', ''),
                email: Ti.App.Properties.getString('userEmail', ''),
                singleView: Ti.App.Properties.getBool('userSingleView', false)
            };*/
            var UserDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,userKeychain.valueData.replace(/ /g,''));
            var UserFile = Titanium.Filesystem.getFile(UserDir.nativePath,'userSettings.json');
           
			 if (!UserFile.exists()) {
		          return {};
		     } 
    		//alert(UserFile.read().text);
    		var UserObj = JSON.parse(UserFile.read().text);
    		
            return {
            	name: UserObj.userName,
            	mobile: UserObj.userMobile,
            	email:UserObj.userEmail,
            	singleView:UserObj.userSingleView
            };
        },

        hasPreferences: function () {
            var prefHash = this.getPreferences();
            alert(JSON.stringify(prefHash));
            if (prefHash.name && prefHash.mobile && prefHash.email) {
                return true;
            } else {
                return false;
            }
        },

        getEmail: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.email) {
                return prefHash.email;
            } else {
                return false;
            }
            //return Ti.App.Properties.getString('userEmail', '');
        },

        getName: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.name) {
                return prefHash.name;
            } else {
                return false;
            }
            //return Ti.App.Properties.getString('userName', '');
        },

        getMobile: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.mobile) {
                return prefHash.mobile;
            } else {
                return false;
            }
            //return Ti.App.Properties.getString('userMobile', '');
        },

        	/*
			|---------------------------------------------------------------------------------
			| Returns true if a user likes a single view layout
			|---------------------------------------------------------------------------------
			*/
        prefersSingleView: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.singleView) {
                return prefHash.singleView;
            } else {
                return false;
            }
            //return Ti.App.Properties.getBool('userSingleView', false);
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