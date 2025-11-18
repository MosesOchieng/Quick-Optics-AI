import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Toast.css'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onClose) onClose()
      }, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`toast toast-${type}`}
        >
          <div className="toast-content">
            <div className="toast-icon">
              {type === 'success' && '✓'}
              {type === 'error' && '✕'}
              {type === 'info' && 'ℹ'}
              {type === 'warning' && '⚠'}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={handleClose}>
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast

