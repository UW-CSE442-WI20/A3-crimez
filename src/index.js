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
	.domain([10000, 25000, 50000, 75000, 100000])
	.range(d3.schemePurples[5]);

var tooltip = d3.select("body")
	.append("div")
        .attr("class", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

Promise.all([
	d3.json("./data/boroughs.geojson"),	
	d3.csv("./data/nyc_crimez_filtered.csv"),
	// d3.json("https://data.cityofnewyork.us/resource/5uac-w243.json"),
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

		let mouseOver = function(d) {
			d3.selectAll(".Borough")
			  .transition()
			  .duration(200)
			  .style("opacity", .5)
			d3.select(this)
			  .transition()
			  .duration(200)
			  .style("opacity", 1)
			  .style("stroke", "black")
		  }
		
		  let mouseLeave = function(d) {
			d3.selectAll(".Borough")
			  .transition()
			  .duration(200)
			  .style("opacity", .8)
			d3.select(this)
			  .transition()
			  .duration(200)
			  .style("stroke", "transparent")
		  }

		// Draw the map
		svg.append("g")
			.selectAll("path")
			.data(geo_data.features)
			.enter()
			.append("path")
			// draw each country
			.attr("d", d3.geoPath()
				.projection(projection)
			)
		
			// set the color of each country
			.attr("fill", function (d) {
				//TODO: group by borough and count number of reports 

				// d.total = data.get(d.id) || 0;
				return colorScale(counts[d.properties.BoroName.toUpperCase()]);
			})
			.attr("class", function(d){ return "Borough" } )
			.on("mouseover", mouseOver)
			// function (d) {
			// 	// tooltip.style("visibility", "visible");
			// })
			.on("mousemove", function (d) {
				d3.select(this)//.style("fill", "lightgrey");
				tooltip.style("top", (d3.event.pageY - 10) + "px")
					.style("left", (d3.event.pageX + 10) + "px")
					.text(d.properties.BoroName + ": " +  counts[d.properties.BoroName.toUpperCase()] + " crimes");
			})
			.on("mouseleave", mouseLeave);
			// .on("mouseout", function (d) {
			// 	d3.select(this).style("fill", colorScale(counts[d.properties.BoroName.toUpperCase()]));
			// 	tooltip.style("visibility", "hidden")
			// });
	}).catch(function(err){
			console.log(err)
		}
	) 
