
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
function modeSelectionSetUp(){
	let metricMenu = document.getElementById('modeSelector');
	let div = document.createElement('div');

	let modeTypes = ['Longitudinal','Drill-Down']
	for(let i=0; i < modeTypes.length ; i++)
	{
				let innerDiv = document.createElement('div')
				innerDiv.id = modeTypes[i];
				let button = document.createElement('input')
				button.type = "radio"
				button.name = "tool modes"
				button.value = modeTypes[i];

				if(i == 0){
					button.checked = true;
				}
				//item.innerHTML= '<input type="checkbox" name="item[]" value="'+label+'>';

				//let item = label + newBox;
				let label = document.createElement('label');
				label.innerHTML = modeTypes[i];
				label.htmlFor = modeTypes[i];
				innerDiv.appendChild(button);
				innerDiv.appendChild(label);
				metricMenu.appendChild(innerDiv);
				innerDiv.onclick = (e)=>{

					let metric = e.toElement.value;
					if(metric == window.controller.currentMode){
						return;
					}
					window.controller.currentMode = metric;
					if(window.controller.currentMode == "Drill-Down"){
						window.controller.selector.getAllData = true;
					} else {
						window.controller.selector.getAllData = false;
					}

				}
		}
		metricMenu.appendChild(div);

		//this.myMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sensorSourceMenu);
	}



modeSelectionSetUp();
