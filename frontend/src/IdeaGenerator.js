// Combined IdeaGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IdeaGenerator.css';

// Add Gemini API constants at the top level
const GEMINI_API_KEY = 'AIzaSyAUYr1XUV6xqmIzw1oBalNPdW3iP9sJSf4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

const steps = [
  'subdomain',
  'technologies',
  'business_model',
  'target_audience',
  'market_segment'
];

const IdeaGenerator = () => {
  const [currentView, setCurrentView] = useState('form');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);

  const [formData, setFormData] = useState({
    focus: '',
    main_industry: '',
    subdomain: '',
    technologies: '',
    business_model: '',
    target_audience: '',
    market_segment: ''
  });

  const [focusOptions, setFocusOptions] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [options, setOptions] = useState({
    subdomain: [],
    technologies: [],
    business_model: [],
    target_audience: [],
    market_segment: []
  });

  // Default options for dropdowns in case API fails
  const defaultOptions = {
    industries: ['Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Manufacturing', 'Entertainment'],
    subdomain: ['Software Development', 'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'Data Science'],
    technologies: ['Global', 'North America', 'Europe', 'Asia', 'Africa', 'South America', 'Australia'],
    business_model: ['End Users', 'Businesses', 'Developers', 'Government', 'Healthcare Providers', 'Students'],
    target_audience: ['Immediate', 'High', 'Medium', 'Low'],
    market_segment: ['High', 'Medium', 'Low']
  };

  useEffect(() => {
    // Log to check if this effect is running
    console.log('Fetching industries...');
    
    fetch('http://localhost:8000/api/industries/')
      .then(res => res.json())
      .then(data => {
        console.log('Industries fetched:', data.industries);
        setIndustries(data.industries || defaultOptions.industries);
      })
      .catch(err => {
        console.error('Error fetching industries:', err);
        console.log('Using default industries');
        setIndustries(defaultOptions.industries);
      });

    fetch('http://localhost:8000/api/focus-options/')
      .then(res => res.json())
      .then(data => setFocusOptions(data.focus_options))
      .catch(err => {
        console.error('Error fetching focus options:', err);
        setFocusOptions(['AI Hallucinations', 'Data Privacy', 'User Experience', 'System Performance']);
      });
  }, []);

  useEffect(() => {
    if (!formData.main_industry) return;

    const fetchCategories = async () => {
      const updatedOptions = {};
      for (const category of steps) {
        try {
          const res = await fetch(`http://localhost:8000/api/industry/${formData.main_industry}/${category}/`);
          const data = await res.json();
          updatedOptions[category] = data[category] || defaultOptions[category] || [];
        } catch (err) {
          console.error(`Error fetching ${category}:`, err);
          updatedOptions[category] = defaultOptions[category] || [];
        }
      }
      setOptions(updatedOptions);
    };

    fetchCategories();
  }, [formData.main_industry]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'main_industry' ? {
        subdomain: '',
        technologies: '',
        business_model: '',
        target_audience: '',
        market_segment: ''
      } : {})
    }));
  };

  const isFormValid = () => formData.focus && formData.main_industry && formData.technologies;

  const handleGenerateIdeas = async (count) => {
    if (!isFormValid()) return;

    setIsGeneratingIdeas(true);
    setSelectedProblem(null); // Reset selected problem

    const prompt = `Act as a problem-explaining consultant and elaborate on the given problem statement from the user input. Your task is to break down the problem into its key components without providing any solutions. You will need to: 
    Clearly define the problem statement in detail. 
    
    Give the problem statement in 5 to 6 lines only*

    Problem details:
    - Focus: ${formData.focus}
    - Main Industry: ${formData.main_industry}
    - Subdomain: ${formData.subdomain}
    - Technologies: ${formData.technologies}
    - Business Model: ${formData.business_model}
    - Target Audience: ${formData.target_audience}
    - Market Segment: ${formData.market_segment}`;

    try {
      // Using Gemini API
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract text from Gemini response
      const rawText = response.data.candidates[0].content.parts[0].text.trim();

      // Format the response into sections
      const sections = rawText.split('\n\n');
      const problemTitle = `Problem Analysis: ${formData.focus}`;
      
      const idea = {
        title: problemTitle,
        description: sections[0] || rawText,
        details: sections.slice(1) || []
      };

      setGeneratedIdeas([idea]);
      setCurrentView('results');

      // Save to backend
      await fetch('http://localhost:8000/api/save_full_idea/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          generated_ideas: rawText,
        })
      });
      
    } catch (error) {
      console.error('Error generating problem analysis:', error);
      
      // Create fallback data to display in case the API call fails
      const fallbackIdea = {
        title: `Problem Analysis: ${formData.focus}`,
        description: `This is a detailed analysis of the problem "${formData.focus}" in the ${formData.main_industry} industry, specifically within the ${formData.subdomain} subdomain. The issue primarily affects ${formData.business_model} stakeholders in ${formData.technologies} regions. Given the ${formData.target_audience} urgency level and ${formData.market_segment} priority, this problem requires careful consideration of its scope and impact.`,
        details: [
          `The problem exists within a complex ecosystem involving multiple stakeholders and technical considerations.`,
          `Addressing this issue will require a thorough understanding of both the technical and business implications.`
        ]
      };
      
      setGeneratedIdeas([fallbackIdea]);
      setCurrentView('results');
      alert('Failed to generate problem analysis using AI. Showing simplified version instead.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const renderFormInputs = () => (
    <div className="form-center-panel">
      <h3>Describe the problem in One Sentence:</h3>
      <div className="input-container">
        <input 
          type="text" 
          value={formData.focus} 
          onChange={e => handleInputChange('focus', e.target.value)}
          placeholder="Enter your problem description (e.g., AI Hallucinations in LLMs)"
          className="problem-input"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <h3>Select the affected Domain</h3>
          <div className="select-container">
            <select 
              value={formData.main_industry} 
              onChange={e => handleInputChange('main_industry', e.target.value)}
              className="form-select"
            >
              <option value="" disabled>Select industry</option>
              {industries.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="form-group">
          <h3>Select the Sub-Domain</h3>
          <div className="select-container">
            <select value={formData.subdomain} onChange={e => handleInputChange('subdomain', e.target.value)}>
              <option value="" disabled>Select sub-domain</option>
              {options.subdomain.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <h3>Select the affected Location</h3>
          <div className="select-container">
            <select value={formData.technologies} onChange={e => handleInputChange('technologies', e.target.value)}>
              <option value="" disabled>Select location</option>
              {options.technologies.length > 0 ? 
                options.technologies.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                )) : 
                defaultOptions.technologies.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))
              }
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="form-group">
          <h3>Select the affected Stakeholders</h3>
          <div className="select-container">
            <select value={formData.business_model} onChange={e => handleInputChange('business_model', e.target.value)}>
              <option value="" disabled>Select stakeholders</option>
              {options.business_model.length > 0 ? 
                options.business_model.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                )) : 
                defaultOptions.business_model.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))
              }
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <h3>Select the Urgency Level</h3>
          <div className="select-container">
            <select value={formData.target_audience} onChange={e => handleInputChange('target_audience', e.target.value)}>
              <option value="" disabled>Select urgency</option>
              {options.target_audience.length > 0 ? 
                options.target_audience.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                )) : 
                defaultOptions.target_audience.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))
              }
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="form-group">
          <h3>Select the Priority Level</h3>
          <div className="select-container">
            <select value={formData.market_segment} onChange={e => handleInputChange('market_segment', e.target.value)}>
              <option value="" disabled>Select priority</option>
              {options.market_segment.length > 0 ? 
                options.market_segment.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                )) : 
                defaultOptions.market_segment.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))
              }
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>
      </div>

      <div className="generate-buttons">
        <button className={`generate-btn ${!isFormValid() ? 'disabled' : ''}`} onClick={() => handleGenerateIdeas(5)} disabled={!isFormValid() || isGeneratingIdeas}>
          {isGeneratingIdeas ? 'Generating...' : 'Generate Problem Statement'}
        </button>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="sidebar-panel">
      <div className="sidebar-logo">YAIIA <span className="logo-dot">•</span></div>
      
      <nav className="sidebar-nav">
        <ul className="nav-links-IG">
          <li className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </li>
          <li className="nav-item">
            <span className="nav-icon">💡</span>
            <span className="nav-text">Generate Ideas</span>
          </li>
          <li className="nav-item">
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Saved Ideas</span>
          </li>
          <li className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Account Settings</span>
          </li>
        </ul>
      </nav>
      
      <div className="user-info">
        <div className="user-avatar">👤</div>
        <div className="user-details">
          <div className="user-name">Guest User</div>
          <div className="user-plan">Free Plan</div>
        </div>
      </div>
      
      <div className="pro-upgrade">
        <button className="upgrade-button">
          <span className="upgrade-icon">⚡</span>
          <span>Upgrade to Pro</span>
        </button>
      </div>
    </div>
  );

  const renderIdeasPanel = () => (
    <div className="ideas-panel">
      {generatedIdeas.length > 0 ? (
        <div className="problem-analysis">
          <h2>Problem Analysis</h2>
          
          {generatedIdeas.map((idea, index) => (
            <div key={index} className="analysis-card">
              <h3>{idea.title}</h3>
              <div className="analysis-section">
                <h4>Problem Definition:</h4>
                <p>{idea.description}</p>
              </div>
              
              {idea.details.map((detail, idx) => (
                <div key={idx} className="analysis-section">
                  <p>{detail}</p>
                </div>
              ))}
              
              <div className="analysis-footer">
                <p><strong>Domain:</strong> {formData.main_industry} / {formData.subdomain}</p>
                <p><strong>Stakeholders:</strong> {formData.business_model}</p>
                <p><strong>Location:</strong> {formData.technologies}</p>
                <p><strong>Urgency:</strong> {formData.target_audience}</p>
                <p><strong>Priority:</strong> {formData.market_segment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <h3>Problem Analysis will appear here</h3>
          <p>Fill out the form and click "Generate Problem Statement" to get started.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="idea-generator-container">
      <div className="three-panel-layout">
        {renderSidebar()}
        <div className="main-content">
          <div className="content-panels">
            <div className="center-panel">{renderFormInputs()}</div>
            <div className="right-panel">{renderIdeasPanel()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;
