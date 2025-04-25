import React from "react";
import "./Blog.css";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="blog-page">
      <div className="header-container">
        <div className="logo">YAIIA</div>
        <div className="nav-links">
          <button className="nav-btn active" onClick={() => navigate("/blog")}>Blog</button>
          <button className="nav-btn" onClick={() => navigate("/pricing")}>Pricing</button>
          <button className="nav-btn">Idea Generator</button>
        </div>
        <div className="auth-buttons">
          <button className="login-btn-hero" onClick={() => navigate('/', { state: { authAction: 'login' } })}>Login</button>
          <button className="signup-btn-hero" onClick={() => navigate('/', { state: { authAction: 'signup' } })}>signup</button>
        </div>
      </div>
      <div className="hero-section-blog">
        <div className="hero-content-blog">
          <h1>How I am using AI every day to stay ahead.</h1>
          <div className="user-reviews">
            <div className="avatars">
              <img src="/man-talk.png" alt="User" className="avatar" />
              <img src="/robottalk.png" alt="User" className="avatar" />
              <img src="/robotalk.png" alt="User" className="avatar" />
              <img src="/supply-illu.png" alt="User" className="avatar" />
              <img src="/definerole.png" alt="User" className="avatar" />
            </div>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="review-count">from 94 reviews</span>
            </div>
          </div>
        </div>
        <div className="subscription-box">
          <h3>Join 52,000+ readers mastering AI.</h3>
          <div className="subscription-form">
            <input type="email" placeholder="Enter your email" className="email-input" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="blog-content">
        <div className="blog-post">
          <span className="blog-date">April 14, 2023</span>
          <h2>One-Shot Prompting.</h2>
          <p>The one prompting technique to master (because it covers 80% of what you need).</p>
        </div>
        <div className="blog-post">
          <span className="blog-date">April 8, 2023</span>
          <h2>To be inspired.</h2>
          <p>You want to feel inspired more than you want to solve the problem.</p>
        </div>
        <div className="blog-post">
          <span className="blog-date">March 30, 2023</span>
          <h2>Everything is Ghibli.</h2>
          <p>About the latest ChatGPT image frenzy.</p>
        </div>
        <div className="blog-post">
          <span className="blog-date">March 25, 2023</span>
          <h2>AI Prompt Engineering.</h2>
          <p>How to craft effective prompts for better AI-generated content.</p>
        </div>
        <div className="blog-post">
          <span className="blog-date">March 18, 2023</span>
          <h2>Future of AI Assistants.</h2>
          <p>Exploring how AI assistants will transform productivity in the next decade.</p>
        </div>
        <div className="blog-post">
          <span className="blog-date">March 10, 2023</span>
          <h2>Creative AI Workflows.</h2>
          <p>Building effective systems to enhance your creative process with AI tools.</p>
        </div>
      </div>
      <button className="next-btn">Next</button>
      
      <footer className="footer-blog">
        <div className="footer-top-border"></div>
        <div className="footer-container-blog">
          <div className="footer-column-blog">
            <h4>Site</h4>
            <ul>
              <li>
                <a href="/about" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/about"); }}>
                  <span className="footer-link-text">About Us</span>
                </a>
              </li>
              <li>
                <a href="/careers" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/careers"); }}>
                  <span className="footer-link-text">Careers</span>
                </a>
              </li>
              <li>
                <a href="/pricing" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>
                  <span className="footer-link-text">Pricing</span>
                </a>
              </li>
              <li>
                <a href="/faq" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/faq"); }}>
                  <span className="footer-link-text">FAQ</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-column-blog">
            <h4>Product</h4>
            <ul>
              <li>
                <a href="/features" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/features"); }}>
                  <span className="footer-link-text">Features</span>
                </a>
              </li>
              <li>
                <a href="/use-cases" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/use-cases"); }}>
                  <span className="footer-link-text">Use Cases</span>
                </a>
              </li>
              <li>
                <a href="/templates" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/templates"); }}>
                  <span className="footer-link-text">Templates</span>
                </a>
              </li>
              <li>
                <a href="/api" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/api"); }}>
                  <span className="footer-link-text">API</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-column-blog">
            <h4>Stay Connected</h4>
            <div className="social-icons">
              <a href="https://twitter.com" className="social-icon" title="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" className="social-icon" title="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="mailto:contact@clofytech.com" className="social-icon" title="Email">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="copyright">© 2025 Clofy Technologies. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Blog;