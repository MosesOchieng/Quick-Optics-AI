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
                  <div className="eye-container">
                    <div className="eye">
                      <div className="eyeball">
                        <div className="pupil"></div>
                        <div className="iris-pattern"></div>
                      </div>
                      <div className="eyelid top"></div>
                      <div className="eyelid bottom"></div>
                    </div>
                    <div className="alignment-box"></div>
                    <div className="scan-line"></div>
                    <div className="scan-particles">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="particle" style={{ '--delay': i * 0.2 + 's' }}></div>
                      ))}
                    </div>
                    {/* Animated arrows pointing to conditions */}
                    <div className="condition-arrows">
                      {[
                        { id: 'myopia', label: 'Myopia', position: { top: '15%', left: '10%' }, delay: 0 },
                        { id: 'hyperopia', label: 'Hyperopia', position: { top: '15%', right: '10%' }, delay: 1 },
                        { id: 'astigmatism', label: 'Astigmatism', position: { bottom: '15%', left: '10%' }, delay: 2 },
                        { id: 'focus', label: 'Focus', position: { bottom: '15%', right: '10%' }, delay: 3 }
                      ].map((condition, i) => (
                        <motion.div
                          key={condition.id}
                          className="condition-arrow"
                          style={condition.position}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1, 1, 0]
                          }}
                          transition={{
                            duration: 3,
                            delay: condition.delay + (i * 0.5),
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="arrow-line"></div>
                          <div className="arrow-head"></div>
                          <div className="arrow-label">{condition.label}</div>
                        </motion.div>
                      ))}
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
              <h3>Scan with your camera</h3>
              <p>We guide you to align your face and run a short eye scan plus quick visual tests.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI compares your vision</h3>
              <p>Our CVIE engine analyses patterns, stability and clarity versus population baselines.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get a clear summary</h3>
              <p>See friendly scores, risk indicators and suggestions for next steps or eyewear.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

