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

  const progressPercentage = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : progress

  return (
    <div className={`test-layout ${darkMode ? 'dark-mode' : ''} ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Minimal header for test pages */}
      <div className="test-header">
        <div className="test-header-content">
          {/* Progress indicator */}
          <div className="test-progress-section">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="progress-text">
                {totalSteps > 1 ? `Step ${currentStep} of ${totalSteps}` : `${Math.round(progress)}%`}
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
            >
              ✕
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
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="instructions-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="instructions-header">
                <h3>📋 Test Instructions</h3>
                <button 
                  className="instructions-close"
                  onClick={() => setShowInstructions(false)}
                >
                  ✕
                </button>
              </div>
              <div className="instructions-content">
                <ul>
                  <li>🎯 Follow the on-screen guidance carefully</li>
                  <li>📱 Keep your device steady and at eye level</li>
                  <li>💡 Ensure good lighting on your face</li>
                  <li>👁️ Look directly at the camera when prompted</li>
                  <li>🔇 Enable sound for voice guidance (optional)</li>
                </ul>
              </div>
              <div className="instructions-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it, let's start!
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
      >
        ?
      </button>

      {/* Emergency exit overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="exit-overlay"
          >
            <div className="exit-message">
              <div className="exit-icon">👋</div>
              <p>Exiting test...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TestLayout
