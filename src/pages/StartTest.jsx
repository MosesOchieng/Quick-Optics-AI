import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './StartTest.css'

const StartTest = () => {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [cameraPermission, setCameraPermission] = useState(null)

  const screens = [
    {
      title: 'Welcome',
      subtitle: 'Quick, safe, and accurate vision testing.',
      content: (
        <div className="welcome-content">
          <div className="welcome-icon">👁️</div>
          <p className="welcome-text">
            Our AI-powered vision test takes just a few minutes and provides instant results.
            No appointments needed.
          </p>
        </div>
      ),
      buttonText: 'Next',
      onButtonClick: () => setCurrentScreen(1)
    },
    {
      title: 'Allow Camera',
      subtitle: 'We need camera access to scan your eyes.',
      content: (
        <div className="camera-permission-content">
          <div className="camera-icon">📷</div>
          <p className="permission-text">
            Your privacy is important. Camera access is only used for vision testing
            and is never stored or shared.
          </p>
        </div>
      ),
      buttonText: 'Enable Camera',
      onButtonClick: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          setCameraPermission(true)
          setCurrentScreen(2)
        } catch (error) {
          setCameraPermission(false)
          alert('Camera access is required for vision testing. Please enable it in your browser settings.')
        }
      }
    },
    {
      title: 'Align Your Face',
      subtitle: 'Position your face within the frame.',
      content: (
        <div className="align-content">
          <div className="alignment-preview">
            <div className="alignment-frame">
              <div className="alignment-guide"></div>
            </div>
          </div>
          <p className="align-instruction">
            Move closer... Perfect. Keep your face centered and look straight ahead.
          </p>
        </div>
      ),
      buttonText: 'Start Test',
      // First go to eye scan (with camera + circles), then EyeScan will forward to /vision-tests
      onButtonClick: () => navigate('/eye-scan')
    }
  ]

  return (
    <div className="start-test">
      <div className="onboarding-modal">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="onboarding-screen"
          >
            <div className="screen-header">
              {currentScreen > 0 && (
                <button
                  className="back-button"
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                >
                  ← Back
                </button>
              )}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentScreen + 1) / screens.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="screen-content">
              <h1 className="screen-title">{screens[currentScreen].title}</h1>
              <p className="screen-subtitle">{screens[currentScreen].subtitle}</p>
              {screens[currentScreen].content}
            </div>

            <div className="screen-footer">
              <button
                className="btn btn-primary btn-large"
                onClick={screens[currentScreen].onButtonClick}
              >
                {screens[currentScreen].buttonText}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default StartTest

