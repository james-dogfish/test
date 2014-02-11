var duration = 0;
var censusGroupType = "";
var censusAssociatedFileName = "";

var soundEffect = Ti.Media.createSound({url:"sound/beep-01a.wav"});

var countDown =  function( seconds, fn_tick, fn_end  ) {
	return {
		totalSec: seconds,
		timer:this.timer,
		
		set: function(seconds) {
			this.totalSec = seconds;
			return this;
		},
		start: function() {
			var self = this;
			Alloy.Globals.Logger.log("censusFooterView seconds = "+this.totalSec,'info');
			
			Alloy.Globals.survey = {
				lastUpdate: moment(),
				duration: moment.duration(this.totalSec * 1000, 'milliseconds'),
				interval: 1000
			};
			this.timer = setInterval( function() {

					
				var timeNow = moment();
				var milliSecondDiff = timeNow.diff(Alloy.Globals.survey.lastUpdate, 'milliseconds');
				var newDuration = Number(Alloy.Globals.survey.duration) - Number(milliSecondDiff);
				Alloy.Globals.survey.duration = moment.duration(newDuration, 'milliseconds');
				
				if(Alloy.Globals.survey.duration.asMilliseconds() < 0){
					self.stop();
					fn_end();
				}
				else{
			
					fn_tick(moment(Alloy.Globals.survey.duration.asMilliseconds()).format('HH:mm:ss'));
					Alloy.Globals.survey.lastUpdate = timeNow;
				}
		
				}, 1000);
				
			return this;
		},
		pause: function(){
			clearInterval(this.timer);
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

var ticCallBack = function(timeString){
	$.timerDisplay.text = timeString;
};

var finishCallBack = function(){
	$.timerDisplay.text = "00:00:00";
	
	soundEffect.setLooping(true);
	soundEffect.play();
	var dialog = Ti.UI.createAlertDialog({
	    message: L('census_has_finished'),
	    ok: 'Okay',
	    title: L('census')

	});
	
	 dialog.addEventListener('click', function(e){
	 	soundEffect.stop();
	 });
	 
	 dialog.show();
	close();
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
	
	var alertYesNo = Titanium.UI.createAlertDialog({
        message: L('stop_timer'),
        buttonNames: ['Yes', 'No']
    });

    alertYesNo.addEventListener('click', function(e) {
        if (e.index == 0) {
            close();
            Alloy.Globals.aIndicator.hide();
        } else if (e.index == 1) {
        }
    });

    alertYesNo.show();
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


