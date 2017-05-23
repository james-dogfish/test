#!/bin/sh
# Jenkins script for dev builds

# Get changelog and save to text file
curl --user ${API_USER}:${API_PASS} -s "${BUILD_URL}api/xml?wrapper=changes&xpath=//changeSet//comment" | sed -e "s/<\/comment>//g; s/<comment>/\- /g; s/<\/*changes>//g">changelog.txt
#  curl -s "${BUILD_URL}api/xml?wrapper=changes&xpath=//changeSet//comment" | sed -e "s/<\/comment>//g; s/<comment>/\- /g; s/<\/*changes>//g">changelog.txt

# cd into workspace
cd $WORKSPACE

BUILD_ENV=$1

# JSHint report
jshint app --reporter=checkstyle > checkstyle-result.xml | true

# Change version number of tiapp.xml
tiversion --version $BUILD_NUMBER

#add build number to the icon


var fs = require('fs'),
	configJson = require('../app/config');

if (process.argv[2] !== "prod") {
ti-icon-overlay "$BUILD_ENV $BUILD_NUMBER" $WORKSPACE
}




node releasescripts/build.js $BUILD_ENV

# Set Ti SDK to 3.4.0 Custom
#node /usr/local/bin/ti sdk select 5.1.2.GA

# Build - iOS
# cd into workspace
cd $WORKSPACE

tisergeant

appc run --distribution-name 'Dogfi.sh Mobile Ltd' --pp-uuid ${PROV_ID} --target dist-adhoc --output-dir dist/ --log-level debug --platform ios
