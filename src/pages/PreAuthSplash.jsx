import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './PreAuthSplash.css'

const PreAuthSplash = () => {
  const [showSplash, setShowSplash] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem('hasSeenPreAuthSplash')
    
    if (hasSeenSplash) {
      setShowSplash(false)
      return
    }

    // Show splash for 4 seconds (longer to read licensing info)
    const timer = setTimeout(() => {
      setShowSplash(false)
      localStorage.setItem('hasSeenPreAuthSplash', 'true')
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (!showSplash) {
    return null
  }

  const handleGetStarted = () => {
    setShowSplash(false)
    localStorage.setItem('hasSeenPreAuthSplash', 'true')
    navigate('/signup')
  }

  const handleSignIn = () => {
    setShowSplash(false)
    localStorage.setItem('hasSeenPreAuthSplash', 'true')
    navigate('/login')
  }

  const handleClinicAccess = () => {
    setShowSplash(false)
    localStorage.setItem('hasSeenPreAuthSplash', 'true')
    navigate('/login', { state: { userType: 'clinic' } })
  }

  return (
    <motion.div
      className="pre-auth-splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash-background-overlay"></div>
      
      <div className="splash-content-wrapper">
        <motion.div
          className="splash-logo-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src="/Logo.jpeg" alt="Quick Optics AI" className="splash-logo" />
          <h1 className="splash-brand">Quick Optics AI</h1>
          <p className="splash-tagline">Professional Vision Testing, Simplified</p>
        </motion.div>

        <motion.div
          className="splash-licensing-banner"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="licensing-icon">👨‍⚕️</div>
          <div className="licensing-content">
            <h3>Licensing Available for Opticians & Clinics</h3>
            <p>Integrate our AI-powered vision testing technology into your practice</p>
          </div>
          <motion.button
            className="licensing-btn"
            onClick={handleClinicAccess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>
        
        <motion.div
          className="splash-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="splash-btn primary"
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
          <motion.button
            className="splash-btn secondary"
            onClick={handleSignIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PreAuthSplash


