import { motion, AnimatePresence } from 'framer-motion'
import './ConfirmationDialog.css'

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default', 'danger', 'warning'
  loading = false
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="confirmation-dialog-overlay" onClick={handleBackdropClick}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`confirmation-dialog ${variant}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h2 className="dialog-title">{title}</h2>
              {!loading && (
                <button className="dialog-close" onClick={onClose} aria-label="Close">
                  ×
                </button>
              )}
            </div>

            <div className="dialog-content">
              <p className="dialog-message">{message}</p>
            </div>

            <div className="dialog-actions">
              <button
                className="dialog-btn cancel"
                onClick={onClose}
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                className={`dialog-btn confirm ${variant}`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationDialog

