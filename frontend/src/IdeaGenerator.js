import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IdeaGenerator.css';

const API_BASE_URL = 'http://localhost:8000/api';

const IdeaGenerator = () => {
  // Main state
  const [formData, setFormData] = useState({
    focus: '',
    main_industry: '',
    subdomain: '',
    target_audience: '',
    Location: '',
    Urgency: '',
    Priority: '',
    sublocation: ''
  });
  
  const [loading, setLoading] = useState({
    data: true,
    generation: false,
    saving: false
  });
  
  const [dropdownOptions, setDropdownOptions] = useState({
    industries: [],
    subdomain: [],
    target_audience: [],
    Location: [],
    Urgency: [],
    Priority: []
  });
  
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [error, setError] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [customLocationDetail, setCustomLocationDetail] = useState('');

  // Get the authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Create auth header configuration
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch subdomain and target audience when industry changes
  useEffect(() => {
    if (formData.main_industry) {
      fetchIndustrySpecificData();
    }
  }, [formData.main_industry]);

  const fetchInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, data: true }));
      setError(null);
      
      const endpoints = [
        { key: 'industries', path: '/industries/' },
        { key: 'Priority', path: '/priorities/' },
        { key: 'Urgency', path: '/urgencies/' },
        { key: 'Location', path: '/affectedscope/' }
      ];
      
      const results = await Promise.all(
        endpoints.map(async ({ key, path }) => {
          try {
            const response = await axios.get(`${API_BASE_URL}${path}`, {
              headers: getAuthHeaders()
            });
            
            // Handle the varying response structures
            let values;
            if (key === 'industries') values = response.data.industries || [];
            else if (key === 'Priority') values = response.data.priorities || [];
            else if (key === 'Urgency') values = response.data.urgencies || [];
            else if (key === 'Location') values = response.data.affectedscope || [];
            
            return { key, values };
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            return { key, values: [] };
          }
        })
      );
      
      const newOptions = { ...dropdownOptions };
      results.forEach(({ key, values }) => {
        newOptions[key] = values;
      });
      
      setDropdownOptions(newOptions);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load dropdown options. Please refresh the page.');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  const fetchIndustrySpecificData = async () => {
    try {
      setError(null);
      const categories = ['subdomain', 'target_audience'];
      const newOptions = { ...dropdownOptions };
      
      await Promise.all(
        categories.map(async (category) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/industry/${formData.main_industry}/${category}/`,
              { headers: getAuthHeaders() }
            );
            newOptions[category] = response.data[category] || [];
          } catch (err) {
            console.error(`Error fetching ${category}:`, err);
            newOptions[category] = [];
          }
        })
      );
      
      setDropdownOptions(newOptions);
    } catch (error) {
      console.error('Error fetching industry-specific data:', error);
    }
  };

  const fetchLocationDetails = async (locationType) => {
    if (['National', 'Regional', 'Continental'].includes(locationType)) {
      try {
        const url = `${API_BASE_URL}/${locationType.toLowerCase()}/`;
        const response = await axios.get(url, {
          headers: getAuthHeaders()
        });
        
        let data = [];
  
        // Safely extract array based on expected server response structure
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.national)) {
          data = response.data.national;
        } else if (Array.isArray(response.data.regional)) {
          data = response.data.regional;
        } else if (Array.isArray(response.data.continental)) {
          data = response.data.continental;
        } else if (Array.isArray(response.data.results)) {
          data = response.data.results;
        }
  
        setLocationDetails(data);
        setCustomLocationDetail('');
        
      } catch (error) {
        console.error(`Error fetching ${locationType} data:`, error);
        setLocationDetails([]);
      }
    } else {
      setLocationDetails([]);
    }
  };
  

  // Form handling
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when industry changes
      if (field === 'main_industry') {
        newData.subdomain = '';
        newData.target_audience = '';
      }

      if (field === 'Location') {
        fetchLocationDetails(value);
        newData.sublocation = '';
      }
      
      return newData;
    });
  };

  const isFormValid = () => {
    const { focus, main_industry, subdomain } = formData;
    return focus.trim() !== '' && main_industry !== '' && subdomain !== '';
  };

  // Idea generation
  const handleGenerateIdeas = async () => {
    try {
      setLoading(prev => ({ ...prev, generation: true }));
      setError(null);
      
      const prompt = buildPrompt();

      const payload = {
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates startup problems based on user input.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await axios.post(
        `${API_BASE_URL}/generate-ideas/`, 
        payload,
        { 
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          } 
        }
      );

      const generatedContent = response.data.choices?.[0]?.message?.content;
      
      if (generatedContent) {
        setGeneratedIdea({
          title: formData.focus,
          description: generatedContent,
          metadata: {
            domain: formData.main_industry,
            subdomain: formData.subdomain,
            target_audience: formData.target_audience || 'Not specified',
            location: formData.Location || 'Not specified',
            urgency: formData.Urgency || 'Not specified', 
            priority: formData.Priority || 'Not specified'
          }
        });
      } else {
        setError('No idea generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to generate ideas. Please try again.');
      }
    } finally {
      setLoading(prev => ({ ...prev, generation: false }));
    }
  };

  const buildPrompt = () => {
    const locationInfo = formData.sublocation || customLocationDetail;
    const locationDetail = locationInfo ? ` (${locationInfo})` : '';
    
    return `
      Act as a problem-solving consultant and create a structured problem statement from the following user input.
      Your task is to clearly define the problem in one line, identify the primary domain and sub-domain, 
      specify the relevant stakeholders, and determine the urgency and priority of the issue. 
      Ensure that the problem statement is concise, actionable, and well-defined to facilitate effective solutions.

      Problem Statement: A clear, one-sentence description of the core problem ${formData.focus}
      Primary Domain: The broader area where the problem exists ${formData.main_industry}
      Sub-Domain: More specific area within the primary domain ${formData.subdomain}
      Stakeholders: The key people or organizations impacted by or involved in the problem ${formData.target_audience || 'Not specified'}
      Location: ${formData.Location}${locationDetail || 'Not specified'}
      Urgency: How urgent the problem is, in terms of time sensitivity ${formData.Urgency || 'Not specified'}
      Priority: The level of importance or focus the problem should ${formData.Priority || 'Not specified'}
    `;
  };

  const handleSaveIdea = async () => {
    if (!generatedIdea) return;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setError(null);
      
      const locationDetail = formData.sublocation || customLocationDetail;
      
      const payload = {
        focus: formData.focus,
        main_industry: formData.main_industry,
        subdomain: formData.subdomain,
        target_Audience: formData.target_audience,
        Location: formData.Location,
        location_detail: locationDetail,
        Urgency: formData.Urgency,
        Priority: formData.Priority,
        generated_ideas: generatedIdea.description,
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/save_full_idea/`, 
        payload,
        { 
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          } 
        }
      );
  
      console.log('Save successful', response.data);
      alert('Problem saved successfully!');
  
    } catch (error) {
      console.error('Error saving idea:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to save idea. Please try again.');
      }
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Component Renderers
  const Sidebar = () => (
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

  const SelectField = ({ label, value, onChange, options, placeholder, disabled }) => (
    <div className="form-group">
      <h3>{label}</h3>
      <div className="select-container">
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={disabled ? 'disabled' : ''}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>
    </div>
  );

  const LocationDetailField = () => (
    <div className="form-group">
      <h3>Specify Location Details</h3>
      {['National', 'Regional', 'Continental'].includes(formData.Location) ? (
        <div className="select-container">
          <select
            value={formData.sublocation}
            onChange={e => setFormData(prev => ({ ...prev, sublocation: e.target.value }))}
          >
            <option value="">Select an option</option>
            {locationDetails.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
          <span className="select-arrow">▼</span>
        </div>
      ) : (
        <div className="input-container">
          <input
            type="text"
            value={customLocationDetail}
            onChange={e => setCustomLocationDetail(e.target.value)}
            placeholder="Enter location details"
          />
        </div>
      )}
    </div>
  );

  const FormPanel = () => (
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
        <SelectField 
          label="Select the affected Domain"
          value={formData.main_industry}
          onChange={value => handleInputChange('main_industry', value)}
          options={dropdownOptions.industries}
          placeholder="Select industry"
          disabled={loading.data}
        />

        <SelectField 
          label="Select the Sub-Domain"
          value={formData.subdomain}
          onChange={value => handleInputChange('subdomain', value)}
          options={dropdownOptions.subdomain}
          placeholder="Select sub-domain"
          disabled={!formData.main_industry || loading.data}
        />
      </div>

      <div className="form-row">
        <SelectField 
          label="Select the Affected Stakeholders"
          value={formData.target_audience}
          onChange={value => handleInputChange('target_audience', value)}
          options={dropdownOptions.target_audience}
          placeholder="Select audience"
          disabled={!formData.main_industry || loading.data}
        />

        <SelectField 
          label="Select the affected Location"
          value={formData.Location}
          onChange={value => handleInputChange('Location', value)}
          options={dropdownOptions.Location}
          placeholder="Select location"
          disabled={loading.data}
        />
      </div>

      <LocationDetailField />

      <div className="form-row">
        <SelectField 
          label="Select the Urgency Level"
          value={formData.Urgency}
          onChange={value => handleInputChange('Urgency', value)}
          options={dropdownOptions.Urgency}
          placeholder="Select urgency"
          disabled={loading.data}
        />

        <SelectField 
          label="Select the Priority Level"
          value={formData.Priority}
          onChange={value => handleInputChange('Priority', value)}
          options={dropdownOptions.Priority}
          placeholder="Select priority"
          disabled={loading.data}
        />
      </div>

      <div className="generate-buttons">
        <button 
          className={`generate-btn ${!isFormValid() ? 'disabled' : ''}`} 
          onClick={handleGenerateIdeas} 
          disabled={!isFormValid() || loading.generation}
        >
          {loading.generation ? 'Generating...' : 'Generate Solution'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const IdeasPanel = () => (
    <div className="ideas-panel">
      {generatedIdea ? (
        <div className="problem-analysis">
          <h2>Problem Analysis</h2>
          <div className="analysis-card">
            <h3>{generatedIdea.title}</h3>
            <div className="analysis-section">
              <h4>Problem Definition:</h4>
              <p>{generatedIdea.description}</p>
            </div>
            
            <div className="analysis-footer">
              <p><strong>Domain:</strong> {generatedIdea.metadata.domain} / {generatedIdea.metadata.subdomain}</p>
              <p><strong>Target Audience:</strong> {generatedIdea.metadata.target_audience}</p>
              <p><strong>Affected Location:</strong> {generatedIdea.metadata.location} {formData.sublocation || customLocationDetail ? `(${formData.sublocation || customLocationDetail})` : ''}</p>
              <p><strong>Urgency Level:</strong> {generatedIdea.metadata.urgency}</p>
              <p><strong>Priority Level:</strong> {generatedIdea.metadata.priority}</p>
            </div>
            
            <div className="action-buttons">
              <button 
                className="save-btn" 
                onClick={handleSaveIdea}
                disabled={loading.saving}
              >
                {loading.saving ? 'Saving...' : 'Save Problem'}
              </button>
              <button 
                className="reset-btn"
                onClick={() => setGeneratedIdea(null)}
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <h3>Problem Analysis will appear here</h3>
          <p>Fill out the form and click "Generate Solution" to get started.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="idea-generator-container">
      <div className="three-panel-layout">
        <Sidebar />
        <div className="main-content">
          <div className="content-panels">
            <div className="center-panel"><FormPanel /></div>
            <div className="right-panel"><IdeasPanel /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;