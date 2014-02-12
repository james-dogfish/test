// File deals with logging of error and crittercism stuff
function _Logger() {

    var msg,
        apm = Alloy.Globals.apm,

        loggerObject = {

            // Do a ti log + leave a breadcrumb
            log: function(message, type, noBreadCrumb) {
                switch (type) {
                    case "debug":
                        Ti.API.debug(message);
                        break;
                    case "error":
                        Ti.API.error(message);
                        break;
                    case "trace":
                        Ti.API.trace(message);
                        break;
                    case "info":
                    default:
                        Ti.API.info(message);
                }
                if (!noBreadCrumb && apm) {
                    // leave crumb
                    apm.leaveBreadcrumb(message);
                }
            },

            logException: function(e) {
                apm && apm.logHandledException(e);
            },
            // Set username for crittercism session, 
            // important for reports from dashboard
            setUserName: function(name) {
                apm && apm.setUsername(name);
            }
        };

    return loggerObject;

};

module.exports = new _Logger();