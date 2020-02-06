var projection = d3.geoMercator()
	.center([-73.94, 40.70])
	.scale(50000)
	.translate([300, 300]);

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

// mouse animations
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

// all data functionality
Promise.all([
	d3.json("./data/boroughs.geojson"),	
	d3.csv("./data/nyc_crimez_filtered.csv"),
]).then(
	(data, reg) => {
		months = {}
		let geo_data = data[0]
		let crime_data = data[1]

		crime_types = {}
		
		// calculate month hash
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
			if (crime_types[crime_data[i]["OFNS_DESC"]]) {
				crime_types[crime_data[i]["OFNS_DESC"]] += 1
			} else {
				crime_types[crime_data[i]["OFNS_DESC"]] = 1
			}

		}
		console.log(months)

		// Draw the map
		d3.select("#map").append("g")
			.selectAll("path")
			.data(geo_data.features)
			.enter()
			.append("path")
		        // draw each country
			.attr("d", d3.geoPath().projection(projection))
			.attr("id", (d) => boroughName(d))

		        // set the color of each country
			.attr("fill", function (d) {
				return initialDate(d);
			})
			.attr("class", function(d){ return "Borough" } )
			.on("mouseover", mouseOver)
			.on("mousemove", mouseMove)
			.on("mouseout", mouseOut);

		// slider 
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
			var c = months[inputValue][name];
			return colorScale(c);
		}

		// convert crimes_types hash to array of hashes
		// probably a better way to do all this
		var crimes = new Array(Object.keys(crime_types).length);
		i = 0
		Object.keys(crime_types).forEach(function (key) { 
			var value = crime_types[key]
			crimes[i] = { "type": key, "count": value }
			i++
		})
		
		// bar graph setup
		const yScale = d3.scaleLinear()
			.range([300, 0])
		        // 60000 should be max of displayed counts
			.domain([0, 60000]);

		const xScale = d3.scaleBand()
			.range([0, 500])
		        .domain(crime_data.map((d) => d.OFNS_DESC))
			.padding(0.2)

		const chart = d3.select("#bar").append('g')
			.attr('transform', `translate(50, 50)`);

		// y axis
		chart.append('g')
		     .call(d3.axisLeft(yScale));

		// x axis
		chart.append('g')
	             .attr('transform', `translate(0, 300)`)
		     .call(d3.axisBottom(xScale));

		// bars
		chart.selectAll()
			.data(crimes)
			.enter()
			.append('rect')
			.attr('x', (d) => xScale(d.type))
		        // add dynamic counting for this value
			.attr('y', (d) => yScale(d.count))
			.attr('height', (d) => 300 - yScale(d.count))
			.attr('width', xScale.bandwidth())

	}).catch(function(err){
		console.log(err)
	}
	) 
