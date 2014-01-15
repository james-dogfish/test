function moveBackClick(e){
	Ti.App.fireEvent("moveSingleSectionCurrentIndex", {
			indexMove : -1
		}); 
};

function moveNextClick(e){
	Ti.App.fireEvent("moveSingleSectionCurrentIndex", {
			indexMove : 1
		}); 
};
