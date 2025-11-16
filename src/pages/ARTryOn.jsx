import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './ARTryOn.css'

const ARTryOn = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isARActive, setIsARActive] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(location.state?.frameId || 1)
  const [isLoading, setIsLoading] = useState(true)

  const frames = [
    { id: 1, name: 'Classic Black', emoji: '🖤' },
    { id: 2, name: 'Tortoise Shell', emoji: '🤎' },
    { id: 3, name: 'Silver Metal', emoji: '⚪' },
    { id: 4, name: 'Athletic Black', emoji: '⚫' },
    { id: 5, name: 'Racing Red', emoji: '🔴' },
    { id: 6, name: 'Blue Performance', emoji: '🔵' },
    { id: 7, name: 'Vintage Brown', emoji: '🟤' },
    { id: 8, name: 'Modern Clear', emoji: '🔲' },
    { id: 9, name: 'Bold Gold', emoji: '🟡' }
  ]

  const currentFrameData = frames.find(f => f.id === currentFrame) || frames[0]

  useEffect(() => {
    startAR()
    return () => {
      stopAR()
    }
  }, [])

  const startAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsARActive(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera for AR try-on. Please check permissions.')
      setIsLoading(false)
    }
  }

  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const handleFrameChange = (frameId) => {
    setCurrentFrame(frameId)
  }

  const handleSave = () => {
    // In real app, this would capture and save the image
    alert('Try-on saved to your profile!')
  }

  const handleBuy = () => {
    // In real app, this would navigate to checkout
    alert('Redirecting to checkout...')
  }

  return (
    <div className="ar-try-on">
      <div className="ar-container">
        <div className="ar-header">
          <button
            className="back-button"
            onClick={() => navigate('/eyewear')}
          >
            ← Back
          </button>
          <h1 className="ar-title">AR Try-On</h1>
          <div className="frame-name-display">{currentFrameData.name}</div>
        </div>

        {isLoading ? (
          <div className="ar-loading">
            <div className="loading-spinner"></div>
            <p>Initializing AR...</p>
          </div>
        ) : (
          <div className="ar-view">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="ar-camera-feed"
              />
              <canvas ref={canvasRef} className="ar-overlay" />
              
              {/* AR Glasses Overlay (simulated) */}
              {isARActive && (
                <div className="glasses-overlay">
                  <div className="glasses-frame" style={{ fontSize: '4rem' }}>
                    {currentFrameData.emoji}
                  </div>
                  <div className="ar-tracking-info">
                    <div className="tracking-dot"></div>
                    <span>Tracking active</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ar-controls">
              <div className="frame-selector">
                <p className="selector-label">Switch Frames</p>
                <div className="frame-thumbnails">
                  {frames.slice(0, 6).map(frame => (
                    <button
                      key={frame.id}
                      className={`frame-thumbnail ${currentFrame === frame.id ? 'active' : ''}`}
                      onClick={() => handleFrameChange(frame.id)}
                    >
                      <span className="thumbnail-emoji">{frame.emoji}</span>
                      <span className="thumbnail-name">{frame.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ar-actions">
                <button
                  className="btn btn-secondary btn-action"
                  onClick={handleSave}
                >
                  💾 Save
                </button>
                <button
                  className="btn btn-primary btn-action"
                  onClick={handleBuy}
                >
                  🛒 Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="ar-instructions">
          <p>💡 Tip: Move your head slowly to see how the glasses align with your face</p>
          <p>Lighting auto-matches your environment for the best try-on experience</p>
        </div>
      </div>
    </div>
  )
}

export default ARTryOn

