import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h1>PROBLEM GENERATOR</h1>
      </div>
      <div className="nav-links">
        <a href="#blog">Blog</a>
        <a href="#pricing">Pricing</a>
        <a href="#generator">Generator</a>
      </div>
      <div className="auth-buttons">
        <button className="login-btn">Login</button>
        <button className="signup-btn">Signup</button>
      </div>
    </nav>
  );
};

export default Navbar;