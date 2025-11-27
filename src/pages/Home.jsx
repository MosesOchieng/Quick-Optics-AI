import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import './Home.css'

const Home = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  const stats = [
    { number: '50K+', label: 'Tests Completed' },
    { number: '98%', label: 'Accuracy Rate' },
    { number: '5min', label: 'Average Test Time' },
    { number: '24/7', label: 'Available' }
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
              <span className="badge-icon">✨</span>
              <span>AI-Powered Vision Testing</span>
            </div>
            
            <h1 className="hero-title">
              Your Vision,
              <span className="gradient-text"> Analyzed Instantly</span>
            </h1>
            
            <p className="hero-description">
              Transform your smartphone into a professional vision testing device. Get comprehensive eye analysis, AI insights, and personalized recommendations in minutes.
            </p>

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="stat-item"
                >
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="hero-actions">
              <Link to="/start-test" className="btn btn-primary">
                <span>Start Free Test</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
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

      {/* How it works section */}
      <section className="how-it-works">
        <div className="how-it-works-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="how-it-works-header"
          >
            <h2 className="how-it-works-title">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="how-it-works-subtitle">
              Three simple steps to comprehensive vision analysis
            </p>
          </motion.div>

          <div className="steps-container">
            <div className="steps-timeline"></div>
            {[
              {
                number: "01",
                title: "Start Your Test",
                description: "Position your face in front of the camera and follow our guided setup process.",
                icon: "📱"
              },
              {
                number: "02", 
                title: "AI Analysis",
                description: "Our advanced AI analyzes your vision patterns, eye movements, and visual responses.",
                icon: "🤖"
              },
              {
                number: "03",
                title: "Get Results",
                description: "Receive detailed insights, recommendations, and personalized eyewear suggestions.",
                icon: "📊"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`step-card ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
              >
                <div className="step-number-badge">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="cta-section"
          >
            <div className="cta-card">
              <h3>Ready to test your vision?</h3>
              <p>Join thousands of users who trust Quick Optics AI for their vision health</p>
              <Link to="/start-test" className="btn btn-primary">
                Start Free Test Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

