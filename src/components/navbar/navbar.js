import React from 'react';
import {Navbar, Nav, Form, FormControl, Button, NavDropdown} from 'react-bootstrap';
import './navbar.css';

function NavigationBar() {
  return (
    <div class="nav-container">
      <h4>THE CLEVELAND CLINIC FOUNDATION</h4>
      <div class="container">
        <p>Prepare</p>
        <p>Classics</p>
        <p>Timeline</p>
        <p>Overview</p>
        <p>Ratings</p>
      </div>
    </div>
  )
}
export default NavigationBar;