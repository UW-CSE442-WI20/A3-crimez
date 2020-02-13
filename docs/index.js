var width = 1200, height = 800;

var svg = d3.select("#container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);


var projection = d3.geoMercator()
	.center([-73.94, 40.70])
	.scale(80000)
	.translate([300, 300]);

var path = d3.geoPath()
	.projection(projection);

var sliced = [];
var crimeTypes = [];
var inputValue = 2009;
var allBoros = ['BROOKLYN', 'QUEENS', 'MANHATTAN', 'BRONX', 'STATEN ISLAND']

var crime_boro_data = { 'BROOKLYN': 0, 'QUEENS': 0, 'MANHATTAN': 0, 'BRONX': 0, 'STATEN ISLAND': 0 }

var sortColorRange = (data) => {
	return Object.values(data).sort((a, b) => a - b)
}

// Data and color scale
var domain = []
var data = d3.map();
var colorScale = d3.scaleThreshold()
	.range(d3.schemePurples[7]);

var legendColor = d3.legendColor()
	.labelFormat(d3.format(".0f"))
	.labels(d3.legendHelpers.thresholdLabels)
	.scale(colorScale);

var legend = d3.select("#map").append("g")
	.attr("transform", "translate(100,60)")
	.attr("class", "legend")

var boroughName = function (d) {
	d.properties.BoroName.replace(/ /g, '');
}
var locationName = function (d) {
	d.type.replace(/ /g, '');
}

var getText = function (d) {
	var name = d.properties.BoroName;
	var c = 0;
	if (d3.select("#timecheck").property("checked")) {
		if (d3.select("#all").property("checked")) {
			c = filtered["AllYears"]["AllCrimes"][name.toUpperCase()];
		} else {
			for (var i = 0; i < crimeTypes.length; i++) {
				curr = crimeTypes[i];
				if (filtered["AllYears"][curr][name.toUpperCase()]) {
					c += filtered["AllYears"][curr][name.toUpperCase()];
				}
			}
		}
	} else {
		if (d3.select("#all").property("checked")) {
			c = filtered[inputValue]["AllCrimes"][name.toUpperCase()];
		} else {
			for (var i = 0; i < crimeTypes.length; i++) {
				curr = crimeTypes[i];
				if (filtered[inputValue][curr]) {
					if (filtered[inputValue][curr][name.toUpperCase()]) {
						c += filtered[inputValue][curr][name.toUpperCase()];
					}
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
	d3.csv("./data/crime_data_0.csv"),
	d3.csv("./data/crime_data_1.csv"),
	d3.csv("./data/crime_data_2.csv"),
	d3.csv("./data/crime_data_3.csv"),
	d3.csv("./data/crime_data_4.csv"),
	d3.csv("./data/crime_data_5.csv"),
	d3.csv("./data/crime_data_6.csv"),
	d3.csv("./data/crime_data_7.csv"),
	d3.csv("./data/crime_data_8.csv"),
	d3.csv("./data/crime_data_9.csv"),
]).then(
	(data, reg) => {
		filtered = {}
		let geo_data = data[0]
		let crime_data = []
		for(var i = 1; i <= 10; i++) {
			crime_data = crime_data.concat(data[i])
		}
		
		// calculate year hash
		for (var i = 0; i < crime_data.length; i++) {
			var date = crime_data[i]["CMPLNT_FR_DT"]
			parts = [];
			if (date.includes("&")) {
				parts = date.split(" & ")
			} else {
				parts = date.split("/")
			}
			

			var year = parts[2]
			var name = [crime_data[i]["BORO_NM"]]
			var crime = crime_data[i]['offense_id'];
			var premise = crime_data[i]["PREM_TYP_DESC"];

			if (name === "" || premise === "") {
				continue;
			}
			if (year < 1990) {
				continue;
			}
			// all years all crimes
			if (filtered["AllYears"]) {
				if (filtered["AllYears"]["AllCrimes"]) {
					if (filtered["AllYears"]["AllCrimes"]["P " + premise]) {
						filtered["AllYears"]["AllCrimes"]["P " + premise] += 1
					} else {
						filtered["AllYears"]["AllCrimes"]["P " + premise] = 1
					}
					if (filtered["AllYears"]["AllCrimes"][name]) {
						filtered["AllYears"]["AllCrimes"][name] += 1
					} else {
						filtered["AllYears"]["AllCrimes"][name] = 1
					}
				} else {
					filtered["AllYears"]["AllCrimes"] = {}
					filtered["AllYears"]["AllCrimes"][name] = 1
					filtered["AllYears"]["AllCrimes"]["P " + premise] = 1
				}
			} else {
				filtered["AllYears"] = {}
				filtered["AllYears"]["AllCrimes"] = {}
				filtered["AllYears"]["AllCrimes"][name] = 1
				filtered["AllYears"]["AllCrimes"]["P " + premise] = 1
			}

			// all years specific crimes 
			if (filtered["AllYears"][crime]) {
				if (filtered["AllYears"][crime]["P " + premise]) {
					filtered["AllYears"][crime]["P " + premise] += 1
				} else {
					filtered["AllYears"][crime]["P " + premise] = 1
				}
				if (filtered["AllYears"][crime][name]) {
					filtered["AllYears"][crime][name] += 1
				} else {
					filtered["AllYears"][crime][name] = 1
				}
			} else {
				filtered["AllYears"][crime] = {}
				filtered["AllYears"][crime][name] = 1
				filtered["AllYears"][crime]["P " + premise] = 1
			}

			//specific year, all crimes 
			if (filtered[year]) {
				if (filtered[year]["AllCrimes"]) {
					if (filtered[year]["AllCrimes"]["P " + premise]) {
						filtered[year]["AllCrimes"]["P " + premise] += 1
					} else {
						filtered[year]["AllCrimes"]["P " + premise] = 1
					}
					if (filtered[year]["AllCrimes"][name]) {
						filtered[year]["AllCrimes"][name] += 1
					} else {
						filtered[year]["AllCrimes"][name] = 1
					}
				} else {
					filtered[year]["AllCrimes"] = {}
					filtered[year]["AllCrimes"]["P " + premise] = 1
					filtered[year]["AllCrimes"][name] = 1
				}
			} else {
				filtered[year] = {}
				filtered[year]["AllCrimes"] = {}
				filtered[year]["AllCrimes"]["P " + premise] = 1
				filtered[year]["AllCrimes"][name] = 1
			}

			// specific year, specific crimes
			if (filtered[year][crime]) {
				if (filtered[year][crime]["P " + premise]) {
					filtered[year][crime]["P " + premise] += 1
				} else {
					filtered[year][crime]["P " + premise] = 1
				}
				if (filtered[year][crime][name]) {
					filtered[year][crime][name] += 1
				} else {
					filtered[year][crime][name] = 1
				}
			} else {
				filtered[year][crime] = {}
				filtered[year][crime]["P " + premise] = 1
				filtered[year][crime][name] = 1
			}

		}

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

			// crimtTypes holds all the crimes that are selected 

			checkboxes = document.getElementsByTagName("input");
			var crimeTypesTemp = []
			// this forloop populated crimeTypes with the crimes that are selected 
			for (var i = 0; i < checkboxes.length; i++) {
				if (checkboxes[i].id != "timecheck" && checkboxes[i].id != "timeslide" && checkboxes[i].checked) {
					crimeTypesTemp.push(checkboxes[i].id);
				}
			}
			crimeTypes = JSON.parse(JSON.stringify(crimeTypesTemp));
			d3.selectAll(".Borough")
				.attr("fill", (d) => getMapCount(d, false));
			updateBarStats()
			updateBarChart()
			}
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
			.attr("transform", "translate(200,120)")

			// set the color of each country
			.attr("fill", function (d) {
				return getMapCount(d, false);
			})
			.attr("class", function (d) { return "Borough" })
			.on("mouseover", mapMouseOver)
			.on("mousemove", mapMouseMove)
			.on("mouseout", mapMouseOut);

		// Draw the legend
		legend = d3.select("#map").append("g")
			.attr("transform", "translate(100,60)")
			.attr("class", "legend")
			.call(legendColor);

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
				document.getElementById("range").innerHTML = "Year: " + value;
				inputValue = value;
			}

			d3.selectAll(".Borough")
				.attr("fill", (d) => getMapCount(d, true));

			updateBarStats();
			updateBarChart();
		}

		function updateDomain(sliderCheck) {
			allBoros.forEach((name) => {
				let count = 0;
				if (d3.select("#timecheck").property("checked")) {
					if (d3.select("#all").property("checked")) {
						count = filtered["AllYears"]["AllCrimes"][name];
					} else {

						for (var i = 0; i < crimeTypes.length; i++) {
							curr = crimeTypes[i];
							if (filtered["AllYears"][curr][name]) {
								count += filtered["AllYears"][curr][name];
							}
						}
					}
				} else {
					if (d3.select("#all").property("checked")) {
						count = filtered[inputValue]["AllCrimes"][name];
					} else {
						for (var i = 0; i < crimeTypes.length; i++) {
							curr = crimeTypes[i];
							if (filtered[inputValue][curr]) {
								if (filtered[inputValue][curr][name]) {
									count += filtered[inputValue][curr][name];
								}
							}
						}
					}
				}
				crime_boro_data[name] = count;
			})

			if (d3.select("#all").property("checked") && d3.select("#timecheck").property("checked")) {
				domain = [200000, 400000, 600000, 800000, 1000000, 1200000, 1400000];
			} else if (d3.select("#all").property("checked") && d3.select("#timecheck").property("checked", false)) {
				domain = [20000, 35000, 50000, 75000, 90000, 105000, 120000];
			} else if (sliderCheck) {
				domain = domain
			} else {
				sorted = sortColorRange(crime_boro_data)
				lowest = sorted[0]
				highest = sorted[4]
				if (sorted[4] == 0) {
					domain = [1, 2, 3, 4, 5, 6, 7]
				} else {
					lowest_mod = lowest % 100
					lowest = lowest - lowest_mod

					range = highest / 6
					range_mod = range % 50
					if (range_mod == range) {
						range = 100;
					} else {
					        range = range - range_mod
					}

					domain = []
					for (var i = 0; i < 7; i++) {
						domain.push(lowest + (range * i)) 
					}
				}
			}

			if (domain[4] == 0) {
				domain = [0, 1]
			}
			colorScale.domain(domain)
			legend.call(legendColor);
		}


		// fetchs data based on date selections
		function getMapCount(d, sliderCheck) {
			updateDomain(sliderCheck)
			var name = d.properties.BoroName.toUpperCase();
			var count = crime_boro_data[name]
			return colorScale(count);
		}

		function updateBarStats() {
			var premiseStats = {};
			var currYear = ""
			if (d3.select("#timecheck").property("checked")) {
				currYear = "AllYears";
			} else {
				currYear = inputValue;
			}

			// handles all crimes
			if (d3.select("#all").property("checked")) {
				Object.keys(filtered[currYear]["AllCrimes"]).forEach(function (prem) {
					premParts = prem.split(" ");
					if (prem.substring(0, 2) == "P ") {
						let location = prem.substring(2)
						if (filtered[currYear]["AllCrimes"][prem]) {
							if (premiseStats[location]) {
								premiseStats[location] += filtered[currYear]["AllCrimes"][prem];
							} else {
								premiseStats[location] = filtered[currYear]["AllCrimes"][prem];
							}
						} else {
							if (premiseStats[location]) {
								premiseStats[location] += 0;
							} else {
								premiseStats[location] = 0;
							}
						}
					}
				})
			} else {
				for (var i = 0; i < crimeTypes.length; i++) {
					currCrime = crimeTypes[i];
					if (filtered[currYear][currCrime]) {

						Object.keys(filtered[currYear][currCrime]).forEach(function (prem) {
							premParts = prem.split(" ");
							let location = prem.substring(2)
							if (prem.substring(0, 2) == "P ") {
								if (filtered[currYear][currCrime][prem]) {
									if (premiseStats[location]) {
										premiseStats[location] += filtered[currYear][currCrime][prem];
									} else {
										premiseStats[location] = filtered[currYear][currCrime][prem];
									}
								} else {
									if (premiseStats[location]) {
										premiseStats[location] += 0;
									} else {
										premiseStats[location] = 0;
									}
								}
							}
						})
					}
				}

			}

			// Create items array
			var crimes = new Array(Object.keys(premiseStats).length);
			i = 0
			Object.keys(premiseStats).forEach(function (key) {
				var value = premiseStats[key]
				if(key.includes("RESIDENCE")){
					key = key.split("-")[1].trim();

					if(key.includes("APT. HOUSE")) {
						key = "APARTMENT";
					}
				}

				crimes[i] = { "type": key, "count": value }
				i++
			})
			// sort the locations based on count, in ascending order
			crimes.sort((a, b) => (a.count > b.count) ? -1 : ((b.count > a.count) ? 1 : 0));
			if (crimes.length < 5) {
				prev = crimes.length;
				for (var i = 0; i < 5 - prev; i++) {
					crimes[i + prev] = { "type": "", "count": 0 }
				}
				sliced = crimes.slice(0, 5);
			} else {
				sliced = crimes.slice(0, 5);
			}
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
				.call(d3.axisLeft(yScale).ticks(5));

			d3.select("#xaxis")
				.transition()
				.duration(1000)
				.attr('transform', `translate(0, 200)`)
				.call(d3.axisBottom(xScale))
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function (d) {
					return "rotate(-65)"
				});

			d3.selectAll(".Bar")
				.data(sliced)
				.transition()
				.duration(1000)
				.attr('x', (d) => xScale(d.type))
				.attr('y', (d) => yScale(d.count))
				.attr('height', (d) => 200 - yScale(d.count))
				.attr('fill', "#80cbc4");

			tooltip.style("top", (d3.event.pageY - 10) + "px")
				.style("left", (d3.event.pageX + 10) + "px")
				.data(sliced)
				.transition()
				.duration(100)
				.text((d) => d.count + " crimes");
		}

		// bar graph setup
		const yScale = d3.scaleLinear()
			.range([200, 0])
			.domain([0, 1500000]);

		updateBarStats()
		const xScale = d3.scaleBand()
			.range([0, 300])
			.domain(sliced.map((d) => d.type))
			.padding(0.2)

		const chart = d3.select("#bar").append('g')
			.attr('transform', `translate(60, 60)`);

		// y axis
		chart.append('g')
			.attr('id', 'yaxis')
			.call(d3.axisLeft(yScale).ticks(5));

		// x axis
		chart.append('g')
			.attr('id', 'xaxis')
			.attr('transform', `translate(0, 200)`)
			.call(d3.axisBottom(xScale))
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function (d) {
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
			.style("fill", function (d) { return "#82ada9" })
			.on("mouseover", chartMouseOver)
			.on("mousemove", chartMouseMove)
			.on("mouseout", chartMouseOut);


	}).catch(function (err) {
		console.log(err)
	}) 
