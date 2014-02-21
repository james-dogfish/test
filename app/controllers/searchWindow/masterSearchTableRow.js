var crossingObject = arguments[0] || {};


$.crossingRow.filter = crossingObject.name + " "+ crossingObject.type;
$.crossingRow.touchTestId = crossingObject.name + "-"+ crossingObject.id + "-" + crossingObject.type;

$.crossingName.text = "Crossing Name - " + crossingObject.name;
$.crossingElr.text = "Crossing ID - "+ crossingObject.id;

$.crossingType.text = "Crossing Type - "+ crossingObject.type;

