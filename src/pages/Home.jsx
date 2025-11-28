import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'
import PatientAuthModal from '../components/PatientAuthModal'
import './Home.css'

const Home = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has seen splash screens
    const hasSeenSplash = localStorage.getItem('hasSeenHomeSplash')
    
    if (!hasSeenSplash) {
      setShowSplash(true)
      localStorage.setItem('hasSeenHomeSplash', 'true')
    } else {
      setIsVisible(true)
    }

    // Keyboard shortcut: H then Enter to show help
    let hKeyPressed = false
    let hKeyTimeout = null
    
    const handleKeyDown = (e) => {
      // Check for H key
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        hKeyPressed = true
        // Reset after 2 seconds if Enter not pressed
        if (hKeyTimeout) clearTimeout(hKeyTimeout)
        hKeyTimeout = setTimeout(() => {
          hKeyPressed = false
        }, 2000)
      }
      
      // Check for Enter after H
      if (hKeyPressed && e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        hKeyPressed = false
        if (hKeyTimeout) clearTimeout(hKeyTimeout)
        navigate('/faq')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (hKeyTimeout) clearTimeout(hKeyTimeout)
    }
  }, [navigate])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setIsVisible(true)
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  const features = [
    {
      icon: '🔍',
      title: 'AI Eye Test in Minutes',
      description: 'Smart vision screening for myopia, hyperopia, astigmatism, color vision and more — using just your phone camera.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📊',
      title: 'Doctor-Style Insights',
      description: 'Clear, friendly explanations plus AI-powered risk flags so you understand your eyes, not just the numbers.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👓',
      title: 'Smart Eyewear Match',
      description: 'Face-fit and style hints to help you pick frames that actually suit your face and lifestyle.',
      gradient: 'from-green-500 to-teal-500'
    }
  ]


  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-content"
          >
            <div className="hero-badge">
              <img src="/Logo.jpeg" alt="Quick Optics AI" className="logo-icon" />
              <span>Quick Optics AI</span>
            </div>
            
            <h1 className="hero-title">
              Professional Vision Testing,
              <span className="gradient-text"> Simplified</span>
            </h1>
            
            <p className="hero-description">
              Transform your smartphone into a professional vision testing device. Get comprehensive eye analysis, AI insights, and personalized recommendations in minutes.
            </p>


            <div className="hero-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAuthModal(true)}
              >
                <span>Get Started</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <Link to="/clinic-login" className="btn btn-outline">
                <span>Optician/Clinic Access</span>
              </Link>
              <Link to="/how-it-works" className="btn btn-outline">
                <span>How It Works</span>
              </Link>
            </div>

            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>5-Minute Test</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📱</span>
                <span>Mobile Optimized</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-visual"
          >
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen">
                  <div className="mockup-camera-view">
                  {/* Status Bar */}
                  <div className="mockup-status-bar">
                    <div className="status-time">9:41</div>
                    <div className="status-icons">
                      <span className="signal-icon">📶</span>
                      <span className="wifi-icon">📶</span>
                      <span className="battery-icon">🔋</span>
                    </div>
                  </div>
                  
                  {/* AI Analysis Header */}
                  <div className="ai-analysis-header">
                    <div className="ai-status-indicator">
                      <div className="ai-pulse"></div>
                      <span>AI Analyzing...</span>
                    </div>
                    <div className="scan-progress-bar">
                      <div className="scan-progress-fill"></div>
                    </div>
                  </div>

                  <div className="eye-container">
                    <div className="eye">
                      <div className="eyeball">
                        <div className="pupil"></div>
                        <div className="iris-pattern"></div>
                        <div className="iris-detail"></div>
                      </div>
                      <div className="eyelid top"></div>
                      <div className="eyelid bottom"></div>
                    </div>
                    
                    {/* Enhanced Alignment Box */}
                    <div className="alignment-box">
                      <div className="alignment-corner top-left"></div>
                      <div className="alignment-corner top-right"></div>
                      <div className="alignment-corner bottom-left"></div>
                      <div className="alignment-corner bottom-right"></div>
                      <div className="alignment-center"></div>
                    </div>
                    
                    {/* Multi-directional scan lines */}
                    <div className="scan-line horizontal"></div>
                    <div className="scan-line vertical"></div>
                    <div className="scan-line diagonal-1"></div>
                    <div className="scan-line diagonal-2"></div>
                    
                    {/* Enhanced particles with trails */}
                    <div className="scan-particles">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="particle" style={{ '--delay': i * 0.15 + 's', '--index': i }}>
                          <div className="particle-trail"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* AI Data Points */}
                    <div className="ai-data-points">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="data-point"
                          style={{
                            '--angle': (i * 60) + 'deg',
                            '--radius': '120px'
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          <div className="data-point-pulse"></div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Real-time Metrics */}
                    <div className="real-time-metrics">
                      <motion.div 
                        className="metric-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <div className="metric-label">Focus</div>
                        <div className="metric-value">98%</div>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: '98%' }}></div>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="metric-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                      >
                        <div className="metric-label">Alignment</div>
                        <div className="metric-value">95%</div>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: '95%' }}></div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Condition Detection Badges */}
                    <div className="condition-badges">
                      {[
                        { id: 'myopia', label: 'Myopia', value: '12%', color: '#3b82f6', delay: 2 },
                        { id: 'hyperopia', label: 'Hyperopia', value: '5%', color: '#10b981', delay: 2.5 },
                        { id: 'astigmatism', label: 'Astigmatism', value: '8%', color: '#f59e0b', delay: 3 }
                      ].map((condition) => (
                        <motion.div
                          key={condition.id}
                          className="condition-badge"
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{
                            delay: condition.delay,
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            repeatDelay: 4
                          }}
                          style={{ '--badge-color': condition.color }}
                        >
                          <div className="badge-icon">✓</div>
                          <div className="badge-content">
                            <div className="badge-label">{condition.label}</div>
                            <div className="badge-value">{condition.value}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bottom Action Bar */}
                  <div className="mockup-action-bar">
                    <div className="action-button">Stop Scan</div>
                    <div className="action-button primary">Analyzing...</div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Patient Auth Modal */}
      <PatientAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="features-header"
          >
            <h2 className="features-title">
              Why Choose <span className="gradient-text">Quick Optics AI</span>?
            </h2>
            <p className="features-subtitle">
              Advanced AI technology meets user-friendly design for comprehensive vision care
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="feature-card"
              >
                <div className={`feature-icon-wrapper ${feature.gradient}`}>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <div className="feature-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home

