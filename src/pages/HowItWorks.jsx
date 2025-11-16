import { motion } from 'framer-motion'
import './HowItWorks.css'

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Scan Your Eyes',
      description: 'AI measures your eye focus, clarity & patterns.',
      image: '📷',
      details: 'Photo of face alignment box - Position your face within the guide and our AI analyzes your eye structure.'
    },
    {
      number: '2',
      title: 'Mini-Game Vision Tests',
      description: 'Interactive tests for comprehensive vision screening.',
      image: '🎮',
      details: 'Snellen-like shrinking letters, color-blindness dot patterns, contrast & depth mini-games.'
    },
    {
      number: '3',
      title: 'Instant Results',
      description: 'Get detailed insights about your vision health.',
      image: '📊',
      details: 'Modern result card with indicators for myopia, hyperopia, astigmatism, dry-eye risk, and more.'
    },
    {
      number: '4',
      title: 'Find Glasses That Fit You',
      description: 'Face-shape detection and personalized recommendations.',
      image: '👓',
      details: 'AI detects your face shape (Oval / Round / Square / Heart / Triangle) and suggests styles: Professional, Sport, or Lifestyle frames.'
    }
  ]

  return (
    <div className="how-it-works">
      <div className="how-it-works-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <h1 className="page-title">How It Works</h1>
          <p className="page-subtitle">
            A simple, step-by-step process to test your vision and find perfect eyewear
          </p>
        </motion.div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="step-card"
            >
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">{step.image}</div>
                <h2 className="step-title">{step.title}</h2>
                <p className="step-description">{step.description}</p>
                <p className="step-details">{step.details}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cta-section"
        >
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">Create your account and take your vision test</p>
          <a href="/login" className="btn btn-primary">
            Go to Login
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default HowItWorks

