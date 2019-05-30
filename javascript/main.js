
window.controller = new Controller();
let pm25TimeChart = new timeChart();
window.controller.timeChart = pm25TimeChart;
let aqMap = new AQMap();
window.controller.map = aqMap;

let selector = new Selector();
window.controller.selector = selector;
window.controller.slider = new Slider();
window.controller.map = aqMap;
//let mode = new ModeSelector(); END MODE REMOVAL
//window.controller.modeSelector = mode;
function makeSearch() {

	let sensorName = document.getElementsByName("search")[0].value;

	let sensor = window.controller.allSensorsData.find(function(element){
		return element.id === sensorName;
	})
  	window.controller.selector.grabIndividualSensorData(sensor)
  	window.controller.map.myMap.panTo(new google.maps.LatLng(sensor.lat, sensor.long));

  	let element = d3.selectAll(".marker")
  		.filter(function(d) { return d.id === sensor.id })

    element.node().dispatchEvent(new Event('click'));
    return false;

}
