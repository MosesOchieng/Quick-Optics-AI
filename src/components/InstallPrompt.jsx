import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InstallPrompt.css'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
      return
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) { // Don't show again for 7 days
        return
      }
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Handle beforeinstallprompt event (Chrome/Edge on Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 5000) // Show after 5 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show after delay
    if (iOS) {
      const iosTimer = setTimeout(() => setShowPrompt(true), 8000) // Show after 8 seconds on iOS
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(iosTimer)
      }
    } else {
      // For other browsers, show as fallback
      const fallbackTimer = setTimeout(() => {
        setShowPrompt(true)
      }, 10000) // Show after 10 seconds as fallback

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(fallbackTimer)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('install-prompt-dismissed', Date.now().toString())
  }

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
  }

  if (isStandalone || !showPrompt || isDismissed) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {!isExpanded ? (
            /* Small Floating Prompt */
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="install-floating-prompt"
            >
              <div className="floating-content">
                <div className="floating-icon">
                  <img src="/Logo.jpeg" alt="Quick Optics AI" className="floating-logo" />
                  <div className="install-badge">+</div>
                </div>
                <div className="floating-text">
                  <div className="floating-title">Install App</div>
                  <div className="floating-subtitle">Quick access & offline mode</div>
                </div>
                <div className="floating-actions">
                  <button 
                    className="btn-floating-install" 
                    onClick={isIOS ? handleExpand : handleInstall}
                    title={isIOS ? 'Show install instructions' : 'Install app'}
                  >
                    {isIOS ? '?' : '↓'}
                  </button>
                  <button 
                    className="btn-floating-close" 
                    onClick={handleDismiss}
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Expanded iOS Instructions */
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="install-overlay"
                onClick={handleCollapse}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="install-modal"
              >
                <div className="modal-header">
                  <div className="modal-icon">
                    <img src="/Logo.jpeg" alt="Quick Optics AI" className="modal-logo" />
                  </div>
                  <button className="modal-close" onClick={handleCollapse}>×</button>
                </div>

                <div className="modal-content">
                  <h3 className="modal-title">Install Quick Optics AI</h3>
                  <p className="modal-description">
                    Add to your home screen for faster access and offline support
                  </p>

                  <div className="install-steps">
                    <div className="step-item">
                      <div className="step-icon">⬆️</div>
                      <div className="step-text">
                        <div className="step-title">Tap Share</div>
                        <div className="step-desc">Find the share button in Safari</div>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-icon">➕</div>
                      <div className="step-text">
                        <div className="step-title">Add to Home Screen</div>
                        <div className="step-desc">Select from the share menu</div>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-icon">✅</div>
                      <div className="step-text">
                        <div className="step-title">Confirm</div>
                        <div className="step-desc">Tap "Add" to install</div>
                      </div>
                    </div>
                  </div>

                  <button className="btn-modal-dismiss" onClick={handleDismiss}>
                    Got it!
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

export default InstallPrompt

