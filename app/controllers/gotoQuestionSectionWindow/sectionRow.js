var sectionDetails = arguments[0] || {};


$.name.text = sectionDetails.title;

function rowClick(e){
	$.trigger('sectionClick', sectionDetails);
}
