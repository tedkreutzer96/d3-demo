import React, { Component, useEffect, createRef } from "react";
import * as d3 from "d3";
import db from "../../fire";
import "./Pie.css";
import { legendColor } from "d3-svg-legend";

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
    db.collection(this.props.collection).onSnapshot((res) => {
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
    const d4 = Object.assign(
      {},
      {
        d3,
        legendColor,
      }
    );
    // this.drawChart(this.props.data)
    const dataset = this.props.data;
    const dims = { height: 200, width: 420, radius: 90 };
    const center = { x: dims.width / 2 - 0, y: dims.height / 2 - 20 };
    const node = this.node;
    const svg = d3
      .select(this.ref.current)
      .append("svg")
      .attr("id", `retail-sales-svg-${this.props.index}`)
      .attr("width", dims.width)
      .attr("height", dims.height + 50);

    const graph = svg
      .append("g")
      .attr("transform", `translate(${center.x}, ${center.y + 25})`); //translate so graph will be centered in SVG

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.sales);

    const arcPath = d3
      .arc()
      .outerRadius(dims.radius * 0.9)
      .innerRadius(dims.radius * 0.75);

    const bigArcPath = d3
      .arc()
      .outerRadius(dims.radius)
      .innerRadius(dims.radius * 0.75);

    const colors = d3.scaleOrdinal(["#0f0", "#f00"]);
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${dims.width - 80}, 50)`)
      .style("font-size", "12px");

    const legend = d4
      .legendColor()
      .shape("circle")
      .shapePadding(10)
      .scale(colors);

    const selectedTween = (d) => {
      var i = d3.interpolate(d.innerRadius, d.outerRadius);
      return function (t) {
        d.innerRadius = i(t);
        return bigArcPath(d);
      };
    };
    const unselectTween = (d) => {
      var i = d3.interpolate(d.innerRadius, d.outerRadius);
      // return function(t) {
      //   d.outerRadius = i(t);
      //   return arcPath(d)
      // }
      return function (t) {
        var r = i(t),
          arc = d3.arc().outerRadius(d.outerRadius).innerRadius(d.innerRadius); //<-- create arc
        d.outerRadius = i(t);
        return arcPath(d); //<-- return arc path
      };
    };
    const arcTween = (d) => {
      var i = d3.interpolate(d.endAngle - 0.1, d.startAngle);
      return function (t) {
        //update value of startAngle over time
        d.startAngle = i(t);

        //now, return value for path
        return arcPath(d);
      };
    };
    const handleArcClick = (d, i) => {
      d3.select(d).transition().duration(750).attrTween("d", bigArcPath);
    };
    let selectedDataPoint = {};
    const update = (data) => {
      colors.domain(data.map((d) => d.type));
      legendGroup.call(legend);
      const paths = graph.selectAll(`path`).data(pie(data));
      paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .classed("unselected", true)
        .attr("id", `retail-sales-path-${this.props.index}`)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", (d) => colors(d.data.type))
        .on("click", handleArcClick)
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
      graph.selectAll("path").on("click", function (event, d) {
        selectedDataPoint = d3.select(this).data()[0];
        var selected = graph.selectAll(".selected");
        var unselected = graph.selectAll(".unselected");
        if (d3.select(this).classed("selected")) {
          d3.select(this)
            .classed("selected", false)
            .classed("unselected", true)
            .transition("selectSlice")
            .duration(200)
            .attrTween("d", selectedTween);
        } else {
          selected.each(function (d, i, n) {
            d3.select(this)
              .classed("unselected", true)
              .classed("selected", false)
              .transition("unselectSlice")
              .duration(200)
              .attr("d", arcPath);
          });
        }
        // oneBar.classed("my-selector", !oneBar.classed("my-selector"));
        d3.select(this)
          .classed("selected", !d3.select(this).classed("selected"))
          .classed("unselected", !d3.select(this).classed("unselected"))
          .transition("changeSliceSize")
          .duration(200)
          .attr("d", bigArcPath);
        update(data);
      });
      graph.selectAll("text").remove();

      graph
        .append("text")
        .attr("id", "selected-slice-value")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", getTextColor(data, selectedDataPoint))
        .text(
          selectedDataPoint.data ? `${selectedDataPoint?.data?.sales}%` : null
        );
      graph
        .append("text")
        .attr("id", "selected-slice-value")
        .style("font-size", 12)
        .attr("dy", "3.55em")
        .attr("text-anchor", "middle")
        .text(
          selectedDataPoint.data ? `${selectedDataPoint?.data?.type}` : null
        );
    };
    const getTextColor = (data) => {
      var maxCategorySales = Math.max.apply(
        Math,
        data.map(function (o) {
          return o.sales;
        })
      );

      var maxCategory = data.reduce(function (a, b) {
        if (+a.sales > +b.sales) {
          return a;
        } else {
          return b;
        }
      });

      if (selectedDataPoint.data?.sales < maxCategory.sales) {
        return "red";
      } else {
        return "green";
      }
    };

    var data = [];
    if (this.props.collection) {
      db.collection(this.props.collection).onSnapshot((res) => {
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
  }

  render() {
    return (
      <div className={`retail-sales-container-${this.props.index}`}>
        {this.props.collection && this.props.cardTitle ? (
          <div class="retail-sales-canvas" ref={this.ref}>
            <section>
              <h5 id="chart_descriptor">{this.props.cardTitle}</h5>
              <span id="account_descriptor">NUCALA ONLY</span>
            </section>
          </div>
        ) : null}
      </div>
    );
  }
}
export default Pie;
