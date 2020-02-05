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

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.domain([1000, 50000, 10000, 50000, 60000, 70000, 80000, 90000, 100000])
	.range(d3.schemePurples[9]);

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
		.text(d.properties.BoroName + ": " +  counts[d.properties.BoroName.toUpperCase()] + " crimes");
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
		.text(d.properties.BoroName + ": " +  counts[d.properties.BoroName.toUpperCase()] + " crimes");
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
		counts = {}
		let geo_data = data[0]
		let crime_data = data[1]

		for(var i = 0; i < crime_data.length; i++){

			if (counts[crime_data[i]["BORO_NM"]]) {
			  counts[crime_data[i]["BORO_NM"]] += 1
		   } else{
			  counts[crime_data[i]["BORO_NM"]] = 1
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
				return colorScale(counts[d.properties.BoroName.toUpperCase()]);
			})
			.attr("class", function(d){ return "Borough" } )
			.on("mouseover", mouseOver)
			.on("mousemove", mouseMove)
			.on("mouseout", mouseOut);
	}).catch(function(err){
			console.log(err)
		}
	) 
