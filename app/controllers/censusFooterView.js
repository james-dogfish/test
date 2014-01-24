var duration = 0;
var censusGroupType = "";
var censusAssociatedFileName = "";

var convertSecondsToTimeObject = function(seconds){
	return {
			h : Math.floor(seconds / (3600)), 
			m : Math.floor((seconds / 60) % 60), 
			s : seconds % 60
		};
};

var countDown =  function( seconds, fn_tick, fn_end  ) {
	return {
		totalSec: seconds,
		timer:this.timer,
		set: function(seconds) {
			this.totalSec = seconds;
			this.time = convertSecondsToTimeObject(this.totalSec);
			return this;
		},
		start: function() {
			var self = this;
			this.timer = setInterval( function() {
				Ti.API.info("self.totalSec" + self.totalSec);
				if (self.totalSec) {
					self.totalSec--;
				
					
					self.time = convertSecondsToTimeObject(self.totalSec);
					//Ti.API.info("self.totalSec" + self.totalSec+ ", time = "+JSON.stringify(self.time));

				
					fn_tick(self.time);
				}
				else {
					self.stop();
					fn_end();
				}
				}, 1000);
				
			return this;
		},
		pause: function(){
			clearInterval(this.timer);
			this.time = convertSecondsToTimeObject(this.totalSec);
			//this.time = {h : Math.floor(this.totalSec / 3600000), m : Math.floor(this.totalSec / 60), s : this.totalSec % 60};
			
		},
		stop: function() {
			clearInterval(this.timer);
			this.time = {h:0,m:0,s:0};
			this.totalSec = 0;
			return this;
		}
		
	};
};



var isOpen = false;

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}

var ticCallBack = function(time){
	$.timerDisplay.text = leftPad(time.h, 2)+":"+leftPad(time.m, 2)+":"+leftPad(time.s, 2);
};

var finishCallBack = function(){
	$.timerDisplay.text = "00:00:00";
};

var countDownObject = countDown(0, ticCallBack, finishCallBack);



var open = function(timerDuration, groupType, associatedFileName){
	$.container.height = "60dp";
	isOpen = true;
	
	$.timerDisplay.text = "00:00:00";
	
	if(countDownObject != null){
		countDownObject.stop();
	}
	
	censusGroupType =groupType;
	censusAssociatedFileName = associatedFileName;
	//duration = parseInt(1)*3600000+parseInt(0)*60+parseInt(10);
	//duration = timerDuration;
	Ti.API.info("timerDuration 2 = "+timerDuration);
	countDownObject.set(timerDuration);
	countDownObject.start();
};
exports.open = open;

var close = function(){
	$.container.height = "0dp";
	isOpen = false;

	if(countDownObject != null){
		countDownObject.stop();
	}
	
};
exports.close = close;

var toggleOpen = function(){
	if(isOpen == false){
		open();
	}
	else{
		close();
	}
};
exports.toggleOpen = toggleOpen;


function playClick(e){
	if(countDownObject != null){
		countDownObject.start();
	}
};

function pauseClick(e){
	if(countDownObject != null){
		countDownObject.pause();
	}
};

function stopClick(e){
	close();
};

function resetClick(e){
	if(countDownObject != null){
		countDownObject.stop();
		countDownObject.set(duration);
		countDownObject.start();
	}
};

function goToCensus(e){
	$.trigger('goToCensus', {censusAssociatedFileName : censusAssociatedFileName});
};


