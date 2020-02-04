var width = 960, height = 500;

svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");

d3.json("./data/boroughs.geojson", function (error, nyb) {
	if (error) return console.log(error)
	console.log(nyb)

	var projection = d3.geo.mercator()
		.center([-73.94, 40.70])
		.scale(50000)
		.translate([(width) / 2, (height) / 2]);

	var path = d3.geo.path()
		.projection(projection);

	var g = svg.append("g").attr("id", "boroughs");

	g.append("g")
		.selectAll(".state")
		.data(nyb.features)
		.enter().append("path")
		.attr("class", function (d) { return d.properties.name; })
		.attr("d", path)
		.on("mouseover", function(d){
			console.log(d)
			tooltip.style("visibility", "visible");
		})
		.on("mousemove", function(d){
			tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px")
			       .text(d.properties.BoroName);
		})
		.on("mouseout", function(){
			tooltip.style("visibility", "hidden");
		});

});
