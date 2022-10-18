import React, { Component, createRef } from "react";
import db from "../../fire";
import * as d3 from "d3";
import * as fc from "d3fc";
import * as fx from "money";
import "./Candlestick.css";
import { formatLargeNumber } from "../../utils/formatLargeNumber";

class CandleChart extends Component {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.state = {
      timeFrame: new Date("2020-10-01"),
      focusedData: {},
    };
  }

  changeTimeFrame = () => {
    this.setState(
      {
        timeFrame: new Date("2021-01-01"),
      },
      () => {
        this.drawChart();
      }
    );
  };

  getFillColor = (d) => {
    // .attr('fill', d => (d.Open === d.Close ? "white" : (d.Open > d.Close) ? "red" : "green"))
    return d.Open === d.Close ? "white" : d.Open > d.Close ? "red" : "green";
  };

  drawChart = () => {
    /**
     * GRAPH MARGINS AND DIMS
     */
    const margin = {
      top: 40,
      right: 80,
      bottom: 50,
      left: 20,
    };

    const graphDimensions = {
      width: 1481 - margin.right - margin.left,
      height: 575 - margin.top - margin.bottom,
    };
    const dateFormatter = d3.timeFormat("%m/%d/%Y");

    const svgDimensions = {
      width: graphDimensions.width + margin.right + margin.left,
      height: graphDimensions.height + margin.top + margin.left,
    };
    const tooltip = d3
      .select(".chart_title")
      .append("div")
      .attr("class", "stock_tooltip");
    const lowPriceContainer = tooltip
      .append("div")
      .attr("id", "value_container");
    const lowPriceLabel = lowPriceContainer
      .append("span")
      .attr("id", "low_price_label")
      .text("L: ");
    const highPriceContainer = tooltip
      .append("div")
      .attr("id", "value_container");
    const highPriceLabel = highPriceContainer
      .append("span")
      .attr("id", "high_price_label")
      .text("H: ");
    const openPriceContainer = tooltip
      .append("div")
      .attr("id", "value_container");
    const openPriceLabel = openPriceContainer
      .append("span")
      .attr("id", "open_price_label")
      .text("O: ");
    const closePriceContainer = tooltip
      .append("div")
      .attr("id", "value_container");
    const closePriceLabel = closePriceContainer
      .append("span")
      .attr("id", "close_price_label")
      .text("C: ");
    const volumeContainer = tooltip.append("div").attr("id", "value_container");
    const volumeLabel = volumeContainer
      .append("span")
      .attr("id", "volume_label")
      .text("V: ");
    const dateContainer = tooltip.append("div").attr("id", "value_container");
    const dateLabel = dateContainer
      .append("span")
      .attr("id", "date_label")
      .text("D: ");
    const svg = d3
      .select(this.ref.current)
      .append("svg")
      .attr("class", "svg")
      .attr("width", svgDimensions.width)
      .attr("height", svgDimensions.height)
      .attr("fill", "blue");

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
    // const x = d3.scaleLinear().range([0, graphDimensions.width])
    const x = d3.scaleTime();

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
    const removeWeekends = (d) => ![0, 6].includes(d.Date);

    const candleTween = (d) => {
      const min = Math.min(d.Open, d.Close);
      const max = Math.max(d.Open, d.Close);
      var i = d3.interpolate(d.Open, d.Close);
      return function (t) {
        d.Close = i(t);
        return y(d);
      };
    };
    const getTimeFrame = () => {
      return this.state.timeFrame;
    };

    const yExtent = fc
      .extentLinear()
      .pad([0.1, 0.1])
      .accessors([(d) => d.High, (d) => d.Low]);
    const volumeExtent = fc
      .extentLinear()
      .include([0])
      .pad([0, 2])
      .accessors([(d) => d.Volume]);
    const yVolumeScale = d3.scaleLinear().range([graphDimensions.height, 0]);
    const update = (data) => {
      const yMinVolume = d3.min(data, (d) => {
        return Math.min(d.Volume);
      });
      // const yMaxVolume = d3.max(data, d=> {
      //   return Math.max(d.Volume) + 10000
      // })
      const yMaxVolume = 25000000;
      yVolumeScale.domain([yMinVolume, yMaxVolume]);
      //create extent component so we can know the extent of volumes

      const volumeDomain = volumeExtent(data);
      const volumeToPriceScale = d3
        .scaleLinear()
        .domain(volumeDomain)
        .range(yExtent(data));
      const volumeSeries = fc
        .seriesSvgBar()
        .bandwidth(2)
        .crossValue((d) => new Date(d.Date))
        .mainValue((d) => volumeToPriceScale(d.Volume))
        .decorate((sel) =>
          sel
            .enter()
            .classed("volume", true)
            .attr("fill", (d) => (d.open > d.close ? "red" : "green"))
        );
      // svg.append(volumeSeries)

      x.range(
        d3.range(0, graphDimensions.width, graphDimensions.width / data.length)
      );
      // data = data.sort(function(a,b) {
      //   return new Date(a.Date) - new Date(b.Date)
      // });
      const bisectDate = d3.bisector(function (d) {
        return new Date(d.Date);
      }).left;

      let line = svg
        .append("line")
        .attr("x1", 50)
        .attr("x2", 50)
        .attr("y1", 10)
        .attr("y2", graphDimensions.height + margin.bottom / 2)
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1);
      let lowPriceValue = lowPriceContainer
        .append("span")
        .attr("id", "low_price_value");
      let highPriceValue = highPriceContainer
        .append("span")
        .attr("id", "high_price_value");
      let openPriceValue = openPriceContainer
        .append("span")
        .attr("id", "open_price_value");
      let closePriceValue = closePriceContainer
        .append("span")
        .attr("id", "close_price_value");
      let volumeValue = volumeContainer
        .append("span")
        .attr("id", "volume_value");
      let dateValue = dateContainer.append("span").attr("id", "date_value");

      const mousemove = (e) => {
        let x0 = x.invert(d3.pointer(e)[0]);
        let i = bisectDate(data, x0);
        let d0 = data[i - 1];
        let d1 = data[i];
        let d;
        if (!d1) {
          d = d0;
        } else {
          d = x0 - new Date(d0.Date) > new Date(d1.Date) - x0 ? d1 : d0;
        }
        line.attr("transform", `translate(${x(new Date(d.Date)) + 25}, 0)`);
        lowPriceValue.text(`$${d.Low.toFixed(2)}`);
        highPriceValue.text(`$${d.High.toFixed(2)}`);
        openPriceValue.text(`$${d.Open.toFixed(2)}`);
        closePriceValue.text(`$${d.Close.toFixed(2)}`);
        volumeValue
          .style("color", this.getFillColor(d))
          .text(`${formatLargeNumber(d.Volume)}`);
        dateValue.text(dateFormatter(new Date(d.Date)));
      };

      // Create overlay rect to serve as event listener
      graph
        .append("rect")
        .attr("class", "overlay")
        .attr("width", graphDimensions.width)
        .attr("height", graphDimensions.height)
        .on("mousover", function () {
          d3.select(this).style("background", "blue");
          // line.style('display', 'inline-block')
        })
        // .on('mouseout', function() {line.style('display', 'none')})
        .on("mousemove", mousemove);
      const xScale = d3
        .scaleBand()
        .domain(
          d3.utcDay
            .range(
              new Date(data[0].Date),
              new Date(+data[data.length - 1].Date) + 1
            )
            .filter(
              (d) =>
                new Date(d.Date).getUTCDay() != 0 &&
                new Date(d.Date).getUTCDay() != 6
            )
        )
        .range([0, graphDimensions.width]);

      const yMin = d3.min(data.map((d) => d.Low)) - 5;
      const yMax = d3.max(data.map((d) => d.High));
      // x.domain(d3.extent(data, d=>{return new Date(d.Date)}))
      x.domain(data.map((d) => new Date(d.Date)));
      y.domain([yMin - 50, yMax])
        .range([graphDimensions.height, 0])
        .nice();

      let dates = data.map((d) => d.Date);

      const xDateScale = d3
        .scaleQuantize()
        .domain([0, dates.length])
        .range(dates);
      const xBand = d3
        .scaleBand()
        .domain(d3.range(-1, dates.length))
        .range([0, graphDimensions.width])
        .padding(0.3);

      fx.base = "USD";
      fx.rates = {
        IRP: 0.014,
        USD: 1,
      };
      // graph.selectAll('g').data(data).join('g')
      //   .attr('transform', d => `translate(${x(new Date(d.Date)), 0})`)
      // graph.append('line').data(data)
      //   .attr('y1', d=>y(d.Low))
      let volumeBars = graph
        .selectAll(".volume")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(new Date(d.Date)))
        .attr("class", "volume")
        .attr("width", 10)
        .attr("height", 0)
        // .attr('y', y + height)
        .attr(
          "y",
          (d, i) =>
            yVolumeScale(d.Volume) / 4 +
            (graphDimensions.height + 50 - yVolumeScale(d.Volume / 4))
        )
        .attr("fill", (d) => this.getFillColor(d))
        .attr("transform", `translate(0, 333)`)
        .transition("volume-transition")
        .duration(1250)
        .attr(
          "height",
          (d) => graphDimensions.height + 50 - yVolumeScale(d.Volume / 4)
        )
        .attr("y", (d, i) => yVolumeScale(d.Volume) / 4);

      let candles = graph
        .selectAll(".candle")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(new Date(d.Date)))
        .attr("class", "candle")
        .style("pointer-events", "none")
        .attr("y", (d) => y(Math.max(d.Open, d.Close)))
        .attr("width", 9)
        .attr("height", 0)
        .transition("candle-transition")
        .duration(1250)
        .attr("height", (d) =>
          d.Open === d.Close
            ? 1
            : y(Math.min(d.Open, d.Close)) - y(Math.max(d.Open, d.Close))
        )
        .attr("fill", (d) =>
          d.Open === d.Close ? "white" : d.Open > d.Close ? "red" : "green"
        );

      let stems = graph
        .selectAll("g.line")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "stem")
        .attr("x1", (d, i) => x(new Date(d.Date)) + 4.5)
        .attr("x2", (d, i) => x(new Date(d.Date)) + 4.5)
        // .attr('y1', d => y(d.High))
        // .attr('y2', d => y(d.Low))
        .attr("y1", (d) => y(d.High))
        .attr("y2", (d) => y(d.High))
        .transition("stem-transition")
        .duration(1250)
        .attr("y2", (d) => y(d.Low))
        .attr("stroke", (d) =>
          d.Open === d.Close ? "white" : d.Open > d.Close ? "red" : "green"
        )
        .attr("stroke-width", 3);

      const xAxis = d3
        .axisBottom(x)
        .ticks(6)
        .tickFormat(d3.timeFormat("%b '%y"));
      const yAxis = d3.axisLeft(y).ticks(10);
      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);
    };
    var data = [];
    db.collection("nvda-prices").onSnapshot((res) => {
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
  };

  componentDidMount = () => {
    this.drawChart();
  };

  render() {
    return (
      <div ref={this.ref} class="canvas">
        <div id="stock_heading">
          <h3 class="chart_title">NVIDIA (NVDA) Stock Prices (6M)</h3>
        </div>
      </div>
    );
  }
}

export default CandleChart;
