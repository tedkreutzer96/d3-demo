import React, { Component, useEffect, createRef } from "react";
import * as d3 from "d3";
import db from "../../fire";
import "./Pie.css";

class Pie extends Component {
  constructor(props) {
    super(props);
    this.ref = createRef();
  }
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }

  drawChart = (dataset) => {
    const dims = { height: 200, width: 390, radius: 90 };
    const center = { x: dims.width / 2 - 30, y: dims.height / 2 - 20 };
    const node = this.node;
    const svg = d3
      .select(".retail-sales-canvas")
      .append("svg")
      .attr("id", `retail-sales-svg-${this.props.index}`)
      .attr("width", dims.width)
      .attr("height", dims.height + 50);

    const graph = svg
      .append("g")
      .attr("id", `retail-sales-graph-${this.props.index}`)
      .attr("transform", `translate(${center.x}, ${center.y + 25})`); //translate so graph will be centered in SVG

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.sales);

    const arcPath = d3
      .arc()
      .outerRadius(dims.radius)
      .innerRadius(dims.radius * 0.75);

    const colors = d3.scaleOrdinal(["#0f0", "#f00"]);
    const arcTween = (d) => {
      var i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

      return function (t) {
        //update value of startAngle over time
        d.startAngle = i(t);

        //now, return value for path
        return arcPath(d);
      };
    };
    const update = (data) => {
      const paths = graph
        .selectAll(`#retail-sales-path-${this.props.index}`)
        .data(pie(data));
      paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("id", `retail-sales-path-${this.props.index}`)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", (d) => colors(d.data.type))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
      //add tween here

      graph
        .data(pie(data))
        .append("text")
        .attr("id", "selected-slice-value")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text("65%");
    };

    var data = [];
    db.collection("retail-sales").onSnapshot((res) => {
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
    // this.drawChart(this.props.data)
    const dataset = this.props.data;
    const dims = { height: 200, width: 390, radius: 90 };
    const center = { x: dims.width / 2 - 30, y: dims.height / 2 - 20 };
    const node = this.node;
    const svg = d3
      .select(".retail-sales-canvas")
      .append("svg")
      .attr("id", `retail-sales-svg-${this.props.index}`)
      .attr("width", dims.width)
      .attr("height", dims.height + 50);

    const graph = svg
      .append("g")
      .attr("id", `retail-sales-graph-${this.props.index}`)
      .attr("transform", `translate(${center.x}, ${center.y + 25})`); //translate so graph will be centered in SVG

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.sales);

    const arcPath = d3
      .arc()
      .outerRadius(dims.radius)
      .innerRadius(dims.radius * 0.75);

    const colors = d3.scaleOrdinal(["#0f0", "#f00"]);
    const arcTween = (d) => {
      var i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

      return function (t) {
        //update value of startAngle over time
        d.startAngle = i(t);

        //now, return value for path
        return arcPath(d);
      };
    };
    const update = (data) => {
      const paths = graph
        .selectAll(`#retail-sales-path-${this.props.index}`)
        .data(pie(data));
      paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("id", `retail-sales-path-${this.props.index}`)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", (d) => colors(d.data.type))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
      //add tween here

      graph
        .data(pie(data))
        .append("text")
        .attr("id", "selected-slice-value")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text("65%");
    };

    var data = [];
    db.collection("retail-sales").onSnapshot((res) => {
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
  }

  render() {
    return (
      <div className={`retail-sales-container-${this.props.index}`}>
        <svg ref={this.ref} />
      </div>
    );
  }
}
export default Pie;
