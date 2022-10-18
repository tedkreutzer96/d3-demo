// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import 'bootstrap/dist/css/bootstrap.min.css';

// ReactDOM.render(
//     <App />,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import Pie from './components/PieCharts/Pie'
import db from './fire';
import NavigationBar from './components/navbar/navbar';
import AccountSummary from './components/account-summary/account-summary';
import Sales from './components/total-sales/sales';
import LineChart from './components/line-chart/LineGraph';
import CandleChart from './components/candlestick-chart/Candlestick';
import ChartController from './components/chart-controller/ChartController'
import './index.css'

function App() {

  return (
    <div className="App">
      <NavigationBar/>
      <div class = "summary_and_options">
          <div class="account_information">
            <AccountSummary/>
            <Sales/>
          </div>
          <div class = "chart_area">
            <Pie 
              collection={"retail-sales"}
              cardTitle={"Retail vs. Non-Retail"}
            />
            <Pie 
              collection={"lyo-aha"}
              cardTitle={"LYO vs. AHA"}
            />
            <Pie 
              collection={"retail-sales"}
              cardTitle={"Retail vs. Non-Retail"}
            />
          </div>
          {/* <div class="chart_area">
            <LineChart/>
          </div> */}
          {/* <div class="chart_area">
            <CandleChart/>
          </div> */}
          <div class="chart_area">
            <ChartController/>
          </div>
          
          
        </div>
        <div/>
      
    </div>
  )
}


const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
