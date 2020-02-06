var width = 960, height = 500;

svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var projection = d3.geoMercator()
	.center([-73.94, 40.70])
	.scale(50000)
	.translate([(width) / 2, (height) / 2]);

var path = d3.geoPath()
	.projection(projection);

var inputValue = "January";
var dates = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.domain([1, 100, 1000, 3000, 6000])
	.range(d3.schemePurples[5]);

var boroughName = function(d) {
	d.properties.BoroName.replace(/ /g, '');
}

var tooltip = d3.select("body")
	.append("div")
        .attr("class", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

let mouseOver = function(d) {
	d3.selectAll(".Borough:not(#" + boroughName(d)+ ")")
		.transition()
		.duration(200)
		.style("opacity", .2)
	d3.select(this)
		.transition()
		.duration(200)
		.style("opacity", 1)
		.style("stroke", "black")
	tooltip.style("top", (d3.event.pageY - 10) + "px")
		.style("left", (d3.event.pageX + 10) + "px")
		.transition()
		.duration(200)
	        .style("visibility", "visible")
		.text(d.properties.BoroName + ": " +  months[inputValue][d.properties.BoroName.toUpperCase()] + " crimes");
}

let mouseMove = function(d) {
	d3.selectAll(".Borough:not(#" + boroughName(d) + ")")
		.transition()
		.duration(200)
		.style("opacity", 0.2)
		.style("stroke", "transparent")
	d3.select(this)
		.transition()
		.duration(200)
		.style("opacity", 1)
		.style("stroke", "black")
	tooltip.style("top", (d3.event.pageY - 10) + "px")
		.style("left", (d3.event.pageX + 10) + "px")
		.text(d.properties.BoroName + ": " +  months[inputValue][d.properties.BoroName.toUpperCase()] + " crimes");
}

let mouseOut = function(d) {
	d3.selectAll(".Borough")
		.transition()
		.duration(100)
		.style("opacity", 1)
		.style("stroke", "transparent")
	tooltip.style("visibility", "hidden")
}

Promise.all([
	d3.json("./data/boroughs.geojson"),	
	d3.csv("./data/nyc_crimez_filtered.csv"),
]).then(
	(data, reg) => {
		months = {}
		let geo_data = data[0]
		let crime_data = data[1]

		for(var i = 0; i < crime_data.length; i++){
            var date = crime_data[i]["CMPLNT_FR_DT"]
            var parts = date.split("/")
            var month = dates[parts[0]-1]
            var name = [crime_data[i]["BORO_NM"]]
            if (months[month]) {
                if (months[month][name]) {
                    months[month][name] += 1
                } else {
                    months[month][name] = 1
                }
            } else {
                months[month] = {}
                months[month][name] = 1
            }
		}

		// Draw the map
		svg.append("g")
			.selectAll("path")
			.data(geo_data.features)
			.enter()
			.append("path")
			// draw each country
			.attr("d", d3.geoPath().projection(projection))
		        .attr("id", (d) => boroughName(d))
	
	      // set the color of each country
	      .attr("fill", function (d) {
			  //TODO: group by borough and count number of reports 
	        // d.total = data.get(d.id) || 0;
	        return initialDate(d);
		  })
		  .attr("class", function(d){ return "Borough" } )
			.on("mouseover", mouseOver)
			.on("mousemove", mouseMove)
			.on("mouseout", mouseOut);

	d3.select("#timeslide").on("input", function() {
    	update(+this.value);
	});

	function update(value) {
    	document.getElementById("range").innerHTML=dates[value];
    	inputValue = dates[value];
    	d3.selectAll(".Borough")
        	.attr("fill", initialDate);
	}

	function initialDate(d){
    	var name = d.properties.BoroName.toUpperCase();
    	console.log(months)
		var c = months[inputValue][name];
		return colorScale(c);
	}

	}).catch(function(err){
			console.log(err)
		}
	) 
