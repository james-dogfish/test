// User Module
// ----------------
// File deals with a User = an LCM
function _User() {

    var userKeychain = null;
        passKeychain = null;
        loginKeychain = null;

var moment = Alloy.Globals.moment;

    userObject = {
 /**
 * `init` - Initialises all User "keychains"
 *
 * @method init
 *
 * @return {} N/A
 */
    	init: function () {
    		if(Ti.App.Properties.hasOwnProperty('userKeychain'))
    		{
    			userKeychain = Ti.App.Properties.getString('userKeychain');
    		}
    		if(Ti.App.Properties.hasOwnProperty('passKeychain'))
    		{
    			passKeychain = Ti.App.Properties.getString('passKeychain');
    		}
    		if(Ti.App.Properties.hasOwnProperty('loginKeychain'))
    		{
    			loginKeychain = Ti.App.Properties.getBool('loginKeychain');
    		}
    	},
 /**
 * `setLoginTimestamp` - sets the lastLogin property
 *
 * @method setLoginTimestamp
 *
 * @return {} N/A
 */
        setLoginTimestamp: function () {
            Ti.App.Properties.setString('lastLogin', moment().format('YYYY-MM-DD'));
        },

 /**
 * `howLongLeft` - returns the difference between the lastLogin property and the current timestamp in days.
 *
 * @method howLongLeft
 *
 * @return {int} difference between the lastLogin property and the current timestamp in days.
 */
        howLongLeft: function () {
            today = moment(),
            todayFormatted = today.format('YYYY-MM-DD');
            var lastLogin = Ti.App.Properties.getString('lastLogin', todayFormatted);
            return Number(moment().diff(lastLogin, 'days'));
        },
 /**
 * `isLoginExpired` - checks if a user login is expired based on the hard coded value (14)
 *
 * @method isLoginExpired
 *
 * @return {Boolean} true/false depending on weather the login is expired or not.
 */
        isLoginExpired: function () {
            //var moment = require('alloy/moment'),
               var today = moment(),
                todayFormatted = today.format('YYYY-MM-DD');
            var lastLogin = Ti.App.Properties.getString('lastLogin', todayFormatted);
            if (Number(moment().diff(lastLogin, 'days') >= 14)) {
                return true;
            } else {
                return false;
            }
        },

 /**
 * `setLogin` - Logs a user into the app i.e - stores username, password and route if they are
 * 				valid
 *
 * @method setLogin
 *
 * @return {Boolean} true/false if the function succeds or not.
 */
        setLogin: function (args, success, failure) {
            Ti.API.info('Set login function called ' + JSON.stringify(args));

            var loginFailed = false,
                that = this;
            if (args.username && args.password && args.access && args.route) {
                if (args.access !== 0 && args.route) {
                    // Log a user in
                    userKeychain = Ti.App.Properties.setString('userKeychain',args.username);
                    passKeychain = Ti.App.Properties.setString('passKeychain',args.password);
                    Ti.App.Properties.setString('LCM_ACCESS', args.access);
                    Ti.App.Properties.setString('LCM_ROUTE', args.route);
                    Ti.App.Properties.setString('LCM_ID', 0/*TODO: add user ID here*/);
                    that.setLoginTimestamp(); // Recording login time
                    if (success) {
                        loginKeychain = Ti.App.Properties.setBool("loginKeychain",true);
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


      	setRoute: function (chosenRoute) {
            Ti.App.Properties.setString('LCM_ROUTE', chosenRoute);
        },

        getLogin: function () {
            var toReturn = {
                username: Ti.App.Properties.getString('userKeychain'),
                password: Ti.App.Properties.getString('passKeychain'),
                route: Ti.App.Properties.getString('LCM_ROUTE', null),
                access: Ti.App.Properties.getString('LCM_ACCESS', null),
                lcmId: Ti.App.Properties.getString('LCM_ID', null),
            };
            //alert("getLogin >> "+JSON.stringify(toReturn));
            return toReturn;
        },


        isLoggedIn: function () {
            if (Ti.App.Properties.getBool("loginKeychain") &&
                Ti.App.Properties.getString('LCM_ROUTE', null) !== null) {
                return true;
            } else {
                return false;
            }
        },

        getRoute: function () {
            if (Ti.App.Properties.getString('LCM_ROUTE', null) !== null) {
                return Ti.App.Properties.getString('LCM_ROUTE', null);
            }
        },

        getUserDir: function () {

        	var userDir = null;

        	if(typeof Ti.App.Properties.getString('userKeychain') !=="undefined")
        	{
        		if(Ti.App.Properties.getString('userKeychain') !== null)
        		{
        			userDir = Ti.App.Properties.getString('userKeychain').replace(/ /g,'');
        		}
        	}

        	return userDir;

        },

        setPreferences: function (object) {
             var UserObj = {
		     	userName: object.name,
		     	userEmail: object.email,
		     	userMobile: object.mobile,
		     	userSingleView: object.singleView
		     };

             	if(typeof Ti.App.Properties.getString('userKeychain') !=="undefined")
	        	{
	        		if(Ti.App.Properties.getString('userKeychain') !== null)
	        		{
	        			var UserDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,Ti.App.Properties.getString('userKeychain').replace(/ /g,''));
						Ti.API.info("Created User Directory: " + UserDir.createDirectory());
						Ti.API.info('UserDir ' + UserDir);
						var newFile = Titanium.Filesystem.getFile(UserDir.nativePath,'userSettings.json');

						newFile.createFile();
						if (newFile.exists()){
						    newFile.write(JSON.stringify(UserObj));
						    Ti.API.info('userFile: '+newFile.read());
						}
	        		}
	        	}

		},

        getPreferences: function () {
           if(typeof Ti.App.Properties.getString('userKeychain') !=="undefined")
        	{
        		if(Ti.App.Properties.getString('userKeychain') !== null)
        		{
        			var UserDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,Ti.App.Properties.getString('userKeychain').replace(/ /g,''));
		            var UserFile = Titanium.Filesystem.getFile(UserDir.nativePath,'userSettings.json');
					 if (!UserFile.exists()) {
				          return {};
				     }
		    		var UserObj = JSON.parse(UserFile.read().text);
		    		if(UserObj.userSingleView === "" || UserObj.userSingleView === null)
		    		{
		    			UserObj.userSingleView = false;
		    		}
		            return {
		            	name: UserObj.userName,
		            	mobile: UserObj.userMobile,
		            	email:UserObj.userEmail,
		            	singleView:UserObj.userSingleView
		            };
        		}
        	}
            return null;
        },

        hasPreferences: function () {
            var prefHash = this.getPreferences();
            if(typeof prefHash === "undefined" || prefHash == null)
            {
            	return false;
            }
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
        },

        getName: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.name) {
                return prefHash.name;
            } else {
                return false;
            }
        },

        getMobile: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.mobile) {
                return prefHash.mobile;
            } else {
                return false;
            }
        },


        prefersSingleView: function () {
        	var prefHash = this.getPreferences();
            if (prefHash.singleView) {
                return prefHash.singleView;
            } else {
                return false;
            }
        },

        logOut: function () {
              Ti.App.Properties.removeProperty('loginKeychain');
              Ti.App.Properties.removeProperty('LCM_ROUTE');
              Alloy.Globals.localDataHandler.clearCachedCrossing();
        },

        offlineLogin: function (data) {
            if (data.username == Ti.App.Properties.getString('userKeychain') && data.password == Ti.App.Properties.getString('passKeychain')) {
                return true;
            } else {
                return false;
            }
        },

        activeUser: function () {
            return (Ti.App.Properties.getString('userKeychain')) ? true : false;
        }
    };

    return userObject;

};

module.exports = new _User();