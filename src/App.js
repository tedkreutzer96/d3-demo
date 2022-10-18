import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import NavigationBar from "./components/navbar/navbar";
import AccountSummary from "./components/account-summary/account-summary";
import Sales from "./components/total-sales/sales";
import Doughnut from "./components/doughnuts/doughnut";
import Pie from "./components/PieCharts/Pie";
import db from "./fire";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songStats: [],
      retailData: [],
      lhoData: [],
    };
  }

  fetchData = async () => {
    const songStatRes = db.collection("song-stats");
    const songData = await songStatRes.get();
    const songStats = [];
    songData.docs.forEach((item) => {
      var joined = this.state.songStats.concat(item.data());
      this.setState({
        songStats: joined,
      });
    });

    const retailSalesRes = db.collection("retail-sales");
    const data = await retailSalesRes.get();
    var retailData = [];
    data.docs.forEach((doc) => {
      var joined = this.state.retailData.concat(doc.data());
      this.setState({
        retailData: joined,
      });
    });
  };

  render() {
    return (
      <div className="App">
        <NavigationBar />
        <div className="summary_and_options">
          <AccountSummary />
          <Sales />
          <div class="doughnut-1"></div>
          <div>
            <Doughnut />
            <Pie index={1} />
            <Doughnut />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
