const margin = 60;
const width = 1000 - 2 * margin;
const height = 600 - 2 * margin;

const svg = d3.select('svg');

const chart = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 100]);

chart.append('g')
    .call(d3.axisLeft(yScale));

const xScale = d3.scaleBand()
    .range([0, width])
    .domain(sample.map((s) => s.language))
    .padding(0.2)

chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

// var svg_width = 600;
// var svg_height = 400;
// var svg = d3.select('svg')
//     .attr("width", svg_width)
//     .attr("height", svg_height)
//     .attr("class", "bar-chart");


// var dataset = [10, 50, 100, 140, 120, 20, 0, 170, 180];
// var barPadding = 5;
// var barWidth = (svg_width / dataset.length);
// svg.selectAll("rect")
//     .data(dataset)
//     .enter()
//     .append("rect")
//     .attr("y", function (d) {
//         return svg_width - d
//     })
//     .attr("height", function (d) {
//         return d;
//     })
//     .attr("width", barWidth - barPadding)
//     .attr("transform", function (d, i) {
//         var translate = [barWidth * i, 0];
//         return "translate(" + translate + ")";
//     });

// d3.select('body').append(svg);