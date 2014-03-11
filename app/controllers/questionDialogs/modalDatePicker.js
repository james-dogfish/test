var args = arguments[0] || {};

var date = new Date();

var dateToString = function(date){
    var day = date.getDate();
    day = (day < 10 )? '0'+day : day;
    
    var month = date.getMonth()+1;
    month = (month < 10 )? '0'+month : month;
    
    var year = date.getFullYear();
   // alert(year + "-" + month + "-" + day);
    return year + "-" + month + "-" + day;
   // return Alloy.Globals.Util.convertDate(date).dateformat2;
};


if(typeof args.timeLimit !== "undefined"){
	if(args.timeLimit == true){
		
		$.datePicker.setMinDate(Alloy.Globals.moment().subtract('days', 30).toDate());
		$.datePicker.setMaxDate(new Date());
	}
}

var closeWindow = function(){
	args.closeCallBack(dateToString(date));
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};

function onBackgroundClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	args.closeWithNoValueCallBack();
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
}

function rightNavButtonClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	closeWindow();
};

function clearButtonClick(e){
	$.background.touchEnabled = false;
	$.modalBackgorund.touchEnabled = false;
	
	args.closeCallBack("");
	
	Alloy.Globals.dialogWindowOpen = false;
	$.window.close();
	$.destroy();
};


function pickerChange(e){
	date = e.value;
}

$.window.open();
  		