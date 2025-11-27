import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TestLayout from '../components/TestLayout'
import './StartTest.css'

const StartTest = () => {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [cameraPermission, setCameraPermission] = useState(null)

  const screens = [
    {
      title: 'Welcome to Quick Optics AI',
      subtitle: 'Meet Dr. AI - Your Personal Vision Care Assistant',
      content: (
        <div className="welcome-content">
          <div className="doctor-avatar">
            <div className="avatar-circle">
              <span className="doctor-icon">👩‍⚕️</span>
            </div>
            <div className="doctor-intro">
              <h3>Dr. AI</h3>
              <p>Your Virtual Eye Care Specialist</p>
            </div>
          </div>
          <div className="welcome-message">
            <p className="greeting">
              Hello! I'm Dr. AI, and I'll be guiding you through your comprehensive vision assessment today. 
            </p>
            <p className="reassurance">
              Don't worry - this is completely painless and takes just 3-5 minutes. I'll be with you every step of the way, 
              explaining what we're doing and why. Think of it as having a friendly eye doctor right in your pocket!
            </p>
          </div>
        </div>
      ),
      buttonText: 'Nice to meet you, Dr. AI!',
      onButtonClick: () => setCurrentScreen(1)
    },
    {
      title: 'Camera Setup',
      subtitle: 'Let me help you set up your camera for the best results.',
      content: (
        <div className="camera-permission-content">
          <div className="doctor-explanation">
            <div className="explanation-icon">📷</div>
            <div className="explanation-text">
              <p className="doctor-voice">
                "Now I need to access your camera so I can see your eyes clearly. This is just like when you visit my office - 
                I need to look at your eyes to assess your vision health."
              </p>
              <div className="privacy-assurance">
                <div className="assurance-item">
                  <span className="check-icon">🔒</span>
                  <span>Your privacy is completely protected</span>
                </div>
                <div className="assurance-item">
                  <span className="check-icon">📱</span>
                  <span>Images are processed locally on your device</span>
                </div>
                <div className="assurance-item">
                  <span className="check-icon">🚫</span>
                  <span>No data is stored or shared without permission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      buttonText: 'Enable Camera Access',
      onButtonClick: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          setCameraPermission(true)
          setCurrentScreen(2)
        } catch (error) {
          setCameraPermission(false)
          alert('I need camera access to examine your eyes. Please enable it in your browser settings and try again.')
        }
      }
    },
    {
      title: 'Perfect! Let\'s Begin',
      subtitle: 'Dr. AI will guide you through the positioning process.',
      content: (
        <div className="align-content">
          <div className="doctor-guidance">
            <div className="guidance-avatar">👩‍⚕️</div>
            <div className="guidance-text">
              <p className="doctor-voice">
                "Excellent! Now I can see you clearly. In the next step, I'll help you position your face so I can get the best view of your eyes."
              </p>
              <div className="what-to-expect">
                <h4>What to expect:</h4>
                <div className="expectation-item">
                  <span className="step-number">1</span>
                  <span>I'll help you align your face in the camera</span>
                </div>
                <div className="expectation-item">
                  <span className="step-number">2</span>
                  <span>We'll scan each eye individually for accuracy</span>
                </div>
                <div className="expectation-item">
                  <span className="step-number">3</span>
                  <span>I'll explain everything as we go</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      buttonText: 'I\'m ready, Dr. AI!',
      onButtonClick: () => navigate('/eye-scan')
    }
  ]

  return (
    <TestLayout
      title={screens[currentScreen]?.title || 'Vision Test Setup'}
      subtitle={screens[currentScreen]?.subtitle || 'Preparing your vision test'}
      currentStep={currentScreen + 1}
      totalSteps={screens.length}
      onExit={() => navigate('/dashboard')}
      fullscreen={false}
      darkMode={true}
    >
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
    </TestLayout>
  )
}

export default StartTest

