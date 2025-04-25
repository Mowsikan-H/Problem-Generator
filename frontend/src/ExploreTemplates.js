import React from 'react';
import './ExploreTemplates.css';

function ExploreTemplates() {
  const templates = [
    {
      title: 'Supply Chain',
      image: '\supplychain.png',
      description: 'Optimize your supply chain operations with AI assistance'
    },
    {
      title: 'Automobile Assembly',
      image: '\carmanufacture.png',
      description: 'Streamline assembly processes with intelligent automation'
    },
    {
      title: 'Healthcare Automation',
      image: '\man-talk.png',
      description: 'Enhance patient care through AI-powered solutions'
    }
  ];

  return (
    <section className="explore-templates">
      <h2 className="explore-templates-btn">Explore Templates</h2>
      
      <div className="templates-container">
        {templates.map((template, index) => (
          <div className="template-card" key={index} style={{"--i": index}}>
            <div className="template-image">
              <img 
                src={template.image} 
                alt={template.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/300x200?text=${template.title.replace(' ', '+')}`;
                }}
              />
            </div>
            <h3 className="template-title">{template.title}</h3>
            <p className="template-description">{template.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExploreTemplates;