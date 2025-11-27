import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InstallPrompt.css'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMinimal, setIsMinimal] = useState(true) // Start with minimal view

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
      return
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Handle beforeinstallprompt event (Chrome/Edge on Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 3000) // Show after 3 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, always show custom instructions after delay
    if (iOS) {
      const iosTimer = setTimeout(() => setShowPrompt(true), 4000)
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(iosTimer)
      }
    } else {
      // For other browsers/platforms, show prompt after delay if not already shown
      const fallbackTimer = setTimeout(() => {
        setShowPrompt(true)
      }, 6000) // Show after 6 seconds as fallback

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
    // Don't save dismissal - show again on next page load
  }

  const expandPrompt = () => {
    setIsMinimal(false)
  }

  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Minimal Banner */}
          {isMinimal ? (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="install-banner"
            >
              <div className="banner-content">
                <div className="banner-icon">
                  <img src="/Logo.jpeg" alt="Quick Optics AI" className="banner-logo" />
                </div>
                <div className="banner-text">
                  <span className="banner-title">Install Quick Optics AI</span>
                  <span className="banner-subtitle">Get faster access & offline support</span>
                </div>
                <div className="banner-actions">
                  <button className="btn-banner-install" onClick={isIOS ? expandPrompt : handleInstall}>
                    {isIOS ? 'How?' : 'Install'}
                  </button>
                  <button className="btn-banner-close" onClick={handleDismiss}>×</button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Full Modal for iOS Instructions */
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
                      <img src="/Logo.jpeg" alt="Quick Optics AI" className="logo-image" />
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

                  <div className="ios-instructions">
                    <p className="instructions-title">How to install on iOS:</p>
                    <div className="instructions-steps">
                      <div className="step">
                        <span className="step-number">1</span>
                        <span>Tap the <strong>Share</strong> button <span className="share-icon">⬆️</span></span>
                      </div>
                      <div className="step">
                        <span className="step-number">2</span>
                        <span>Select <strong>Add to Home Screen</strong> <span className="add-icon">➕</span></span>
                      </div>
                      <div className="step">
                        <span className="step-number">3</span>
                        <span>Tap <strong>Add</strong> to confirm <span className="check-icon">✅</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="install-actions">
                    <button className="btn-dismiss" onClick={handleDismiss}>
                      Got it!
                    </button>
                  </div>
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

