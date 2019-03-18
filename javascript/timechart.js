
class timeChart {

	constructor(){
		console.log("timechart created!")

	let boundingWidth = document.getElementById('map').offsetWidth;
	this.margin = {top: 5, right: 5, bottom: 95, left: 30}
	this.margin2 = {top: 200, right: 5, bottom: 30, left: 30}

	this.svg = d3.select("#timeChart").attr('transform','translate('+this.margin.left+','+this.margin.top+')');
	this.svg.attr('width',1000);

	//this.svg = d3.select('#timeChartLegend')



	this.svg.attr('height',500);

		//this.svg.attr('height',350).attr('width',100%);


		this.width = +this.svg.node().getBoundingClientRect().width - this.margin.left - this.margin.right
		this.height = +this.svg.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom
		this.height2 = +this.svg.node().getBoundingClientRect().height - this.margin2.top - this.margin2.bottom;


		/*this.svg
			.attr("viewBox", [0, 0, (this.width + this.margin.right + this.margin.left),
												(this.height + this.margin.top + this.margin.bottom)].join(' '))*/

		this.parseDate = d3.timeParse("%b %Y");

		this.xScale = d3.scaleTime().range([0, this.width]),
		this.x2Scale = d3.scaleTime().range([0, this.width]),
		this.yScale = d3.scaleLinear().range([this.height, 0]),
		this.y2Scale = d3.scaleLinear().range([this.height2, 0]);

		this.xAxis = d3.axisBottom(this.xScale),
		this.xAxis2 = d3.axisBottom(this.x2Scale),
		this.yAxis = d3.axisLeft(this.yScale);

		this.sensorLineGenerator = d3.line()
		    .curve(d3.curveMonotoneX)
		    .x((d)=>{ return this.xScale(d.time); })
		    .y((d)=>{ return this.yScale(d.pm25); });

		this.modelLineGenerator = d3.line()
			.curve(d3.curveMonotoneX)
			.x((d)=>{ return this.xScale(d.time); })
		    .y((d)=>{ return this.yScale(d.pm25); });

		this.area2 = d3.area()
		    .curve(d3.curveMonotoneX)
		    .x((d)=>{ return this.x2Scale(d.time); })
		    .y0(this.height2)
		    .y1((d)=> { return this.y2Scale(d.pm25); });

		this.svg.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height);

		this.prevMaxValue = 0;
		this.maxReadings = [];
		this.maxModelEstimates = [];
		this.sensorIndex = 0;
		this.stopValues =[];

		this.modelDatas = [];
		this.sensorDatas = [];
		this.sensorInfos = [];

