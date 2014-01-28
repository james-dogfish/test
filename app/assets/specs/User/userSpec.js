require('/test-framework/tijasmine').infect(this);

describe("User Module Test Suite", function () {
	
	var User = require('core/User');
	
    it('test User Object is valid', function(){
			expect(User).not.toBeUndefined();
    });
    
 	it('test User Object is invalid', function(){
 			if(typeof User !== "undefined")
 			{
 				User = "undefined";
 			}
			expect(User).toBeUndefined();
    });
    
	it('test User has been initialiased', function(){
		
			var success = false;
			
			User.init();
			if(typeof Ti.App.Properties.getString('userKeychain') !== "undefined" &&
			   typeof Ti.App.Properties.getString('passKeychain') !== "undefined" &&
			   typeof Ti.App.Properties.getBool('loginKeychain') !== "undefined"){
			   success = true;
    		}
    		
            expect(success).toEqual(true);
    });
    
    it('test User has NOT been initialiased', function(){
		
			var success = true;
			
			User.init();
			if(typeof Ti.App.Properties.getString('userKeychain') !== "undefined" &&
			   typeof Ti.App.Properties.getString('passKeychain') !== "undefined" &&
			   typeof Ti.App.Properties.getBool('loginKeychain') !== "undefined"){
			   success = false;
    		}
    		
            expect(success).toEqual(true);
    });
    
    it('test User setLoginTimestamp is successfull', function(){
		
			var success = false;
			
			User.setLoginTimestamp();
			if(typeof Ti.App.Properties.getString('lastLogin') !== "undefined"){
			   success = true;
    		}
    		
            expect(success).toEqual(true);
    });
    it('test User setLoginTimestamp is NOT successfull', function(){
		
			var success = true;
			
			User.setLoginTimestamp();
			if(typeof Ti.App.Properties.getString('lastLogin') !== "undefined"){
			   success = false;
    		}
    		
            expect(success).toEqual(true);
    });
    it('test User howLongLeft is successfull', function(){
		
			var success = false;
			
			if(isNaN(User.howLongLeft())){
				success = true;
    		}
    		
            expect(success).toEqual(true);
    });
      it('test User howLongLeft is NOT successfull', function(){
		
			var success = true;
			
			if(isNaN(User.howLongLeft())){
				success = false;
    		}
    		
            expect(success).toEqual(true);
    });
    it('test User setLogin is successfull', function(){
		
			var success = false;
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	success = true;
		    });
    		
            expect(success).toEqual(true);
    });
    
    it('test User setLogin is NOT successfull', function(){
		
			var success = true;
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	success = false;
		    });
    		
            expect(success).toEqual(true);
    });
    
     it('test User setRoute is successfull', function(){
		
			var success = false;
			
			User.setRoute("test");
			
			if(typeof Ti.App.Properties.getString('LCM_ROUTE') !== "undefined" &&
				Ti.App.Properties.getString('LCM_ROUTE') === "test"){
					success = true;
				}
    		
            expect(success).toEqual(true);
    });
    
     it('test User setRoute is NOT successfull', function(){
		
			var success = false;
			
			User.setRoute("test123");
			
			if(typeof Ti.App.Properties.getString('LCM_ROUTE') !== "undefined" &&
				Ti.App.Properties.getString('LCM_ROUTE') !== "test"){
					success = true;
				}
    		
            expect(success).toEqual(true);
    });
    
     it('test User getLogin is successfull', function(){
		
			var success = false;
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	var userLogin = User.getLogin();
		    	if(userLogin.username.length > 0 &&
		    		userLogin.password.length > 0 &&
		    		userLogin.access.length > 0 &&
		    		userLogin.route.length > 0){
		    			success = true;
		    			User.logOut();
		    		}
		    });
    		
            expect(success).toEqual(true);
    });
    
     it('test User getLogin is NOT successfull', function(){
		
			var success = false;
			

		    	var userLogin = User.getLogin();
		    	if(userLogin.username.length === 0 &&
		    		userLogin.password.length === 0 &&
		    		userLogin.access.length === 0 &&
		    		userLogin.route.length === 0){
		    			success = true;
		    		}

            expect(success).toEqual(true);
    });
    
     it('test User isLoggedIn is successfull', function(){
		
			var success = false;
			
			var args = {
		        username: 'Admin User',
		        password: 'WrksdhfsiuYY45',
		        access: 'not-important-for-this-test',
		        route: 'not-important-for-this-test'
		    };
		    User.setLogin(args, function (args) {
		    	success = User.isLoggedIn();
		    	User.logOut();
		    });
    		
            expect(success).toEqual(true);
    });
    
    it('test User isLoggedIn is NOT successfull', function(){		
			var loggedIn = User.isLoggedIn;
            expect(loggedIn).toEqual(false);
    });
    
    it('test User does HAVE Prefs', function(){		
    		//assume user doesnt have prefs
			var hasPrefs = false;
			
			User.setPreferences({
				name: 'test',
				email: 'test@dogfi.sh',
				mobile: '123456',
				singleView: 'false'
			});
			
			hasPrefs = User.hasPreferences();
			
			expect(hasPrefs).toEqual(true);
    });
    
    it('test User does NOT HAVE Prefs', function(){		
    		//assume user doesnt have prefs
			var hasPrefs = false;
			
			User.setPreferences(null);
			
			hasPrefs = User.hasPreferences();
			
			expect(hasPrefs).toEqual(false);
    });
    /* END OF TEST SUITE */
});
    