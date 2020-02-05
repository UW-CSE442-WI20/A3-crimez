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
	.range(d3.schemeBlues[5]);

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

Promise.all([
	d3.json("./data/boroughs.geojson"),	
	d3.csv("./data/nyc_crimez_filtered.csv"),
	// d3.json("https://data.cityofnewyork.us/resource/5uac-w243.json"),
]).then(
	function ready(topo, reg) {
		console.log(topo[1][0]);
	//   Draw the map
	  svg.append("g")
	    .selectAll("path")
	    .data(topo[0].features)
	    .enter()
	    .append("path")
	      // draw each country
	      .attr("d", d3.geoPath()
	        .projection(projection)
		  )
	
	      // set the color of each country
	      .attr("fill", function (d) {
			  //TODO: group by borough and count number of reports 
			  counts = {}
			  for(var i = 0; i < topo[1].length; i++){
	
				 if (counts[topo[1][i]["BORO_NM"]]) {
					counts[topo[1][i]["BORO_NM"]] += 1
				 } else{
					counts[topo[1][i]["BORO_NM"]] = 1
				 }
			  }
	
			  console.log(counts);
			  console.log(d.properties.BoroName.toUpperCase());
	        // d.total = data.get(d.id) || 0;
	        return colorScale(counts[d.properties.BoroName.toUpperCase()]);
		  })
		  .on("mouseover", function (d) {
			  tooltip.style("visibility", "visible");
		  });
	}).catch(function(err){
			console.log(err)
		}
	) 


// Load external data and boot
// d3.queue()
//   .defer(d3.json, "./data/boroughs.geojson")
//   .defer(d3.json, "https://data.cityofnewyork.us/resource/5uac-w243.json")
//   .await(ready);

// function ready(error, topo, reg) {

// 	console.log(reg);
//   // Draw the map
//   svg.append("g")
//     .selectAll("path")
//     .data(topo.features)
//     .enter()
//     .append("path")
//       // draw each country
//       .attr("d", d3.geoPath()
//         .projection(projection)
// 	  )

//       // set the color of each country
//       .attr("fill", function (d) {
// 		  //TODO: group by borough and count number of reports 
// 		  counts = {}
// 		  for(var i = 0; i < reg.length; i++){

// 			 if (counts[reg[i].boro_nm]) {
// 				counts[reg[i].boro_nm] += 1
// 			 } else{
// 				counts[reg[i].boro_nm] = 1
// 			 }
// 		  }

// 		  console.log(counts);
//         // d.total = data.get(d.id) || 0;
//         return colorScale(d.properties.BoroCode);
//       });
//     }

//WHAT d RETURNS
// type: "Feature"
// id: 4
// properties:
// BoroCode: 2
// BoroName: "Bronx"
// Shape_Leng: 464517.89055
// Shape_Area: 1186804144.79
// __proto__: Object
// geometry: {type: "MultiPolygon", coordinates: Array(24)}


// svg = d3.select("body").append("svg")
// 	.attr("width", width)
// 	.attr("height", height);

// var tooltip = d3.select("body")
// 	.append("div")
// 	.style("position", "absolute")
// 	.style("z-index", "10")
// 	.style("visibility", "hidden");

// color = d3.scaleQuantize([1, 10], d3.schemeBlues[9])

// d3.json("./data/boroughs.geojson", function (error, nyb) {
// 	if (error) return console.log(error)
// 	console.log(nyb)

// 	var projection = d3.geo.mercator()
// 		.center([-73.94, 40.70])
// 		.scale(50000)
// 		.translate([(width) / 2, (height) / 2]);

// 	var path = d3.geo.path()
// 		.projection(projection);

// 	var g = svg.append("g").attr("id", "boroughs");

// 	g.append("g")
// 		.selectAll(".state")
// 		.data(nyb.features)
// 		.enter().append("path")
// 		.attr("class", function (d) { return d.properties.BoroName; })
// 		.attr("d", path)
// 		.on("mouseover", function (d) {
// 			console.log(d)
// 			tooltip.style("visibility", "visible");
// 		})
// 		.on("mousemove", function (d) {
// 			d3.select(this).style("fill", "orange")
// 			tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px")
// 				.text(d.properties.BoroName);
// 		})
// 		.on("mouseout", function () {
// 			d3.select(this).style("fill", "steelblue")
// 			tooltip.style("visibility", "hidden");

// 		});

// });
