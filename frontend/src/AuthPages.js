import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';
import IdeaGenerator from './IdeaGenerator';

// Environment variables
const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Reusable components
const GoogleButton = () => (
  <button className="google-button">
    <svg height="18" width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M21.8,10.4h-0.75v0h-9v3.6h5.85c-0.55,2.39-2.64,3.6-5.05,3.6c-2.94,0-5.65-2.4-5.65-6.35 c0-3.88,2.5-6.35,5.65-6.35c1.32,0,2.8,0.5,3.84,1.34l2.56-2.56C17.13,2.4,14.93,1.55,12,1.55C6.82,1.55,2.63,5.8,2.63,11.25 c0,5.45,4.18,9.7,9.37,9.7c4.07,0,8.63-2.95,8.63-9.7C20.63,10.95,21.8,10.4,21.8,10.4z" fill="#3E82F1"></path>
      <path d="M3.88,7.35L6.9,9.6c0.92-2.24,2.94-3.1,5.1-3.1c1.32,0,2.8,0.5,3.84,1.34l2.56-2.56 C17.13,2.4,14.93,1.55,12,1.55C8.4,1.55,5.29,3.95,3.88,7.35z" fill="#CB3927"></path>
      <path d="M12,21.45c2.95,0,5.9-1,7.59-2.85l-2.72-2.4c-0.9,0.8-2.39,1.44-4.88,1.44c-2.39,0-4.5-1.2-5.05-3.6L3.95,16.7 C5.5,19.75,8.5,21.45,12,21.45z" fill="#32A753"></path>
      <path d="M21.8,10.4h-0.75v0h-9v3.6h5.85c-0.25,1.19-0.98,2.2-1.9,2.8l2.72,2.4c-0.4-0.4,2.13-1.6,2.13-4.85 C20.63,10.95,21.8,10.4,21.8,10.4z" fill="#FCB900"></path>
    </svg>
    <span>Continue with Google</span>
  </button>
);

const Divider = () => (
  <div className="divider">
    <div className="divider-line"></div>
    <span>or</span>
    <div className="divider-line"></div>
  </div>
);

const TermsText = () => (
  <div className="terms-text">
    By signing up, you agree to YAIIA's <a href="/terms">Terms & Conditions</a> & <a href="/privacy">Privacy Policy</a>
  </div>
);

// Utility functions
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const useAuth = () => {
  const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.detail || 'Login failed');
      }
      
      setTokens(data.access, data.refresh);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    clearTokens();
  };

  const getOtp = async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/accounts/get-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send OTP');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch(`${BASE_URL}/accounts/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.verified) {
        throw new Error('OTP verification failed');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { login, logout, getOtp, verifyOtp };
};

