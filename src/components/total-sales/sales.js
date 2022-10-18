import React, {Component} from 'react';
import './sales.css'


class Sales extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="total_sales_container">
        <section className="total_sales_card_title">
          <h5>Total Sales ($)</h5>
          <p>RETAIL & NON-RETAIL</p>
        </section>
        <section id="total_sales_value">
          <span>$</span><span>21,345</span>
        </section>
        <section id="total_sales_change"><span id="total_sales_percent_value">4</span><span id="total_sales_sign">%</span></section>
      </div>
    )
  }
}
export default Sales;