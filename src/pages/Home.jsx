import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Home.css'

const Home = () => {
  const features = [
    {
      icon: '🔍',
      title: 'AI Eye Test in Minutes',
      description: 'Smart vision screening for myopia, hyperopia, astigmatism, color vision and more — using just your phone camera.'
    },
    {
      icon: '📊',
      title: 'Doctor-Style Insights',
      description: 'Clear, friendly explanations plus AI-powered risk flags so you understand your eyes, not just the numbers.'
    },
    {
      icon: '👓',
      title: 'Smart Eyewear Match',
      description: 'Face-fit and style hints to help you pick frames that actually suit your face and lifestyle.'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="logo-large">
              <span className="logo-icon-large">👁️</span>
              <h1 className="logo-text-large">Quick Optics AI</h1>
            </div>
            <h2 className="hero-headline">Instant vision check. Anywhere. No appointment.</h2>
            <p className="hero-subheadline">
              Quick Optics AI turns your phone into a mini vision lab — eye tests, AI analysis, and smart eyewear guidance in one beautiful experience.
            </p>
            <div className="hero-cta">
              <Link to="/onboarding" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-ghost">
                See how it works
              </Link>
              <Link to="/start-test" className="btn btn-secondary">
                Eye test process
              </Link>
            </div>
            <div className="hero-meta">
              <div className="meta-pill">⏱️ 5–7 minute screening</div>
              <div className="meta-pill">📱 Optimised for mobile</div>
              <div className="meta-pill">🔒 Privacy-first, no raw images stored</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-mockup"
          >
            <div className="phone-mockup">
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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="features-header">
            <h2>Why Quick Optics AI?</h2>
            <p>Designed for fast, remote vision screening that still feels clinical, calm and trustworthy.</p>
          </div>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works strip */}
      <section className="how-it-works-strip">
        <div className="how-container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create your profile & start the eye test</h3>
              <p>Sign up or log in, then we guide you to align your face and run a short, camera-based eye scan plus quick visual tests.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI compares your vision</h3>
              <p>Our CVIE engine analyses patterns, stability and clarity versus population baselines.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get a clear summary in your dashboard</h3>
              <p>See friendly scores, risk indicators and suggestions for next steps or eyewear — results are only available when you&apos;re logged in.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

