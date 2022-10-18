import React from 'react';
import Card from 'react-bootstrap/Card';
import './account-summary.css'


function AccountSummary() {

  return (
    <div className="account_summary_div">
      <div className="account_summary_card">
        <h3 className="card_title">The Cleveland Clinic Foundation</h3>
        <div className="address">
          <p id="address_label">Address</p>
          <p id="address_value">345 Main Street, Anywhere, NY 11111</p>
        </div>
        <div className="account_info_container">
          <div className="account_history" id="left_side_history">
            <div className="call_history_container">
              <section>
                <p id="address_label">My last call</p>
                <p id="address_value">October 3rd</p>
              </section>
              <section id="team_last_call_section">
                <p id="address_label">Team Last Call</p>
                <p id="address_value">October 10th</p>
              </section>
            </div>
            <div>
              <section>
                <p id="address_label">Last Call Notes</p>
                <p id="address_value">Requested samples. Need details on efficiency</p>
              </section>
            </div>
          </div>
          <div className="account_history">
            <section>
              <p id="address_label">Account Notes</p>
              <p id="address_value">blah blah blah blah blah blah</p>
            </section>
            <section>
              <p id="address_label">Next Call Notes</p>
              <p id="address_value">Discuss administration instructions with Susan (Nurse).</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AccountSummary;