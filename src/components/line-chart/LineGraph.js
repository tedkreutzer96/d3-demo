import React, { Component, createRef } from "react";
import db from "../../fire";
import * as d3 from "d3";
import * as fx from "money";

import "./LineGraph.css";

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.ref = createRef();
  }

  componentDidMount() {
    /**
     * GRAPH MARGINS AND DIMS
     */
    const margin = {
      top: 80,
      right: 80,
      bottom: 50,
      left: 20,
    };

    const graphDimensions = {
      width: 1481 - margin.right - margin.left,
      height: 575 - margin.top - margin.bottom,
    };

    const svgDimensions = {
      width: graphDimensions.width + margin.right + margin.left,
      height: graphDimensions.height + margin.top + margin.left,
    };

    const svg = d3
      .select(this.ref.current)
      .append("svg")
      .attr("class", "svg")
      .attr("width", svgDimensions.width)
      .attr("height", svgDimensions.height);

    //create group for graph elements
    const graph = svg
      .append("g")
      .attr("width", graphDimensions.width)
      .attr("height", graphDimensions.height)
      .attr("transform", `translate(${margin.left + 50}, ${margin.top})`);

    /**
     *    SCALES
     *  -- set domain of scales in UPDATE() function
     */
    const x = d3.scaleTime().range([0, graphDimensions.width]);
    const y = d3.scaleLinear().range([graphDimensions.height, 0]);

    /**
     *    AXES GROUPS
     */
    const xAxisGroup = graph
      .append("g") //'g' contains our axis shapes
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${graphDimensions.height - 20})`);
    const yAxisGroup = graph
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, -20)`);

    /**
     * @CREATE LINE PATH GENERATOR
     */
    const line = d3
      .line()
      .x(function (d) {
        //looks at where x coord should be
        return x(new Date(d.Date));
      })
      .y(function (d) {
        return y(d.Open * 0.014);
      });
    const area = d3
      .area()
      .x(function (d) {
        return x(new Date(d.Date));
      })
      .y1(function (d) {
        return y(d.Open * 0.014);
      })
      .y0(graphDimensions.height);

    //LINE PATH ELEMENTS
    const path = graph.append("path");

    var tooltip = d3
      .select(this.ref.current)
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    const update = (data) => {
      const yMax = d3.max(data.map((d) => d.Open * 0.014));

      fx.base = "USD";
      fx.rates = {
        IRP: 0.014,
        USD: 1,
      };

      var focus = svg
        .append("g")
        .attr("class", "focus")
        .style("display", "none");

      focus.append("circle").attr("r", 4);

      var tooltipDate = tooltip.append("h4").attr("class", "tooltip-date");

      var tooltipHigh = tooltip
        .append("p")
        .attr("class", "tooltip-high")
        .text("High: ");
      var tooltipLow = tooltip
        .append("p")
        .attr("class", "tooltip-low")
        .text("Low: ");
      var tooltipVolume = tooltip
        .append("p")
        .attr("class", "tooltip-volume")
        .text("Vol: ");

      var tooltipHighValue = tooltipHigh
        .append("span")
        .attr("class", "tooltip-high-value");
      var tooltipLowValue = tooltipLow
        .append("span")
        .attr("class", "tooltip-low-value");
      var tooltipVolumeValue = tooltipVolume
        .append("span")
        .attr("class", "tooltip-volume-value");
      const bisectDate = d3.bisector(function (d) {
        return new Date(d.Date);
      }).left;
      const dateFormatter = d3.timeFormat("%b %_d,  %Y");
      const formatLargeNumber = (num) => {
        return Math.abs(Number(num)) >= 1.0e9
          ? "$" + (Math.abs(Number(num)) / 1.0e12).toFixed(2) + "T"
          : Math.abs(Number(num)) >= 1.0e9
          ? (Math.abs(Number(num)) / 1.0e9).toFixed(2) + "B"
          : // Six Zeroes for Millions
          Math.abs(Number(num)) >= 1.0e6
          ? Math.abs(Number(num)) / 1.0e6 + "M"
          : // Three Zeroes for Thousands
          Math.abs(Number(num)) >= 1.0e3
          ? Math.abs(Number(num)) / 1.0e3 + "K"
          : Math.abs(Number(num));
      };
      const mousemove = (e) => {
        var x0 = x.invert(d3.pointer(e)[0]);
        var i = bisectDate(data, x0, 1);
        var d0 = data[i - 1];
        var d1 = data[i];
        var d = x0 - new Date(d0.Date) > new Date(d1.Date) - x0 ? d1 : d0;
        focus.attr(
          "transform",
          `translate(${x(new Date(d.Date)) + 70}, ${
            y(d.Open * 0.014) + margin.top - 18
          })`
        );
        if (d0.Open * 0.014 > 45000) {
          tooltip.attr(
            "style",
            `left: ${x(new Date(d.Date)) - 150}px; top: ${
              y(d.Open * 0.014) + 150
            }px`
          );
        } else {
          tooltip.attr(
            "style",
            `left: ${x(new Date(d.Date)) + 150}px; top: ${
              y(d.Open * 0.014) - 150
            }px`
          );
        }

        // tooltip.attr('style', `left: ${x(new Date(d.Date)) - 150}px; top: ${e.pageY}px`)
        tooltip.select(".tooltip-date").text(dateFormatter(new Date(d.Date)));
        tooltip
          .select(".tooltip-high-value")
          .text(`$${Number(Math.round(d.High * 0.014)).toLocaleString()}`);
        tooltip
          .select(".tooltip-low-value")
          .text(`$${Number(Math.round(d.Low * 0.014)).toLocaleString()}`);
        tooltip
          .select(".tooltip-volume-value")
          .text(formatLargeNumber(Math.round(d.Volume)));
      };
      graph
        .append("rect")
        .attr("class", "overlay")
        .attr("width", graphDimensions.width)
        .attr("height", graphDimensions.height)
        .on("mouseover", function () {
          focus.style("display", null);
          tooltip.style("display", "none");
        })
        .on("mouseout", function () {
          focus.style("display", "none");
          tooltip.style("display", "none");
        })
        .on("mousemove", mousemove);

      /**
       * @DATA SORTING
       */
      data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      /**
       * @SET DOMAINS OF SCALES
       */
      x.domain(
        d3.extent(data, (d) => {
          return new Date(d.Date);
        })
      );
      y.domain([0, d3.max(data, (d) => Math.round(d.Open * 0.014))]);

      /**
       * @UPDATE PATH DATA
       */
      // svg.append('path')
      //   .data([data])
      //   .attr('class', 'area')
      //   .attr('d', area)

      var gradient = graph
        .append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#00d2ff")
        .attr("stop-opacity", 1);
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3a47d5")
        .attr("stop-opacity", 1);

      path
        .data([data])
        // .attr('class', 'area')
        // .attr('fill', 'url(#gradient)')
        // .attr('fill', 'linear-gradient(90deg, #0700b8 0%, #00ff88 100%);')
        .attr("fill", "url(#gradient)")
        .attr("d", area)
        .attr("transform", "translate(0, -20)");
      const totalLength = path.node().getTotalLength();
      // path
      //   .attr('stroke-dasharray', totalLength + " "+ totalLength)
      //   .attr('stroke-dashoffset', totalLength)
      //   .transition('bitcoin-chart-transition')
      //     .duration(1000)
      //     .ease(d3.easeLinear)
      //     .attr('stroke-dashoffset', 0)
      /**
       * @CREATE AXES
       */
      const xAxis = d3
        .axisBottom(x)
        .ticks(15)
        .tickFormat(d3.timeFormat("%b '%y"));
      const yAxis = d3.axisLeft(y).ticks(10);

      /**
       * @CALL AXES TO DRAW
       */
      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);

      /**
       * @ROTATE AXIS TEXT
       */
      xAxisGroup
        .selectAll("text")
        .attr("transform", `rotate(40)`)
        .attr("text-anchor", "start");

      /**
       * @CREATE CIRCLES FOR DATA POINTS
       */
      // const circles = graph.selectAll('circle')
      //   .data(data)

      // circles.enter()
      //   .append('circle')
      //     .attr('r', 1)
      //     .attr('cx', d => x(new Date(d.Date)))      //Want to return value passed through X SCALE!
      //     .attr('cy', d => y(d.Open*.014))
      //     .attr('fill', 'none')
    };
    var data = [];
    db.collection("bitcoin-prices").onSnapshot((res) => {
      res.docChanges().forEach((change) => {
        const doc = { ...change.doc.data(), id: change.doc.id };
        switch (change.type) {
          case "added":
            data.push(doc);
            break;
          case "modified":
            const index = data.findIndex((item) => item.id === doc.id);
            data[index] = doc;
            break;
          case "removed":
            data = data.filter((item) => item.id != doc.id);
            break;
          default:
            break;
        }
      });
      if (data) {
        update(data);
      }
    });
  }

  render() {
    return (
      <div ref={this.ref} class="canvas">
        <h3 class="chart_title">BITCOIN Prices (Sept. '19 - May '21)</h3>
        {/* BITCOIN PRICES */}
      </div>
    );
  }
}

export default LineChart;
