import React from 'react';
import './HowItWorks.css';

function HowItWorks() {
  const steps = [
    {
      icon: "/definerole.png",
      title: "Define Your Role"
    },
    {
      icon: "/industryfocus.png",
      title: "Industry and Sub-Industry Focus"
    },
    {
      icon: "/detailedquestion.png",
      title: "Detailed Questions"
    },
    {
      icon: "/airecomendation.png",
      title: "AI Recommendations"
    }
  ];

  return (
    <section className="how-it-works">
      <div className="title-container">
        <h2 className="section-button">How It Works?</h2>
      </div>
      
      <div className="steps-container">
        {steps.map((step, index) => (
          <div className="step" key={index}>
            <div className="step-icon">
              <img src={step.icon} alt={step.title} />
            </div>
            <p className="step-text">{step.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;