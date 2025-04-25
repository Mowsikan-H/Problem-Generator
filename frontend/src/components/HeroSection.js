import React from 'react';
import '../styles/HeroSection.css';
import lightbulbIcon from '../assets/lightbulb.svg';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <h1 className="hero-title">Your AI Powered Problem Generator</h1>
      <p className="hero-description">
        A tool that helps you identify challenges, generate problem statements, and accelerate
        your solution development journey
      </p>
      
      <div className="icon-container">
        <img src={lightbulbIcon} alt="Lightbulb icon" className="lightbulb-icon" />
      </div>
      
      <button className="get-started-btn">Get Started</button>
    </div>
  );
};

export default HeroSection;