import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './PatientAuthModal.css'

const PatientAuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('signup') // 'login' or 'signup'

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleNavigate = (path) => {
    onClose()
    setTimeout(() => {
      navigate(path)
    }, 200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="patient-auth-modal-overlay" onClick={handleBackdropClick}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="patient-auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-logo-container">
                <img src="/Logo.jpeg" alt="Quick Optics AI" className="modal-logo-img" />
                <h2>Quick Optics AI</h2>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
              <button
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
            </div>

            <div className="modal-content">
              {activeTab === 'signup' ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="tab-content"
                >
                  <h3>Create Your Account</h3>
                  <p>Start your vision health journey today</p>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleNavigate('/signup')}
                  >
                    Sign Up as Patient
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="tab-content"
                >
                  <h3>Welcome Back</h3>
                  <p>Sign in to continue your vision journey</p>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleNavigate('/login')}
                  >
                    Login as Patient
                  </button>
                </motion.div>
              )}
            </div>

            <div className="modal-footer">
              <p>
                Are you an optician or clinic?{' '}
                <button
                  className="link-btn"
                  onClick={() => handleNavigate('/clinic-login')}
                >
                  Optician/Clinic Access
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PatientAuthModal

