// // Combined IdeaGenerator.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './IdeaGenerator.css';

// const steps = [
//   'subdomain',
//   'target_Audience',
//   'Location',
//   'Urgency',
//   'Priority'
// ];

// const IdeaGenerator = () => {
//   const [currentView, setCurrentView] = useState('form');
//   const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
//   const [generatedIdeas, setGeneratedIdeas] = useState([]);
//   const [selectedIdea, setSelectedIdea] = useState(null);

//   const [formData, setFormData] = useState({
//     focus: '',
//     main_industry: '',
//     subdomain: '',
//     target_Audience: '',
//     Location: '',
//     Urgency: '',
//     Priority: ''
//   });

//   // Gemini API key - should be stored in environment variables in production
//   const GEMINI_API_KEY = 'AIzaSyAUYr1XUV6xqmIzw1oBalNPdW3iP9sJSf4';
//   const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

//   const [focusOptions, setFocusOptions] = useState([]);
//   const [industries, setIndustries] = useState([]);
//   const [options, setOptions] = useState({
//     subdomain: [],
//     target_Audience: [],
//     Location: [],
//     Urgency: [],
//     Priority: []
//   });

//   useEffect(() => {
//     fetch('http://localhost:8000/api/industries/')
//       .then(res => res.json())
//       .then(data => setIndustries(data.industries));

//     fetch('http://localhost:8000/api/focus-options/')
//       .then(res => res.json())
//       .then(data => setFocusOptions(data.focus_options));
//   }, []);

//   useEffect(() => {
//     if (!formData.main_industry) return;

//     const fetchCategories = async () => {
//       const updatedOptions = {};
//       for (const category of steps) {
//         try {
//           const res = await fetch(`http://localhost:8000/api/industry/${formData.main_industry}/${category}/`);
//           const data = await res.json();
//           updatedOptions[category] = data[category] || [];
//         } catch (err) {
//           console.error(`Error fetching ${category}:`, err);
//           updatedOptions[category] = [];
//         }
//       }
//       setOptions(updatedOptions);
//     };

//     fetchCategories();
//   }, [formData.main_industry]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value,
//       ...(field === 'main_industry' ? {
//         subdomain: '',
//         target_Audience: '',
//         Location: '',
//         Urgency: '',
//         Priority: ''
//       } : {})
//     }));
//   };

//   const isFormValid = () => formData.focus && formData.main_industry && formData.target_Audience;

//   const handleGenerateIdeas = async (count) => {
//     if (!isFormValid()) return;

//     setIsGeneratingIdeas(true);
//     setSelectedIdea(null); // Reset selected solution

//     const prompt = `Generate ${count} related problems Based on the following inputs:
//     - Focus: ${formData.focus}
//     - Main Industry: ${formData.main_industry}
//     - Subdomain: ${formData.subdomain}
//     - target_Audience: ${formData.target_Audience}
//     - Business Model: ${formData.Location}
//     - Target Audience: ${formData.Urgency}
//     - Market Segment: ${formData.Priority} 
    
//     Provide the problems in a numbered list format. No need for any explanation.`;

//     try {
//       // Using Gemini API
//       const response = await axios.post(
//         `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//         {
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 { text: prompt }
//               ]
//             }
//           ],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 500,
//           }
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       // Extract text from Gemini response
//       const rawText = response.data.candidates[0].content.parts[0].text.trim();

//       const ideas = rawText
//         .split(/\n(?=\d+\.\s)/) // split by numbered lines
//         .map((ideaText, index) => ({
//           title: `Idea ${index + 1}`,
//           description: ideaText.replace(/^\d+\.\s*/, ''), // remove "1. "
//           details: [],
//         }));

//       setGeneratedIdeas(ideas);
//       setCurrentView('results');

//       await fetch('http://localhost:8000/api/save_full_idea/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           generated_ideas: ideas.map(i => i.description).join('\n\n'),
//         })
//       });
      
//     } catch (error) {
//       console.error('Error generating ideas:', error);
//       alert('Failed to generate ideas. Please try again.');
//     } finally {
//       setIsGeneratingIdeas(false);
//     }
//   };

// //   const handleGenerateSolution = async (problemText) => {
// //     setIsGeneratingIdeas(true); // reuse loading state
// //     try {
// //       const prompt = `Provide a detailed startup solution to solve the following problem:\n\n"${problemText}"\n\nInclude proposed product or service, target audience, core features, target_Audience used, and possible revenue models.`;
  
// //       // Using Gemini API
// //       const response = await axios.post(
// //         `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
// //         {
// //           contents: [
// //             {
// //               role: "user",
// //               parts: [
// //                 { text: prompt }
// //               ]
// //             }
// //           ],
// //           generationConfig: {
// //             temperature: 0.7,
// //             maxOutputTokens: 700,
// //           }
// //         },
// //         {
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //         }
// //       );
  
// //       // Extract text from Gemini response
// //       const solution = response.data.candidates[0].content.parts[0].text.trim();
// //       setSelectedIdea({ problem: problemText, solution });

// //       await fetch('http://localhost:8000/api/save_full_idea/', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           ...formData,
// //           generated_ideas: generatedIdeas.map(i => i.description).join('\n\n'),
// //           selected_problem: problemText,
// //           solution: solution
// //         })
// //       });
// //     } catch (error) {
// //       console.error('Error generating solution:', error);
// //       alert('Failed to generate a solution. Please try again.');
// //     } finally {
// //       setIsGeneratingIdeas(false);
// //     }
// //   };

//   const renderFormInputs = () => (
//     <div className="form-center-panel">
//       <h3>What is your primary focus of your idea?</h3>
//       <div className="select-container">
//         <select value={formData.focus} onChange={e => handleInputChange('focus', e.target.value)}>
//           <option value="" disabled>Select focus</option>
//           {focusOptions.map((option, index) => (
//             <option key={index} value={option}>{option}</option>
//           ))}
//         </select>
//         <span className="select-arrow">▼</span>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <h3>Select the Primary Industry</h3>
//           <div className="select-container">
//             <select value={formData.main_industry} onChange={e => handleInputChange('main_industry', e.target.value)}>
//               <option value="" disabled>Select industry</option>
//               {industries.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>

//         <div className="form-group">
//           <h3>Select the Sub-Industry</h3>
//           <div className="select-container">
//             <select value={formData.subdomain} onChange={e => handleInputChange('subdomain', e.target.value)}>
//               <option value="" disabled>Select sub-industry</option>
//               {options.subdomain.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <h3>Select the Technology</h3>
//           <div className="select-container">
//             <select value={formData.target_Audience} onChange={e => handleInputChange('target_Audience', e.target.value)}>
//               <option value="" disabled>Select technology</option>
//               {options.target_Audience.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>

//         <div className="form-group">
//           <h3>Select the Business Model</h3>
//           <div className="select-container">
//             <select value={formData.Location} onChange={e => handleInputChange('Location', e.target.value)}>
//               <option value="" disabled>Select business model</option>
//               {options.Location.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <h3>Select the Target Audience</h3>
//           <div className="select-container">
//             <select value={formData.Urgency} onChange={e => handleInputChange('Urgency', e.target.value)}>
//               <option value="" disabled>Select target audience</option>
//               {options.Urgency.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>

//         <div className="form-group">
//           <h3>Select the Market Segment</h3>
//           <div className="select-container">
//             <select value={formData.Priority} onChange={e => handleInputChange('Priority', e.target.value)}>
//               <option value="" disabled>Select market segment</option>
//               {options.Priority.map((option, index) => (
//                 <option key={index} value={option}>{option}</option>
//               ))}
//             </select>
//             <span className="select-arrow">▼</span>
//           </div>
//         </div>
//       </div>

//       <div className="generate-buttons">
//         <button className={`generate-btn ${!isFormValid() ? 'disabled' : ''}`} onClick={() => handleGenerateIdeas(5)} disabled={!isFormValid() || isGeneratingIdeas}>
//           {isGeneratingIdeas ? 'Generating...' : 'Generate 5 Ideas'}
//         </button>
//         <button className={`generate-btn ${!isFormValid() ? 'disabled' : ''}`} onClick={() => handleGenerateIdeas(10)} disabled={!isFormValid() || isGeneratingIdeas}>
//           {isGeneratingIdeas ? 'Generating...' : 'Generate 10 Ideas'}
//         </button>
//       </div>
//     </div>
//   );

//   const renderSidebar = () => (
//     <div className="sidebar-panel">
//       <div className="sidebar-logo">YAIIA <span className="logo-dot">•</span></div>
      
//       <nav className="sidebar-nav">
//         <ul className="nav-links-IG">
//           <li className="nav-item active">
//             <span className="nav-icon">🏠</span>
//             <span className="nav-text">Home</span>
//           </li>
//           <li className="nav-item">
//             <span className="nav-icon">💡</span>
//             <span className="nav-text">Generate Ideas</span>
//           </li>
//           <li className="nav-item">
//             <span className="nav-icon">⭐</span>
//             <span className="nav-text">Saved Ideas</span>
//           </li>
//           <li className="nav-item">
//             <span className="nav-icon">⚙️</span>
//             <span className="nav-text">Account Settings</span>
//           </li>
//         </ul>
//       </nav>
      
//       <div className="user-info">
//         <div className="user-avatar">👤</div>
//         <div className="user-details">
//           <div className="user-name">Guest User</div>
//           <div className="user-plan">Free Plan</div>
//         </div>
//       </div>
      
//       <div className="pro-upgrade">
//         <button className="upgrade-button">
//           <span className="upgrade-icon">⚡</span>
//           <span>Upgrade to Pro</span>
//         </button>
//       </div>
//     </div>
//   );

//   const renderIdeasPanel = () => (
//     <div className="ideas-panel">
//       {generatedIdeas.length > 0 && !selectedIdea ? (
//         <div className="idea-details">
//           {generatedIdeas.map((idea, index) => (
//             <div key={index} className="idea-detail-card clickable" onClick={() => handleGenerateSolution(idea.description)}>
//               <h3>{index + 1}. {idea.title}</h3>
//               <p>{idea.description}</p>
//             </div>
//           ))}
//         </div>
//       ) : generatedIdeas.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-state-icon">💡</div>
//           <h3>Ready to Generate Ideas</h3>
//           <p>Fill out the form and click "Generate Ideas" to get started.</p>
//         </div>
//       ) : null}

//       {selectedIdea && (
//         <div className="solution-container">
//           <div className="solution-header">
//             <h3>Solution for:</h3>
//             <p><strong>{selectedIdea.problem}</strong></p>
//             <button 
//               className="back-button" 
//               onClick={() => setSelectedIdea(null)}
//             >
//               ← Back to Ideas
//             </button>
//           </div>
//           <div className="solution-card">
//             <h4>Suggested Solution:</h4>
//             <p>{selectedIdea.solution}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="idea-generator-container">
//       <div className="three-panel-layout">
//         {renderSidebar()}
//         <div className="main-content">
//           <div className="content-panels">
//             <div className="center-panel">{renderFormInputs()}</div>
//             <div className="right-panel">{renderIdeasPanel()}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IdeaGenerator;
