import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isOnboarding = location.pathname === '/onboarding'
  const isAuthPage = ['/login', '/signup', '/payment-confirmation'].includes(location.pathname)

  return (
    <div className="layout">
      {!isHomePage && !isOnboarding && !isAuthPage && (
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <span className="logo-icon">👁️</span>
              <span className="logo-text">Quick Optics AI</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/vision-trainer" className="nav-link">Trainer</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </div>
          </div>
        </nav>
      )}
      <main className="main-content">{children}</main>
      {!isOnboarding && !isAuthPage && (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Quick Optics AI</h3>
            <p>See Smarter with AI</p>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy & Data Policy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
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

