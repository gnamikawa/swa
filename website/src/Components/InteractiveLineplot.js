import React from 'react';
import * as d3 from "d3";
import PropTypes from 'prop-types';

class InteractiveLineplot extends React.Component {

    static propTypes = {
        id: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }

    static defaultProps = {
        id: ""
    }

    state = {
    }

    style = {
        line: {
            fill: "none",
            stroke: "steelblue",
            strokeWidth: "1.5px"
        },
        zoom: {
            cursor: "move",
            fill: "none",
            pointerEvents: "all"
        }

    }

    componentDidMount() {// set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //Read the data
        d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

        // When reading the csv, I must format variables:
        function(d){
            return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
        },

        // Now I can use this dataset:
        function(data) {

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ]);
            xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.value; })])
            .range([ height, 0 ]);
            yAxis = svg.append("g")
            .call(d3.axisLeft(y));

            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width )
                .attr("height", height )
                .attr("x", 0)
                .attr("y", 0);

            // Add brushing
            var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
                .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

            // Create the area variable: where both the area and the brush take place
            var area = svg.append('g')
            .attr("clip-path", "url(#clip)")

            // Create an area generator
            var areaGenerator = d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y(0))
            .y1(function(d) { return y(d.value) })

            // Add the area
            area.append("path")
            .datum(data)
            .attr("class", "myArea")  // I add the class myArea to be able to modify it later on.
            .attr("fill", "#69b3a2")
            .attr("fill-opacity", .3)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", areaGenerator )

            // Add the brushing
            area
            .append("g")
                .attr("class", "brush")
                .call(brush);

            // A function that set idleTimeOut to null
            var idleTimeout
            function idled() { idleTimeout = null; }

            // A function that update the chart for given boundaries
            function updateChart() {

            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain([ 4,8])
            }else{
                x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
                area.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and area position
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
            area
                .select('.myArea')
                .transition()
                .duration(1000)
                .attr("d", areaGenerator)
            }

            // If user double click, reinitialize the chart
            svg.on("dblclick",function(){
            x.domain(d3.extent(data, function(d) { return d.date; }))
            xAxis.transition().call(d3.axisBottom(x))
            area
                .select('.myArea')
                .transition()
                .attr("d", areaGenerator)
            });

        })
    }
    
    render() {
        return (
            <div id="my_dataviz"></div>
        )
    }
}
            
export default InteractiveLineplot;
            
