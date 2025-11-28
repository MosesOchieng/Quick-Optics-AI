import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './UserTypeSelection.css'

const UserTypeSelection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showOptions, setShowOptions] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

  useEffect(() => {
    // Show splash/delay before showing options (3 seconds)
    const timer = setTimeout(() => {
      setShowOptions(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (type) => {
    setSelectedType(type)
    
    // Small delay before navigation for better UX
    setTimeout(() => {
      if (type === 'patient') {
        navigate('/user-type-selection', { state: { type: 'patient' } })
      } else if (type === 'clinic') {
        navigate('/user-type-selection', { state: { type: 'clinic' } })
      } else if (type === 'testing') {
        navigate('/start-test')
      }
    }, 300)
  }

  if (!showOptions) {
    return (
      <div className="user-type-splash">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="splash-content"
        >
          <img src="/Logo.jpeg" alt="Quick Optics AI" className="splash-logo" />
          <h1>Quick Optics AI</h1>
          <p>Professional Vision Testing, Simplified</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="user-type-selection">
      <div className="selection-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="selection-header"
        >
          <img src="/Logo.jpeg" alt="Quick Optics AI" className="selection-logo" />
          <h1>Welcome to Quick Optics AI</h1>
          <p>How would you like to proceed?</p>
        </motion.div>

        <div className="selection-options">
          <motion.button
            className={`selection-card ${selectedType === 'patient' ? 'selected' : ''}`}
            onClick={() => handleSelect('patient')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-icon">👤</div>
            <h3>Patient</h3>
            <p>Sign up or login to track your vision health</p>
            <div className="card-actions">
              <button 
                className="btn btn-outline"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/login', { state: { userType: 'patient' } })
                }}
              >
                Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/signup', { state: { userType: 'patient' } })
                }}
              >
                Sign Up
              </button>
            </div>
          </motion.button>

          <motion.button
            className={`selection-card ${selectedType === 'clinic' ? 'selected' : ''}`}
            onClick={() => handleSelect('clinic')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-icon">👨‍⚕️</div>
            <h3>Clinic/Optician</h3>
            <p>Access clinic dashboard and manage patient screenings</p>
            <div className="card-actions">
              <button 
                className="btn btn-outline"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/clinic-login')
                }}
              >
                Clinic Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/clinic-signup')
                }}
              >
                Clinic Sign Up
              </button>
            </div>
          </motion.button>

          <motion.button
            className={`selection-card ${selectedType === 'testing' ? 'selected' : ''}`}
            onClick={() => handleSelect('testing')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-icon">👁️</div>
            <h3>Start Eye Testing</h3>
            <p>Begin your vision assessment immediately</p>
            <div className="card-actions">
              <button 
                className="btn btn-primary btn-full"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/start-test')
                }}
              >
                Get Started
              </button>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default UserTypeSelection
