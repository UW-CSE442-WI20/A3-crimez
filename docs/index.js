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

var sliced = []; 
var crimeTypes = [];
var inputValue = "January";
var dates = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.domain([1, 5000, 8000, 10000, 20000])
	.range(d3.schemePurples[5]);

var legendColor = d3.legendColor()
	.labelFormat(d3.format(".0f"))
	.labels(d3.legendHelpers.thresholdLabels)
	.scale(colorScale);

var boroughName = function (d) {
	d.properties.BoroName.replace(/ /g, '');
}
var locationName = function (d) {
	d.type.replace(/ /g, '');
}

var getText = function (d) {
	var name = d.properties.BoroName;
	var c = 0;
	console.log(crimeTypes);
	if (d3.select("#timecheck").property("checked")) {
		if (d3.select("#all").property("checked")) {
			c = mapDict["AllMonths"][name.toUpperCase()]["AllCrimes"];
		} else {
			for (var i = 0; i < crimeTypes.length; i++) {
				curr = crimeTypes[i];
				if (mapDict["AllMonths"][name.toUpperCase()][curr]) {
					c += mapDict["AllMonths"][name.toUpperCase()][curr];
				}
			}
		}
	} else {
		if (d3.select("#all").property("checked")) {
			c = mapDict[inputValue][name.toUpperCase()]["AllCrimes"];
		} else {
			for (var i = 0; i < crimeTypes.length; i++) {
				curr = crimeTypes[i];
				if (mapDict[inputValue][name.toUpperCase()][curr]) {
					c += mapDict[inputValue][name.toUpperCase()][curr];
				}
			}
		}
	}
	return (name + ": " + c + " crimes")
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
		.duration(100)
		.style("opacity", .2)
	d3.select(this)
		.transition()
		.duration(100)
		.style("opacity", 1)
		.style("stroke", "black")
	tooltip.style("top", (d3.event.pageY - 10) + "px")
		.style("left", (d3.event.pageX + 10) + "px")
		.transition()
		.duration(100)
		.style("visibility", "visible")
		.text(getText(d))
}