		this.legend = new timeChartLegend();
		window.controller.timeChartLegend = this.legend;
		this.update();
	}


	initNewChart(){
		this.prevMaxValue = 0;
		this.maxReadings = [];
		this.maxModelEstimates = [];
		this.sensorIndex = 0;
		this.stopValues =[];

		this.modelDatas = [];
		this.sensorDatas = [];
		this.sensorInfos = [];
		this.refreshChart()
	}

	refreshChart(){
		this.svg.selectAll('g').remove();


		this.focus = this.svg.append("g")
	    	.attr("class", "focus")
	    	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	   	this.context = this.svg.append("g")
    		.attr("class", "context")
    		.attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

	}

	updateSlider(date){

		window.controller.selector.setSelectedDate(date,'timeChart');
	  this.selectedDate = date;
	  console.log(this.xScale(this.selectedDate))
	  console.log(this.x2Scale(this.selectedDate));
      this.slider
        .transition()
        .duration(500)
        .attr('x1', this.xScale(this.selectedDate))
        .attr('y1', 0)
        .attr('x2', this.xScale(this.selectedDate))
        .attr('y2', this.height)
        .style("stroke", "grey")
        .style("stroke-width", 4)
        .style("stroke-dasharray",4);
    }

    updateSliderZoom(){
      this.slider
        .attr('x1', this.xScale(this.selectedDate))
        .attr('y1', 0)
        .attr('x2', this.xScale(this.selectedDate))
        .attr('y2', this.height)
        .style("stroke", "grey")
        .style("stroke-width", 4)
        .style("stroke-dasharray",4);
    }

    generateColorScale(){
    	let maxValue = this.maxReadings[this.maxReadings.length-1];
    	console.log(window.controller);

    	let pm25Fixed = JSON.parse(JSON.stringify(window.controller.pm25Domain))//.reverse();
    	pm25Fixed.unshift(0)
    	let colorScale = JSON.parse(JSON.stringify(window.controller.colorRange))//.reverse();

    	let index = pm25Fixed.findIndex(function(number) {
				return number > maxValue;
			});

		let stopValues = [];
		for(let i = 0; i < index; i++){
			let color = colorScale[i];

			let stopValue = {
				'color':color,
				'offset':0
			}
			stopValues.push(stopValue)
		}

		for(let i = index; i < pm25Fixed.length; i++){
			let offset = (maxValue*1.0 - window.controller.pm25Domain[i])/maxValue;
			if(offset < 0){
				offset = 0;
			}

			let color = colorScale[i];

			let stopValue = {
				'color':color,
				'offset':offset
			}

			console.log(stopValue);
			stopValues.push(stopValue)
		}
		stopValues.pop(0);
		stopValues[stopValues.length-1].offset = 1.0;

		this.stopValues.push(stopValues);
		console.log(this.stopValues);
  }

	updateLegend(){

			this.legend.update(this.sensorInfos);
	}

	addData(data,modelData,sensorInfo){
		if(this.sensorInfos.includes(sensorInfo)){
			return;
		}

		if(data == modelData){
			modelData = jQuery.extend(true, {}, data).data;
			//modelData.data;
			this.sameData = true;
		} else {
			this.sameData = false;
		}


		let self = this;
		function type(d) {
		  d.time = new Date(d.time);
		  d.pm25 = +d.pm25;
		  return d;
		}

		if(!data){
			data = modelData;
		} else {
			this.currentData = data.data;
			data = data.data;
		}

		data = data.map(type);
		console.log(data, modelData);
		modelData = modelData.map(type);

		this.modelDatas.push(modelData);
		this.sensorDatas.push(data);
		this.sensorInfos.push(sensorInfo);


		console.log(this.sensorInfos);


		let timeBounds = [data[0].time, data[data.length-1].time];

	  this.xScale.domain(timeBounds);

	  let maxSensorReading = d3.max(data, function(d) { return d.pm25; });
	  let maxModelEstimate = d3.max(modelData, function(d) { return d.pm25; });
		this.maxReadings.push(maxSensorReading)
		this.maxModelEstimates.push(maxModelEstimate);

	  this.prevMaxValue = d3.max([this.prevMaxValue,maxSensorReading,maxModelEstimate]);
	  this.generateColorScale();
		//this.updateGradient(0);








		this.update();
	}

	updateGradient(index){
		console.log(this.stopValues,index);

		if(this.svg.selectAll("#temperature-gradient"+index.toString()).empty()){
			this.svg.append("linearGradient")
			      .attr("id", "temperature-gradient"+index.toString())
			      .attr("gradientUnits", "objectBoundingBox")
			      .attr("x1", 0).attr("y1", 0)
			      .attr("x2", 0).attr("y2", 1)
			    .selectAll("stop")
			      .data(this.stopValues[index])
			    .enter().append("stop")
			      .attr("offset", function(d) { return d.offset; })
			      .attr("stop-color", function(d) { return d.color; });
		}
	}

	removeGradient(index){
		this.svg.selectAll("linearGradient")
			.remove();
		console.log(this.stopValues);
		for(let i = 0; i < this.stopValues.length; i++){
			this.updateGradient(i);
		}
	}

	update(){
		this.yScale.domain([0, this.prevMaxValue]);
		this.x2Scale.domain(this.xScale.domain());
		this.y2Scale.domain(this.yScale.domain());

		console.log(this.maxReadings,this.maxModelEstimates,this.stopValues);
		let self = this;

		this.refreshChart();

		this.updateLegend();

		this.slider = this.focus.append("line");
		console.log(this.slider);

		console.log(window.controller.selectedDate);
		if(window.controller.selectedDate != undefined){
			//window.controller.selector.setSelectedDate(selector.selectedDate,'timeChart');
			this.updateSlider(window.controller.selectedDate);
		}




		function brushed() {
			console.log(d3.event.sourceEvent)
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		  var s = d3.event.selection || self.x2Scale.range();

		  self.xScale.domain(s.map(self.x2Scale.invert, self.x2Scale));
		  self.focus.selectAll(".sensorLine").attr("d", self.sensorLineGenerator);
		  self.focus.selectAll(".modelLine").attr("d", self.modelLineGenerator);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.svg.select(".zoom").call(self.zoom.transform, d3.zoomIdentity
		      .scale(self.width / (s[1] - s[0]))
		      .translate(-s[0], 0));
		  self.updateSliderZoom();
		}

		function zoomed() {
			console.log(d3.event.sourceEvent)
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		  var t = d3.event.transform;
		  self.xScale.domain(t.rescaleX(self.x2Scale).domain());
		  self.focus.selectAll(".sensorLine").attr("d", self.sensorLineGenerator);
		  self.focus.selectAll(".modelLine").attr("d", self.modelLineGenerator);
		  self.focus.select(".axis--x").call(self.xAxis);
		  self.context.select(".brush").call(self.brush.move, self.xScale.range().map(t.invertX, t));
		  self.updateSliderZoom();
		}



		/*
	this.svg.append("linearGradient")
	    .attr("id", "area-gradient")
	    .attr("gradientUnits", "userSpaceOnUse")
	    .attr("x1", 0).attr("y1", this.yScale(0))
	    .attr("x2", 0).attr("y2", this.yScale(1000))
	  .selectAll("stop")
	    .data()
	  .enter().append("stop")
	    .attr("offset", function(d) { return d.offset; })
	    .attr("stop-color", function(d) { return d.color; });
	    */
    // Start of update




	  this.brush = d3.brushX()
		    .extent([[0, 0], [this.width, this.height2]])
		    .on("brush end", brushed);

		this.zoom = d3.zoom()
		    .scaleExtent([1, Infinity])
		    .translateExtent([[0, 0], [this.width, this.height]])
		    .extent([[0, 0], [this.width, this.height]])
		    .on("zoom", zoomed);

	  for(let i = 0; i < this.sensorDatas.length; i++){

	  	let sensorPaths = this.focus.append("path")
	      .datum(this.sensorDatas[i])
	      .attr("class", "sensorLine")
	      .attr("d", this.sensorLineGenerator)
	      .attr('stroke-width','1px')
	      .attr('stroke','gray')
	      .attr('stroke-opacity',0.6)
	      .attr("id","sensorPath"+this.sensorInfos[i].id);
			if(!this.sameData){
				let modelPaths = this.focus.append("path")
		  	  .datum(this.modelDatas[i])
		  	  .attr("class","modelLine")
		  	  .attr("d", this.modelLineGenerator)
		  	  .attr('stroke-width','2px')
		  	  .attr('stroke','darkgrey')
		  	  .attr('stroke-opacity',0.6)
		  	  .attr("id","modelPath"+this.sensorInfos[i].id);
			}


	  	sensorPaths.on("mouseover",function(){
	  		if(that.prevSelection){
	  			that.prevSelection.attr('stroke-width', 1)
	  		}

	  		let sensorID = d3.select(this).attr('id');
	  		let prevSelection = d3.selectAll('#sensorPath'+sensorID)
	  			.attr('stroke-width', 4)

	  		d3.event.stopPropagation();
	  	})

	  	this.context.append("path")
	      .datum(this.sensorDatas[i])
	      .attr("class", "sensorLine")
	      .attr("d", this.area2)
	      .attr('stroke-width','1px')
	      .attr('stroke','gray')
	      .attr('stroke-opacity',0.8);
	  }


	  this.focus.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + this.height + ")")
	      .call(this.xAxis);

	  this.focus.append("g")
	      .attr("class", "axis axis--y")
	      .call(this.yAxis);

				/* Append onto the context menu */
		if(this.sensorDatas.length != 0){
			let newLine = this.context.append("path")
					.datum(this.sensorDatas[this.sensorDatas.length-1])
					.attr("class", "sensorLine")
					.attr("d", this.area2);
		}


	  this.context.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + this.height2 + ")")
	      .call(this.xAxis2);

	  this.context.append("g")
	      .attr("class", "brush")
	      .call(this.brush)
	      .call(this.brush.move, this.xScale.range());

	  let overLay = this.svg.append("rect")
	      .attr("class", "zoom")
	      .attr("width", this.width)
	      .attr("height", this.height)
	      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
	      .call(this.zoom);

	  let that = this;
	  overLay.on("click", function() {
          let coords = d3.mouse(this);
          let newData= {
            x: Math.round( that.xScale.invert(coords[0])),  // Takes the pixel number to convert to number
            y: Math.round( that.yScale.invert(coords[1]))
          }
          that.selectedDate = new Date(newData.x);
					window.controller.selectedDate = that.selectedDate
          selector.grabAllSensorData(window.controller.selectedDate);
          selector.grabAllModelData(window.controller.selectedDate);
          that.updateSlider(that.selectedDate)
      })
	}

	removePoint(index){
		this.sensorDatas.splice(index, 1);
		this.modelDatas.splice(index, 1);


		this.sensorInfos.splice(index, 1);
		console.log(this.maxReadings,this.maxModelEstimates,this.stopValues);
		this.maxReadings.splice(index, 1);
		this.maxModelEstimates.splice(index, 1);
		this.stopValues.splice(index,1);
		console.log(this.maxReadings,this.maxModelEstimates,this.stopValues);
		this.prevMaxValue = d3.max([d3.max(this.maxReadings),d3.max(this.maxModelEstimates)]);
		console.log(this.prevMaxValue);

		if(this.sensorDatas==[]){

			return;
		}

		this.removeGradient(index);
		this.update();
	}

}
