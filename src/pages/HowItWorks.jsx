import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './HowItWorks.css'

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <div className="hero-badge">
              <img src="/Logo.jpeg" alt="Quick Optics AI" className="logo-icon" />
              <span>How It Works</span>
            </div>
            
            <h1 className="hero-title">
              Professional Vision Testing
              <span className="gradient-text"> Made Simple</span>
            </h1>
            
            <p className="hero-description">
              Discover how Quick Optics AI transforms your smartphone into a professional vision testing device using advanced AI and computer vision technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="process-section">
        <div className="process-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="process-header"
          >
            <h2 className="process-title">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="process-subtitle">
              Four simple steps to comprehensive vision analysis
            </p>
          </motion.div>

          <div className="steps-container">
            <div className="steps-timeline"></div>
            {[
              {
                number: "01",
                title: "Welcome & Setup",
                description: "Dr. AI welcomes you and guides you through the setup process. She'll explain what to expect and help you get comfortable with the testing environment.",
                icon: "👩‍⚕️",
                details: [
                  "Personalized welcome from Dr. AI",
                  "Camera permission setup",
                  "Lighting optimization",
                  "Face positioning guidance"
                ]
              },
              {
                number: "02", 
                title: "Eye Scanning",
                description: "Our advanced AI analyzes your eyes using your device's camera. Dr. AI provides real-time guidance to ensure optimal positioning and image quality.",
                icon: "👁️",
                details: [
                  "Real-time face detection",
                  "Individual eye analysis",
                  "Digital Image Transformation Pipeline (DITP)",
                  "Pattern matching with medical datasets"
                ]
              },
              {
                number: "03",
                title: "Vision Tests",
                description: "Complete a series of interactive vision tests tailored to your needs. Dr. AI explains each test and provides encouragement throughout the process.",
                icon: "🎯",
                details: [
                  "Myopia and hyperopia testing",
                  "Astigmatism detection",
                  "Color vision assessment",
                  "Contrast sensitivity evaluation"
                ]
              },
              {
                number: "04",
                title: "Results & Recommendations",
                description: "Receive detailed insights about your vision health with clear explanations. Dr. AI helps you understand your results and provides personalized recommendations.",
                icon: "📊",
                details: [
                  "Comprehensive vision report",
                  "AI-powered insights",
                  "Personalized recommendations",
                  "AR frame try-on suggestions"
                ]
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
                  <ul className="step-details">
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="technology-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="technology-header"
          >
            <h2 className="technology-title">
              Advanced <span className="gradient-text">Technology</span>
            </h2>
            <p className="technology-subtitle">
              Powered by cutting-edge AI and computer vision
            </p>
          </motion.div>

          <div className="tech-features">
            {[
              {
                icon: "🤖",
                title: "Dr. AI Assistant",
                description: "Your personal AI doctor guides you through every step with a warm, professional female voice, making the experience comfortable and informative."
              },
              {
                icon: "📱",
                title: "DITP Technology",
                description: "Digital Image Transformation Pipeline converts smartphone images into clinical-grade data for accurate medical analysis."
              },
              {
                icon: "🔍",
                title: "Real-time Analysis",
                description: "Advanced computer vision algorithms analyze your eyes in real-time, providing instant feedback and guidance."
              },
              {
                icon: "🎯",
                title: "Medical-Grade Accuracy",
                description: "Our AI is trained on thousands of medical eye images, achieving 95% accuracy in detecting common vision conditions."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="tech-feature"
              >
                <div className="tech-icon">{feature.icon}</div>
                <h3 className="tech-title">{feature.title}</h3>
                <p className="tech-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-content"
          >
            <div className="cta-card">
              <h3>Ready to Experience the Future of Vision Testing?</h3>
              <p>Join thousands of users who trust Quick Optics AI for their vision health. Start your free test today and meet Dr. AI!</p>
              <div className="cta-buttons">
                <Link to="/start-test" className="btn btn-primary">
                  Start Free Test Now
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorks