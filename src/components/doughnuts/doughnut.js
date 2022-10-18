import React, { Component, useEffect } from "react";
import * as d3 from "d3";
import db from "../../fire";
import "./doughnut.css";
import { legendColor } from "d3-svg-legend";

class Doughnut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songStats: [],
    };
  }

  fetchData = async () => {
    // const songStatRes = db.collection('song-stats');
    // const data = await songStatRes.get();
    // const songStats = [];
    // data.docs.forEach(item => {
    //   var joined = this.state.songStats.concat(item.data());
    //   songStats.push(item.data())
    // })
    // this.setState({songs: songStats})
    // this.drawDoughnut(songStats);
    // const songStatRes = db.collection('venue-stats');
    // const data = await songStatRes.get();
    // const songStats = [];
    // data.docs.forEach(item => {
    //   var joined = this.state.songStats.concat(item.data());
    //   songStats.push(item.data())
    // })
    // this.setState({songs: songStats})
    this.drawDoughnut();
  };

  drawDoughnut = () => {
    const d4 = Object.assign(
      {},
      {
        d3,
        legendColor,
      }
    );
    let currValueToShow = "";
    let currVenueToShow = "";
    let currExpansion = {};
    const dims = { height: 300, width: 400, radius: 90 }; //setup chart dimensions
    const center = { x: dims.width / 2 + 50, y: dims.height / 2 + 50 }; //setup chart center
    const svg = d3
      .select(".canvas") //create svg container
      .append("svg") //append svg to selection
      .attr("width", dims.width + 150)
      .attr("height", dims.height + 150);
    const graph = svg
      .append("g") //create group for graph elements
      .attr("transform", `translate(${center.x}, ${center.y})`); //translate so graph will be centered in SVG

    // .attr('x', dims.width/2 + 50)
    // .attr('y', center.y)

    const pie = d3
      .pie() //generate angles for slices in the pie chart!
      .sort(null) //dont sort
      .value((d) => d.shows);
    const angles = pie(songStats);

    const arcPath = d3
      .arc()
      .outerRadius(dims.radius) //specify outer radius (at what point do we want arcs to come out from center)
      .innerRadius(dims.radius / 2); //tells arc generator where inside of pie chart should be

    const bigArcPath = d3
      .arc()
      .outerRadius(dims.radius * 1.1)
      .innerRadius(dims.radius / 2);

    const colorRange = d3.scaleOrdinal(d3["schemeSet3"]); //create ordinal scale
    /**
     * Arc Enter Tween (Transition)
     */
    const arcTween = (d) => {
      var i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

      return function (t) {
        //update value of startAngle over time
        d.startAngle = i(t);

        //now, return value for path
        return arcPath(d);
      };
    };

    /**
     * Legend Setup
     * - call legend in update function!!
     */
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${dims.width - 40}, 90)`)
      .style("font-size", "12px");

    const legend = d4
      .legendColor()
      .shape("circle") //what kind of shape should legend be? (each item in legend will have this shape next to it)
      .shapePadding(10)
      .scale(colorRange); //match item names to the color in the colorRange

    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    const update = (data) => {
      colorRange.domain(data.map((d) => d.venue));

      legendGroup.call(legend);
      legendGroup.selectAll("circle").attr("stroke", "#000");
      //join enhanced (pie) data to path elements
      const paths = graph.selectAll("path").data(pie(data));

      paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", (d) => colorRange(d.data.venue)) //takes data of current element being appended (DATA IS AFTER BEING PASSED THROUGH PIE GENERATOR), pass data into color scale
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
      //add events
      graph
        .data(pie(data))
        .append("text")
        .attr("id", "selectedShowCount")
        .style("width", dims.width)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(currValueToShow);
      graph
        .append("text")
        .attr("id", "selectedVenue")
        .style("width", dims.width)
        .attr("dy", "7.35em")
        .attr("text-anchor", "middle")
        .text(currVenueToShow);

      graph
        .selectAll("path")
        .on("click", function (event, d) {
          currValueToShow = d.data.shows;
          currVenueToShow = d.data.venue;
          d3.select("#selectedShowCount").text(d.data.shows);
          d3.select("#selectedVenue").text(d.data.venue);
          d3.select(this)
            .transition("changeSliceSize")
            .duration(200)
            .attr("d", bigArcPath);
        })
        .on("mouseout", function (d, i, n) {
          d3.select(this)
            .transition("changeSliceSize")
            .duration(500)
            .attr("d", arcPath);
          //   div.transition('tooltipTransition').duration(200)
          //     .style('opacity', 0)
        });
    };
    const handleMouseOver = (d, i, n) => {
      d3.select(this).transition().duration(500).attr("d", bigArcPath);
    };
    var data = [];
    db.collection("venue-stats").onSnapshot((res) => {
      res.docChanges().forEach((change) => {
        const doc = { ...change.doc.data(), id: change.doc.id };
        //find type of change and move forward accordingly
        switch (change.type) {
          case "added":
            data.push(doc);
            break;
          case "modified":
            //find index of item to be updated in data
            const index = data.findIndex((item) => item.id === doc.id);
            data[index] = doc;
            break;
          case "removed":
            data = data.filter((item) => item.id !== doc.id);
            break;
          default:
            break;
        }
      });
      update(data);
    });
  };

  componentDidMount() {
    this.fetchData();
  }
  render() {
    return <div className="canvas"></div>;
  }
}

export default Doughnut;
