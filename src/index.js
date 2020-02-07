var width = 960, height = 500;

var svg = d3.select("#container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);


var projection = d3.geoMercator()
	.center([-73.94, 40.70])
	.scale(50000)
	.translate([300, 300]);

var path = d3.geoPath()
	.projection(projection);

var viewAll = false;
var inputValue = "January";
var dates = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.domain([1, 5000, 8000, 10000, 20000])
	.range(d3.schemePurples[5]);

var boroughName = function (d) {
	d.properties.BoroName.replace(/ /g, '');
}
var locationName = function (d) {
	d.type.replace(/ /g, '');
}

var getText = function (d) {
	var name = d.properties.BoroName;
	if (d3.select("#timecheck").property("checked")) {
		var c = 0;
		for (var i = 0; i < dates.length; i++) {
			c += months[dates[i]][name.toUpperCase()];
		}
		return (name + ": " + c + " crimes")
	} else {
		return (name + ": " + months[inputValue][name.toUpperCase()] + " crimes")
	}
}

var tooltip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

// mouse animations
let mapMouseOver = function (d) {
	d3.selectAll(".Borough:not(#" + boroughName(d) + ")")
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
		.text(getText(d))
}

let mapMouseMove = function (d) {
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
		.text(getText(d))
}

let mapMouseOut = function (d) {
	d3.selectAll(".Borough")
		.transition()
		.duration(100)
		.style("opacity", 1)
		.style("stroke", "transparent")
	tooltip.style("visibility", "hidden")
}



// graph mouse animations
let chartMouseOver = function(d) {
	d3.selectAll(".Bar:not(#" + locationName(d)+ ")")
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
		.text(d.count + " crimes");
}

let chartMouseMove = function(d) {
	d3.selectAll(".Bar:not(#" + locationName(d) + ")")
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
		.text(d.count + " crimes");
}

let chartMouseOut = function(d) {
	d3.selectAll(".Bar")
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

		crime_location = {}
  
		// calculate month hash
		for (var i = 0; i < crime_data.length; i++) {
			var date = crime_data[i]["CMPLNT_FR_DT"]
			var parts = date.split("/")
			var month = dates[parts[0] - 1]
			var name = [crime_data[i]["BORO_NM"]]
			var crime = crime_data[i]['offense_id'];
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

			if (crime_location[crime_data[i]["PREM_TYP_DESC"]]) {
				crime_location[crime_data[i]["PREM_TYP_DESC"]] += 1
			} else {
				crime_location[crime_data[i]["PREM_TYP_DESC"]] = 1
			}

		}
		console.log(months)



		function handleCheckboxes() {
			let newCounts = {}
			value = this.id;

			if (value != "timecheck") {
				if (value == "all") {
					if (document.getElementById("all").checked) {
						checkboxes = document.getElementsByTagName("input");
						for (var i = 1; i < checkboxes.length; i++) {
							console.log(checkboxes[i].checked);
							checkboxes[i].checked = true;
						}
					} else {
						checkboxes = document.getElementsByTagName("input");
						for (var i = 1; i < checkboxes.length; i++) {
							checkboxes[i].checked = false;
						}
					}
				} else {
					if (!document.getElementsByName(value).checked) {
						document.getElementById("all").checked = false;
					}
				}
			}

			// crimtTypes holds all the crimes that are selected 
			crimeTypes = [];
			checkboxes = document.getElementsByTagName("input");

			// this forloop populated crimeTypes with the crimes that are selected 
			for (var i = 0; i < checkboxes.length; i++) {
				if (checkboxes[i].checked) {
					crimeTypes[i] = checkboxes[i].id;
				}
			}

			for (var i = 0; i < crime_data.length; i++) {
				if (crimeTypes.includes(crime_data[i]['offense_id'])) {
					let boroughKey = newCounts[crime_data[i]["BORO_NM"]];

					if (boroughKey) {
						newCounts[crime_data[i]["BORO_NM"]] += 1;
					} else {
						newCounts[crime_data[i]["BORO_NM"]] = 1;
					}
				}
			}

			console.log("func", newCounts);

			d3.selectAll(".Borough").attr("fill", function (d) {
				return colorScale(newCounts[d.properties["BoroName"].toUpperCase()]);
			});
		}

		// checkboxes
		d3.selectAll("input").on("click", handleCheckboxes);

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
			.attr("class", function (d) { return "Borough" })
			.on("mouseover", mapMouseOver)
			.on("mousemove", mapMouseMove)
			.on("mouseout", mapMouseOut);
			
		// slider 
		d3.select("#timeslide").on("input", function () {
			update(+this.value);
		});

		d3.select("#timecheck").on("input", function () {
			update(+this.value);
		});

		// updates inputValue based on slider
		function update(value) {
			if (isNaN(value)) {
				if (d3.select("#timecheck").property("checked")) {
					document.getElementById("range").style.opacity = "0.4";
					document.getElementById("timeslide").style.opacity = "0.4";
				} else {
					document.getElementById("range").style.opacity = "1.0";
					document.getElementById("timeslide").style.opacity = "1.0";
				}
			} else {
				document.getElementById("range").innerHTML = dates[value];
				inputValue = dates[value];
			}

			d3.selectAll(".Borough")
				.attr("fill", initialDate);
		}
		
		// fetchs data based on date selections
		function initialDate(d) {
			var name = d.properties.BoroName.toUpperCase();
			var c = 0;
			if (d3.select("#timecheck").property("checked")) {
				for (var i = 0; i < dates.length; i++) {
					c += months[dates[i]][name];
				}
			} else {
				c = months[inputValue][name];
			}
			return colorScale(c);
		}

		// convert crimes_types hash to array of hashes
		// probably a better way to do all this
		var crimes = new Array(Object.keys(crime_location).length);
		i = 0
		Object.keys(crime_location).forEach(function (key) {
			var value = crime_location[key]
			crimes[i] = { "type": key, "count": value }
			i++
		})
		// sort the locations based on count, in ascending order
		crimes.sort((a, b) => (a.count > b.count) ? -1 : ((b.count > a.count) ? 1 : 0));

		//get the top 5 locations
		sliced = crimes.slice(0, 5);

		// bar graph setup
		const yScale = d3.scaleLinear()
			.range([200, 0])
			// 60000 should be max of displayed counts
			.domain([0, 110000]);

		const xScale = d3.scaleBand()
			.range([0, 300])
			.domain(sliced.map((d) => d.type))
			.padding(0.2)

		const chart = d3.select("#bar").append('g')
			.attr('transform', `translate(50, 50)`);

		// y axis
		chart.append('g')
			.call(d3.axisLeft(yScale));

		// x axis
		chart.append('g')
			.attr('transform', `translate(0, 200)`)
			.call(d3.axisBottom(xScale))
			.selectAll("text")	
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d) {
				return "rotate(-65)" 
				});

		// bars
		chart.selectAll()
			.data(sliced)
			.enter()
			.append('rect')
			.attr('x', (d) => xScale(d.type))
			// add dynamic counting for this value
			.attr('y', (d) => yScale(d.count))
			.attr('height', (d) => 200 - yScale(d.count))
			.attr('width', xScale.bandwidth())
			.attr("class", function(d){ return "Bar" } )
			.on("mouseover", chartMouseOver)
			.on("mousemove", chartMouseMove)
			.on("mouseout", chartMouseOut);

	}).catch(function (err) {
		console.log(err)
	}
	) 