let mapMouseMove = function (d) {
	d3.selectAll(".Borough:not(#" + boroughName(d) + ")")
		.transition()
		.duration(100)
		.style("opacity", 0.2)
		.style("stroke", "transparent")
	d3.select(this)
		.transition()
		.duration(100)
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
let chartMouseOver = function (d) {
	d3.selectAll(".Bar:not(#" + locationName(d) + ")")
		.transition()
		.duration(100)
		.style("opacity", .2)
	d3.select(this)
		.transition()
		.duration(100)
		.style("opacity", 1)
		.style("stroke", "black")
	tooltip.style("top", (d3.event.pageY - 10) + "px")
		.style("left", (d3.event.pageX + 10) + "px")
		.transition()
		.duration(100)
		.style("visibility", "visible")
		.text(d.count + " crimes");
}

let chartMouseMove = function (d) {
	d3.selectAll(".Bar:not(#" + locationName(d) + ")")
		.transition()
		.duration(100)
		.style("opacity", 0.2)
		.style("stroke", "transparent")
	d3.select(this)
		.transition()
		.duration(100)
		.style("opacity", 1)
		.style("stroke", "black")
	tooltip.style("top", (d3.event.pageY - 10) + "px")
		.style("left", (d3.event.pageX + 10) + "px")
		.text(d.count + " crimes");
}

let chartMouseOut = function (d) {
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
		mapDict = {}
		barDict = {}
		let geo_data = data[0]
		let crime_data = data[1]

		// calculate month hash
		for (var i = 0; i < crime_data.length; i++) {
			var date = crime_data[i]["CMPLNT_FR_DT"]
			parts = [];
			if (date.includes("&")) {
				parts = date.split(" & ")
			} else {
				parts = date.split("/")
			}

			var month = dates[parts[0] - 1]
			var name = [crime_data[i]["BORO_NM"]]
			var crime = crime_data[i]['offense_id'];
			var premise = crime_data[i]["PREM_TYP_DESC"];
			// all months all crimes
			if (mapDict["AllMonths"] && barDict["AllMonths"]) {
				if (barDict["AllMonths"]["AllCrimes"]) {
					if (barDict["AllMonths"]["AllCrimes"][premise]) { 
						barDict["AllMonths"]["AllCrimes"][premise] += 1
					} else {
						barDict["AllMonths"]["AllCrimes"][premise] = 1
					}
				} else {
					barDict["AllMonths"]["AllCrimes"] = {}
					barDict["AllMonths"]["AllCrimes"][premise] = 1
				}
				if (mapDict["AllMonths"][name]) {
					if (mapDict["AllMonths"][name]["AllCrimes"]) {
						mapDict["AllMonths"][name]["AllCrimes"] += 1
					} else {
						mapDict["AllMonths"][name]["AllCrimes"] = 1
					}
				} else {
					mapDict["AllMonths"][name] = {}
					mapDict["AllMonths"][name]["AllCrimes"] = 1
				}
			} else {
				mapDict["AllMonths"] = {}
				mapDict["AllMonths"][name] = {}
				mapDict["AllMonths"][name]["AllCrimes"] = 1

				barDict["AllMonths"] = {}
				barDict["AllMonths"]["AllCrimes"] = {}
				barDict["AllMonths"]["AllCrimes"][premise] = 1
			}

			// all months specific crimes 
			if (mapDict["AllMonths"][name]) {
				if (mapDict["AllMonths"][name][crime]) {
					mapDict["AllMonths"][name][crime] += 1
				} else {
					mapDict["AllMonths"][name][crime] = 1
				}
			} else {
				mapDict["AllMonths"][name] = {}
				mapDict["AllMonths"][name][crime] = 1
			}
			if (barDict["AllMonths"][crime]) {
				if (barDict["AllMonths"][crime][premise]) {
					barDict["AllMonths"][crime][premise] += 1
				} else {
					barDict["AllMonths"][crime][premise] = 1
				}
			} else {
				barDict["AllMonths"][crime] = {}
				barDict["AllMonths"][crime][premise] = 1
			}

			//specific month, all crimes 
			if (mapDict[month] && barDict[month]) {
				if (barDict[month][premise]) {
					if (barDict[month]["AllCrimes"][premise]) { 
						barDict[month]["AllCrimes"][premise] += 1
					} else {
						barDict[month]["AllCrimes"][premise] = 1
					}

				} else {
					barDict[month]["AllCrimes"] = {}
					barDict[month]["AllCrimes"][premise] = 1
				}
				if (mapDict[month][name]) {
					if (mapDict[month][name]["AllCrimes"]) {
						mapDict[month][name]["AllCrimes"] += 1
					} else {
						mapDict[month][name]["AllCrimes"] = 1
					}

				} else {
					mapDict[month][name] = {}
					mapDict[month][name]["AllCrimes"] = 1
				}
			} else {
				mapDict[month] = {}
				mapDict[month][name] = {}
				mapDict[month][name]["AllCrimes"] = 1

				barDict[month] = {}
				barDict[month]["AllCrimes"] = {}
				barDict[month]["AllCrimes"][premise] = 1
			}

			// specific month, specific crimes
			if (mapDict[month][name]) {
				if (mapDict[month][name][crime]) {
					mapDict[month][name][crime] += 1
				} else {
					mapDict[month][name][crime] = 1
				}

			} else {
				mapDict[month][name] = {}
				mapDict[month][name][crime] = 1
			}
			if (barDict[month][crime]) {
				if (barDict[month][crime][premise]) {
					barDict[month][crime][premise] += 1
				} else {
					barDict[month][crime][premise] = 1
				}

			} else {
				barDict[month][crime] = {}
				barDict[month][crime][premise] = 1
			}
		}

		console.log(barDict)

		function handleCheckboxes() {
			let newCounts = {}
			value = this.id;

			if (value != "timecheck" && value != "timeslide") {
				if (value == "all") {
					if (document.getElementById("all").checked) {
						checkboxes = document.getElementsByTagName("input");
						for (var i = 1; i < checkboxes.length; i++) {
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

			checkboxes = document.getElementsByTagName("input");
			var crimeTypesTemp = []
			// this forloop populated crimeTypes with the crimes that are selected 
			for (var i = 0; i < checkboxes.length; i++) {
				if (checkboxes[i].id != "timecheck" && checkboxes[i].id != "timeslide" && checkboxes[i].checked)  {
					crimeTypesTemp.push(checkboxes[i].id);
				}
			}
			crimeTypes = JSON.parse(JSON.stringify(crimeTypesTemp));
			d3.selectAll(".Borough")
				.attr("fill", getMapCount);
			updateBarStats()
			updateBarChart()

			// for (var i = 0; i < crime_data.length; i++) {
			// 	if (crimeTypes.includes(crime_data[i]['offense_id'])) {
			// 		let boroughKey = newCounts[crime_data[i]["BORO_NM"]];

			// 		if (boroughKey) {
			// 			newCounts[crime_data[i]["BORO_NM"]] += 1;
			// 		} else {
			// 			newCounts[crime_data[i]["BORO_NM"]] = 1;
			// 		}
			// 	}
			// }

			// console.log("func", newCounts);

			// d3.selectAll(".Borough").attr("fill", function (d) {
			// 	return colorScale(newCounts[d.properties["BoroName"].toUpperCase()]);
			// });
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
				return getMapCount(d);
			})
			.attr("class", function (d) { return "Borough" })
			.on("mouseover", mapMouseOver)
			.on("mousemove", mapMouseMove)
			.on("mouseout", mapMouseOut);

		// Draw the legend
		legend = d3.select("#map").append("g")
			.attr("transform", "translate(500,10)")
			.call(legendColor);

		var legend = d3.legendColor()
			.scale(colorScale)
			.labelFormat(d3.format(".0f"))
			.title("Legend");

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
					document.getElementById("timeslide").disabled = true;
				} else {
					document.getElementById("range").style.opacity = "1.0";
					document.getElementById("timeslide").style.opacity = "1.0";
					document.getElementById("timeslide").disabled = false;
				}
			} else {
				document.getElementById("range").innerHTML = "Month: " + dates[value];
				inputValue = dates[value];
			}

			d3.selectAll(".Borough")
				.attr("fill", getMapCount);

			updateBarStats();
			updateBarChart();
		}

		// fetchs data based on date selections
		function getMapCount(d) {
			var name = d.properties.BoroName.toUpperCase();
			var c = 0;
			if (d3.select("#timecheck").property("checked")) {
				if (d3.select("#all").property("checked")) {
					c = mapDict["AllMonths"][name]["AllCrimes"];
				} else {
					for (var i = 0; i < crimeTypes.length; i++) {
						curr = crimeTypes[i];
						if (mapDict["AllMonths"][name][curr]) {
							c += mapDict["AllMonths"][name][curr];
						}
					}
				}
			} else {
				if (d3.select("#all").property("checked")) {
					c = mapDict[inputValue][name]["AllCrimes"];
				} else {
					for (var i = 0; i < crimeTypes.length; i++) {
						curr = crimeTypes[i];
						if (mapDict[inputValue][name][curr]) {
							c += mapDict[inputValue][name][curr];
						}
					}
				}
			}
			return colorScale(c);
		}

		function updateBarStats() {
			var premiseStats = {}; 
			var currMonth = ""	
			if (d3.select("#timecheck").property("checked")) {
				currMonth = "AllMonths";
			} else {
				currMonth = inputValue;
			}

			// handles all crimes
			if (d3.select("#all").property("checked")) {
				Object.keys(barDict[currMonth]["AllCrimes"]).forEach(function (prem) {
					if (barDict[currMonth]["AllCrimes"][prem]) {
						if (premiseStats[prem]) {
							premiseStats[prem] += barDict[currMonth]["AllCrimes"][prem];
						} else {
							premiseStats[prem] = barDict[currMonth]["AllCrimes"][prem];
						}	
					} else {
						if (premiseStats[prem]) {
							premiseStats[prem] += 0;
						} else {
							premiseStats[prem] = 0;
						}
					}
				}) 
			} else {
				for (var i = 0; i < crimeTypes.length; i++) {
					currCrime = crimeTypes[i];
					Object.keys(barDict[currMonth][currCrime]).forEach(function (prem) {
						if (barDict[currMonth][currCrime][prem]) {
							if (premiseStats[prem]) { 
								premiseStats[prem] += barDict[currMonth][currCrime][prem];
							} else {
								premiseStats[prem] = barDict[currMonth][currCrime][prem];
							}   
						} else {
							if (premiseStats[prem]) { 
								premiseStats[prem] += 0;
							} else {
								premiseStats[prem] = 0;
							}
						}
					})
				}  

			}
			
			// Create items array
			var crimes = new Array(Object.keys(premiseStats).length);
			i = 0
			Object.keys(premiseStats).forEach(function (key) {
				var value = premiseStats[key]
				crimes[i] = { "type": key, "count": value }
				i++
			})
			// sort the locations based on count, in ascending order
			crimes.sort((a, b) => (a.count > b.count) ? -1 : ((b.count > a.count) ? 1 : 0));


			sliced = crimes.slice(0,5);
			console.log(sliced.map);
			
		}

		function updateBarChart() {
			const yScale = d3.scaleLinear()
				.range([200, 0])
				.domain([0, d3.max(sliced, (d) => d.count)]);

			const xScale = d3.scaleBand()
				.range([0, 300])
				.domain(sliced.map((d) => d.type))
				.padding(0.2)

			d3.select("#yaxis")
				.transition()
				.duration(1000)
				.call(d3.axisLeft(yScale));

			d3.select("#xaxis")
				.transition()
				.duration(1000)
				.attr('transform', `translate(0, 200)`)
				.call(d3.axisBottom(xScale))
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function(d) {
					return "rotate(-65)"
				});

			d3.selectAll(".Bar")
				.data(sliced)
				.transition()
				.duration(1000)
				.attr('x', (d) => xScale(d.type))
				.attr('y', (d) => yScale(d.count))
				.attr('height', (d) => 200 - yScale(d.count))

			tooltip.style("top", (d3.event.pageY - 10) + "px")
				.style("left", (d3.event.pageX + 10) + "px")
				.data(sliced)
				.transition()
				.duration(100)
				.text( (d) => d.count + " crimes");
		}

		// bar graph setup
		const yScale = d3.scaleLinear()
			.range([200, 0])
			.domain([0, 110000]);

		updateBarStats()
		const xScale = d3.scaleBand()
			.range([0, 300])
			.domain(sliced.map((d) => d.type))
			.padding(0.2)

		const chart = d3.select("#bar").append('g')
			.attr('transform', `translate(50, 50)`);

		// y axis
		chart.append('g')
		        .attr('id', 'yaxis')
			.call(d3.axisLeft(yScale));

		// x axis
		chart.append('g')
		        .attr('id', 'xaxis')
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
			.attr('y', (d) => yScale(d.count))
			.attr('height', (d) => 200 - yScale(d.count))
			.attr('width', xScale.bandwidth())
			.attr("class", function (d) { return "Bar" })
			.on("mouseover", chartMouseOver)
			.on("mousemove", chartMouseMove)
			.on("mouseout", chartMouseOut);

	}).catch(function (err) {
		console.log(err)
	}
	) 
