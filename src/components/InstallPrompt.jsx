import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InstallPrompt.css'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
      return
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('install_prompt_dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2000) // Show after 2 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show custom instructions
    if (iOS) {
      const dismissed = localStorage.getItem('install_prompt_dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
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
    localStorage.setItem('install_prompt_dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="install-overlay"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="install-prompt"
          >
            <button className="close-button" onClick={handleDismiss}>
              ×
            </button>

            <div className="install-content">
              <div className="install-icon">
                <div className="icon-circle">
                  <span className="icon-emoji">👁️</span>
                </div>
                <div className="icon-badge">+</div>
              </div>

              <h2 className="install-title">Install Quick Optics AI</h2>
              <p className="install-description">
                Get the full app experience with faster access and offline support
              </p>

              <div className="install-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Faster access</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📱</span>
                  <span>Works offline</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔔</span>
                  <span>App-like experience</span>
                </div>
              </div>

              {isIOS ? (
                <div className="ios-instructions">
                  <p className="instructions-title">How to install on iOS:</p>
                  <div className="instructions-steps">
                    <div className="step">
                      <span className="step-number">1</span>
                      <span>Tap the <strong>Share</strong> button</span>
                    </div>
                    <div className="step">
                      <span className="step-number">2</span>
                      <span>Select <strong>Add to Home Screen</strong></span>
                    </div>
                    <div className="step">
                      <span className="step-number">3</span>
                      <span>Tap <strong>Add</strong> to confirm</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="install-actions">
                  <button
                    className="btn-install"
                    onClick={handleInstall}
                  >
                    <span className="btn-icon">📥</span>
                    Install App
                  </button>
                  <button
                    className="btn-dismiss"
                    onClick={handleDismiss}
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InstallPrompt

