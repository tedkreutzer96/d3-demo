import React, {Component} from 'react';

import LineChart from '../line-chart/LineGraph';
import CandleChart from '../candlestick-chart/Candlestick';

import './ChartController.css'

class ChartController extends Component {
  constructor(props) {
    super(props)
    this.state = {
      chartSelected: "BTC"
    }
  }
  changeChart = (chart) => {
    this.setState({
      chartSelected: chart
    })
  }

  render() {
    return (
      <div class="canvas" id="chart_selector_canvas">
          <span class="selector_buttons">
          <button onClick={() => this.changeChart("BTC")}>BTC</button>
          <button onClick={() => this.changeChart("NVDA")}>NVDA</button>
          </span>
          {this.state.chartSelected === "BTC" ? (
            <LineChart/>
          ) : (
            // null
            <CandleChart/>
          )}
      </div>
    )
  }



}
export default ChartController;