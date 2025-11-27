import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './SplashScreen.css'

const SplashScreen = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState(0)
  const navigate = useNavigate()

  const screens = [
    {
      background: '/pexels-shvets-production-9773118.jpg',
      title: 'Welcome to Quick Optics AI',
      subtitle: 'Professional Vision Testing, Simplified',
      description: 'Experience cutting-edge AI-powered eye health screening from the comfort of your home.'
    },
    {
      background: '/istockphoto-1305317626-612x612.jpg',
      title: 'Advanced AI Technology',
      subtitle: 'Medical-Grade Analysis',
      description: 'Our AI analyzes your eyes using the same technology trusted by eye care professionals worldwide.'
    },
    {
      background: '/pexels-thirdman-6109552.jpg',
      title: 'Get Started',
      subtitle: 'Choose Your Path',
      description: 'Select how you\'d like to use Quick Optics AI'
    }
  ]

  useEffect(() => {
    if (currentScreen < screens.length - 1) {
      const timer = setTimeout(() => {
        setCurrentScreen(currentScreen + 1)
      }, 3000) // 3 seconds per screen
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  const handleSkip = () => {
    if (onComplete) {
      onComplete()
    } else {
      navigate('/')
    }
  }

  const handleOptionSelect = (option) => {
    if (option === 'home') {
      navigate('/')
    } else if (option === 'clinic') {
      navigate('/login', { state: { userType: 'clinic' } })
    } else if (option === 'testing') {
      navigate('/start-test')
    }
  }

  if (currentScreen === screens.length - 1) {
    return (
      <div className="splash-screen final-screen">
        <div 
          className="splash-background"
          style={{ backgroundImage: `url(${screens[currentScreen].background})` }}
        >
          <div className="splash-overlay"></div>
        </div>
        <div className="splash-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="splash-text"
          >
            <h1 className="splash-title">{screens[currentScreen].title}</h1>
            <p className="splash-subtitle">{screens[currentScreen].subtitle}</p>
            <p className="splash-description">{screens[currentScreen].description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="splash-options"
          >
            <button
              className="splash-option-btn"
              onClick={() => handleOptionSelect('home')}
            >
              <span className="option-icon">🏠</span>
              <span className="option-label">Home</span>
            </button>
            <button
              className="splash-option-btn"
              onClick={() => handleOptionSelect('clinic')}
            >
              <span className="option-icon">👨‍⚕️</span>
              <span className="option-label">Optician/Clinic</span>
            </button>
            <button
              className="splash-option-btn primary"
              onClick={() => handleOptionSelect('testing')}
            >
              <span className="option-icon">👁️</span>
              <span className="option-label">Get Started with Eye Testing</span>
            </button>
          </motion.div>
          
          <button className="splash-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="splash-screen">
      <div 
        className="splash-background"
        style={{ backgroundImage: `url(${screens[currentScreen].background})` }}
      >
        <div className="splash-overlay"></div>
      </div>
      <div className="splash-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="splash-text"
          >
            <h1 className="splash-title">{screens[currentScreen].title}</h1>
            <p className="splash-subtitle">{screens[currentScreen].subtitle}</p>
            <p className="splash-description">{screens[currentScreen].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="splash-indicators">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentScreen ? 'active' : ''}`}
            />
          ))}
        </div>

        <button className="splash-skip" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  )
}

export default SplashScreen


