import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceBot from '../components/VoiceBot'
import './Onboarding.css'

const Onboarding = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      icon: '👁️',
      title: 'Welcome to Quick Optics AI',
      description: 'Get instant vision screening and smart eyewear recommendations — all from your phone.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '/pexels-shvets-production-9773118.jpg'
    },
    {
      icon: '🔍',
      title: 'AI-Powered Vision Testing',
      description: 'Our advanced AI analyzes your vision through quick, easy tests. No appointments needed.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '/pexels-thirdman-6109552.jpg'
    },
    {
      icon: '👓',
      title: 'Find Your Perfect Frames',
      description: 'Get personalized eyewear recommendations based on your face shape and style preferences.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '/istockphoto-1305317626-612x612.jpg'
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      navigate('/login')
    }
  }

  const skipOnboarding = () => {
    navigate('/login')
  }

  return (
    <div className="onboarding">
      <VoiceBot
        mode="onboarding"
        screenContent={{
          title: slides[currentSlide]?.title,
          description: slides[currentSlide]?.description
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="onboarding-slide"
          style={{ background: slides[currentSlide].gradient }}
        >
          <button className="skip-button" onClick={skipOnboarding}>
            Skip
          </button>

          <div className="slide-content">
            {slides[currentSlide].image && (
              <motion.img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="slide-image"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none'
                }}
              />
            )}
            {(!slides[currentSlide].image || slides[currentSlide].image === '') && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="slide-icon"
              >
                {slides[currentSlide].icon}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="slide-title"
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="slide-description"
            >
              {slides[currentSlide].description}
            </motion.p>
          </div>

          <div className="slide-footer">
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                />
              ))}
            </div>

            <button className="next-button" onClick={nextSlide}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Onboarding

