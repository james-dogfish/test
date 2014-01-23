var duration = 0;
var censusGroupType = "";
var censusAssociatedFileName = "";

var countDown =  function( millisecond, fn_tick, fn_end  ) {
	return {
		totalSec: millisecond,
		timer:this.timer,
		set: function(millisecond) {
			this.totalSec = millisecond;
			this.time = {h : Math.floor(this.totalSec / 3600000), m : Math.floor(this.totalSec / 60), s : this.totalSec % 60};
			return this;
		},
		start: function() {
			var self = this;
			this.timer = setInterval( function() {
				if (self.totalSec) {
					self.totalSec--;
					
					self.time = {h : Math.floor(self.totalSec / 3600000), m : Math.floor(self.totalSec / 60), s : self.totalSec % 60};
					
					self.time.h %= 60;
					self.time.m %= 60;
				
					fn_tick(self.time);
				}
				else {
					self.stop();
					fn_end();
				}
				}, 1000);
				
			return this;
		},
		stop: function() {
			clearInterval(this.timer);
			this.time = {h:0,m:0,s:0};
			this.totalSec = 0;
			this.startTotalSec = 0;
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
	duration = timerDuration;
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


