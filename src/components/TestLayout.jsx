import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './TestLayout.css'

const TestLayout = ({ 
  children, 
  title, 
  subtitle,
  progress = 0,
  totalSteps = 1,
  currentStep = 1,
  onExit,
  showExitButton = true,
  fullscreen = false,
  darkMode = true
}) => {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    // Auto-hide instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleExit = () => {
    setIsExiting(true)
    if (onExit) {
      onExit()
    } else {
      navigate('/dashboard')
    }
  }

  // Calculate progress percentage with validation and clamping
  const calculateProgress = () => {
    if (totalSteps > 1) {
      // Clamp currentStep to valid range
      const clampedStep = Math.max(1, Math.min(currentStep, totalSteps))
      const percentage = ((clampedStep - 1) / (totalSteps - 1)) * 100
      return Math.max(0, Math.min(100, percentage)) // Clamp between 0-100
    }
    // Use progress prop, clamped between 0-100
    return Math.max(0, Math.min(100, progress))
  }

  const progressPercentage = calculateProgress()
  
  // Get clamped step for display
  const clampedStep = totalSteps > 1 ? Math.max(1, Math.min(currentStep, totalSteps)) : currentStep

  return (
    <div className={`test-layout ${darkMode ? 'dark-mode' : ''} ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Minimal header for test pages */}
      <div className="test-header">
        <div className="test-header-content">
          {/* Progress indicator */}
          <div className="test-progress-section" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label="Test progress">
            <div className="progress-bar-container">
              <div className="progress-bar" role="presentation">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="progress-text" aria-live="polite">
                {totalSteps > 1 ? `Step ${clampedStep} of ${totalSteps}` : `${Math.round(progressPercentage)}%`}
              </span>
            </div>
          </div>

          {/* Title section */}
          <div className="test-title-section">
            <h1 className="test-title">{title}</h1>
            {subtitle && <p className="test-subtitle">{subtitle}</p>}
          </div>

          {/* Exit button */}
          {showExitButton && (
            <button 
              className="test-exit-btn"
              onClick={handleExit}
              disabled={isExiting}
              title="Exit test"
              aria-label="Exit test"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Instructions overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="instructions-overlay"
            onClick={() => setShowInstructions(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="instructions-title"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="instructions-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="instructions-header">
                <h3 id="instructions-title">👋 Welcome! Let's Get Started</h3>
                <button 
                  className="instructions-close"
                  onClick={() => setShowInstructions(false)}
                  aria-label="Close instructions"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <div className="instructions-content">
                <ul>
                  <li>👋 Hi! I'm Dr. AI, your friendly vision guide. I'll walk you through each step.</li>
                  <li>📱 Hold your device steady at eye level - like you're taking a selfie!</li>
                  <li>💡 Make sure you're in a well-lit area so I can see your eyes clearly</li>
                  <li>👁️ When I ask, look directly at the camera - just like visiting a real eye doctor</li>
                  <li>🎤 Feel free to speak to me anytime - I'm here to help make this easy for you</li>
                </ul>
              </div>
              <div className="instructions-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowInstructions(false)}
                  aria-label="Start test"
                >
                  I'm ready! Let's begin 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main test content */}
      <div className="test-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="test-content-inner"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating help button */}
      <button 
        className="floating-help-btn"
        onClick={() => setShowInstructions(true)}
        title="Show instructions"
        aria-label="Show test instructions"
      >
        <span aria-hidden="true">?</span>
      </button>

      {/* Emergency exit overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="exit-overlay"
            role="status"
            aria-live="polite"
            aria-label="Exiting test"
          >
            <div className="exit-message">
              <div className="exit-icon" aria-hidden="true">👋</div>
              <p>Exiting test...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TestLayout
