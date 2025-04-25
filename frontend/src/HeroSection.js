import React, { useEffect, useRef } from 'react';
import './HeroSection.css';
import { useNavigate } from "react-router-dom";

function HeroSection({ onLoginClick, onSignupClick, onGetStartedClick }) {
  const heroSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const heroSection = heroSectionRef.current;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroSection.getBoundingClientRect();

      // Normalize mouse position to the center of the screen
      const x = (clientX - left - width / 2) / (width / 2);
      const y = (clientY - top - height / 2) / (height / 2);

      // Apply animations based on mouse position
      heroSection.style.setProperty('--mouse-x', x);
      heroSection.style.setProperty('--mouse-y', y);
    };

    heroSection.addEventListener('mousemove', handleMouseMove);

    return () => {
      heroSection.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-section" ref={heroSectionRef}>
      <div className="header-container">
        <div className="logo">Problemogram</div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate("/blog")}>Problem HUB</button>
          <button className="nav-btn" onClick={() => navigate("/pricing")}>Pricing</button>
          <button className="nav-btn">Problem Generator</button>
        </div>
        <div className="auth-buttons">
          <button className="login-btn-hero" onClick={onLoginClick}>Login</button>
          <button className="signup-btn-hero" onClick={onSignupClick}>Signup</button>
        </div>
      </div>
      
      <h1 className="hero-title">Your AI Powered Idea Assistant</h1>
      <p className="hero-subtitle">A tool that helps you shape your ideas, plan your projects, and accelerate your startup journey</p>
      
      <div className="lightbulb-container">
        <div className="lightbulb">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Light rays */}
            <g className="rays">
              <line x1="100" y1="10" x2="100" y2="40" stroke="#FFD700" strokeWidth="4" />
              <line x1="40" y1="60" x2="60" y2="80" stroke="#FFD700" strokeWidth="4" />
              <line x1="20" y1="120" x2="50" y2="120" stroke="#FFD700" strokeWidth="4" />
              <line x1="40" y1="180" x2="60" y2="160" stroke="#FFD700" strokeWidth="4" />
              <line x1="160" y1="60" x2="140" y2="80" stroke="#FFD700" strokeWidth="4" />
              <line x1="180" y1="120" x2="150" y2="120" stroke="#FFD700" strokeWidth="4" />
              <line x1="160" y1="180" x2="140" y2="160" stroke="#FFD700" strokeWidth="4" />
            </g>
            
            {/* Bulb */}
            <circle cx="100" cy="100" r="40" fill="#FEF600" />
            <path d="M80 140 L80 160 L120 160 L120 140 Z" fill="#000" />
            
            {/* Filament */}
            <path d="M90 105 L95 100 L100 105 L105 100 L110 105" stroke="#000" strokeWidth="2" fill="none" />
            
            {/* Base */}
            <rect x="85" y="160" width="30" height="5" fill="#000" />
            <rect x="85" y="165" width="30" height="5" fill="#000" />
            <rect x="85" y="170" width="30" height="5" fill="#000" />
          </svg>
        </div>
      </div>
      
      <div className="cta-buttons">
        <button className="get-started-btn" onClick={onGetStartedClick}>Get Started</button>
        
      </div>
    </div>
  );
}

export default HeroSection;