function _Analytics() {

    var analyticsObject = {
        // track screen navigation, currently not
        // supported via dashboard so invoking the 
        // feature function as per recommendation
        // will also do the nav event in case dashboard
        // supports the ui in the future
        // http://docs.appcelerator.com/platform/latest/#!/guide/Analytics-section-37524837_Analytics-Transitionevents
        trackNav: function(from, to, name) {
            //var that = self;
            if (Alloy.CFG.analytics.navOverride) {
                analyticsObject.trackFeature(from + '-to-' + to);
            }
            Ti.Analytics.navEvent(from, to, name);
        },

        trackFeature: function(name) {
            Ti.Analytics.featureEvent(name);
        }
    };

    return analyticsObject;

};

module.exports = new _Analytics();