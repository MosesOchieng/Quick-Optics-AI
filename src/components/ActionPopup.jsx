import { motion, AnimatePresence } from 'framer-motion'
import './ActionPopup.css'

const ActionPopup = ({ 
  isOpen, 
  onClose, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  icon,
  actions = []
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      default:
        return 'ℹ'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="action-popup-overlay" onClick={handleBackdropClick}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className={`action-popup action-popup-${type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popup-icon-container">
              <div className={`popup-icon popup-icon-${type}`}>
                {getIcon()}
              </div>
            </div>
            
            {title && (
              <h3 className="popup-title">{title}</h3>
            )}
            
            {message && (
              <p className="popup-message">{message}</p>
            )}

            {actions.length > 0 && (
              <div className="popup-actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`popup-action-btn ${action.variant || 'primary'}`}
                    onClick={() => {
                      if (action.onClick) action.onClick()
                      if (action.closeOnClick !== false) onClose()
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {actions.length === 0 && (
              <button
                className="popup-close-btn"
                onClick={onClose}
              >
                Got it
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ActionPopup