// Main component
const AuthPages = ({ initialPage = 'signup', onClose }) => {
  const [currentPage, setCurrentPage] = useState(initialPage === 'signup' ? 'signup' : 'login');
  const [userCredentials, setUserCredentials] = useState(null);
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleNavigation = useCallback((path) => {
    onClose();
    navigate(path);
  }, [onClose, navigate]);
  
  const switchPage = useCallback(() => {
    setCurrentPage(prevPage => prevPage === 'signup' ? 'login' : 'signup');
  }, []);

  const handleComplete = useCallback((credentials) => {
    setUserCredentials(credentials);
    setShowIdeaGenerator(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const renderContent = () => {
    if (showIdeaGenerator) {
      return <IdeaGenerator onClose={onClose} />;
    }
    
    switch (currentPage) {
      case 'signup':
        return <SignupForm onSwitchPage={switchPage} onComplete={handleComplete} />;
      case 'login':
        return <LoginForm onSwitchPage={switchPage} onComplete={handleComplete}/>;
      default:
        return null;
    }
  };

  // Only show header with tabs when we're in login or signup pages and not showing IdeaGenerator
  const showHeader = (currentPage === 'login' || currentPage === 'signup') && !showIdeaGenerator;
  
  return (
    <div className="auth-container">
      {showHeader && (
        <div className="header-container">
          <div className="logo">YAIIA</div>
          <div className="nav-links">
            <button className="nav-btn" onClick={() => handleNavigation("/blog")}>Blog</button>
            <button className="nav-btn" onClick={() => handleNavigation("/pricing")}>Pricing</button>
            <button className="nav-btn" onClick={() => handleNavigation("/")}>Idea Generator</button>
          </div>
          <div className="auth-buttons">
            <button 
              className={`login-btn-hero ${currentPage === 'login' ? 'active' : ''}`} 
              onClick={() => setCurrentPage('login')}
            >
              Login
            </button>
            <button 
              className={`signup-btn-hero ${currentPage === 'signup' ? 'active' : ''}`}
              onClick={() => setCurrentPage('signup')}
            >
              Signup
            </button>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

// SignupForm component for user registration
const SignupForm = ({ onSwitchPage, onComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { getOtp, verifyOtp, login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (otpSent && !formData.otp) {
      newErrors.otp = 'Please enter the OTP sent to your email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetOtp = async () => {
    if (!isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/accounts/signup-request-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data?.error || 'Failed to send OTP');
      } else {
        setOtpSent(true);
        alert('OTP sent to your email');
      }
    } catch (error) {
      alert(`Error sending OTP: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Verify OTP with password included
      const response = await fetch(`${BASE_URL}/accounts/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp,
          password: formData.password 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.verified) {
        setErrors(prev => ({ ...prev, otp: 'OTP verification failed' }));
        setLoading(false);
        return;
      }
      
      // Auto-login after successful verification
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        onComplete({ email: formData.email });
      } else {
        alert(loginResult.error || 'Login failed after verification');
      }
    } catch (error) {
      alert(`Error during signup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forms-container">
      <div className="auth-form">
        <h2 className="form-title">Signup</h2>
        
        <GoogleButton />
        <Divider />
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className={`input-field ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className={`input-field ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="otp-container">
            <button 
              className="otp-button" 
              type="button" 
              onClick={handleGetOtp}
              disabled={loading || !formData.email || !formData.password}
            >
              {loading && otpSent ? 'Resending...' : otpSent ? 'Resend OTP' : 'Get OTP'}
            </button>
            
            <div className="form-group">
              <input 
                type="text" 
                name="otp"
                placeholder="Enter OTP" 
                className={`otp-input ${errors.otp ? 'error' : ''}`}
                value={formData.otp}
                onChange={handleChange}
                disabled={!otpSent}
              />
              {errors.otp && <div className="error-message">{errors.otp}</div>}
            </div>
          </div>
          
          <button 
            className="submit-button" 
            type="submit"
            disabled={loading || !otpSent}
          >
            {loading ? 'Processing...' : 'Signup'}
          </button>
        </form>
        
        <div className="switch-option">
          <span>Already have an account? </span>
          <button 
            className="switch-button"
            onClick={onSwitchPage}
            type="button"
          >
            Login
          </button>
        </div>
        
        <TermsText />
      </div>
    </div>
  );
};

// LoginForm component for user login
const LoginForm = ({ onSwitchPage, onComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onComplete({ email: formData.email });
    } else {
      setErrors({ auth: 'Invalid email or password' });
    }
    
    
    setLoading(false);
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    navigate('/forgot-password');
  };

  return (
    <div className="forms-container">
      <div className="auth-form">
        <h2 className="form-title">Login</h2>
        
        <GoogleButton />
        <Divider />
        
        <form onSubmit={handleSubmit}>
          {errors.auth && <div className="error-message auth-error">{errors.auth}</div>}
          
          <div className="form-group">
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className={`input-field ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className={`input-field ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <button 
            className="submit-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="forgot-password">
          <button type="button" onClick={handleForgotPassword}>
            Forgot Password?
          </button>
        </div>
        
        <div className="switch-option">
          <span>Don't have an account? </span>
          <button 
            className="switch-button"
            onClick={onSwitchPage}
            type="button"
          >
            Signup
          </button>
        </div>
        
        <TermsText />
      </div>
    </div>
  );
};

export default AuthPages;