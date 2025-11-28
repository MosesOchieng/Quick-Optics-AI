import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isHomePage = location.pathname === '/'
  const isOnboarding = location.pathname === '/onboarding'
  const isAuthPage = ['/login', '/signup', '/payment-confirmation'].includes(location.pathname)
  const isEyeScanPage = location.pathname === '/eye-scan'
  
  // Hide navbar on all test pages for distraction-free testing
  const isTestPage = [
    '/eye-scan',
    '/vision-tests', 
    '/start-test',
    '/mini-games',
    '/ar-try-on'
  ].includes(location.pathname)
  
  const hideNavbar = isHomePage || isOnboarding || isAuthPage || isTestPage

  return (
    <div className="layout">
      {!hideNavbar && (
        <>
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <img src="/Logo.jpeg" alt="Quick Optics AI" className="nav-logo-image" />
              </Link>
              <div className="nav-links desktop-nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/settings" className="nav-link">Settings</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link btn btn-outline" style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}>Sign Up</Link>
              </div>
              <button 
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
          </nav>
          
          {/* Mobile Sidebar */}
          <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}>
            <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
              <div className="sidebar-header">
                <img src="/Logo.jpeg" alt="Quick Optics AI" className="sidebar-logo" />
                <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
              </div>
              <nav className="sidebar-nav">
                <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Home</Link>
                <Link to="/dashboard" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Profile</Link>
                <Link to="/settings" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Settings</Link>
                <Link to="/contact" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Contact</Link>
                <Link to="/login" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Login</Link>
                <Link to="/signup" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Sign Up</Link>
              </nav>
            </div>
          </div>
        </>
      )}
      <main className="main-content">{children}</main>
      {!isOnboarding && !isAuthPage && !isTestPage && (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Quick Optics AI</h3>
            <p>See Smarter with AI</p>
          </div>
              <div className="footer-section">
            <h4>About</h4>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy & Data Policy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <Link to="/contact">Contact Us</Link>
            <a href="mailto:support@quickoptics.ai">support@quickoptics.ai</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Quick Optics AI. All rights reserved.</p>
        </div>
      </footer>
      )}
    </div>
  )
}

export default Layout

