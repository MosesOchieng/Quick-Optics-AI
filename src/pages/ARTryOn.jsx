import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FaceDetector from '../components/FaceDetector'
import TestLayout from '../components/TestLayout'
import './ARTryOn.css'

const ARTryOn = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceMetrics, setFaceMetrics] = useState(null)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [currentCategory, setCurrentCategory] = useState('recommended')
  const [cameraActive, setCameraActive] = useState(false)
  const [userPrescription, setUserPrescription] = useState(null)

  // Get user's prescription from test results
  useEffect(() => {
    const testResults = location.state?.testResults || JSON.parse(localStorage.getItem('latest_test_results') || '{}')
    if (testResults) {
      setUserPrescription(testResults)
    }
  }, [location.state])

  // Frame categories and data
  const frameCategories = {
    recommended: {
      title: 'Recommended for You',
      description: 'Based on your vision test results',
      frames: [
        {
          id: 'classic-1',
          name: 'Classic Professional',
          brand: 'VisionPro',
          price: 149,
          image: '/frames/classic-professional.png',
          overlay: '/frames/overlays/classic-professional-overlay.png',
          features: ['Anti-glare coating', 'Blue light filter', 'Scratch resistant'],
          suitableFor: ['Myopia', 'Office work', 'Screen use'],
          prescription: { sphere: [-1, -6], cylinder: [-0.5, -2] }
        },
        {
          id: 'modern-1',
          name: 'Modern Minimalist',
          brand: 'ClearVision',
          price: 199,
          image: '/frames/modern-minimalist.png',
          overlay: '/frames/overlays/modern-minimalist-overlay.png',
          features: ['Lightweight titanium', 'Flexible hinges', 'UV protection'],
          suitableFor: ['Hyperopia', 'Active lifestyle', 'All-day wear'],
          prescription: { sphere: [1, 6], cylinder: [-0.5, -1] }
        }
      ]
    },
    trending: {
      title: 'Trending Styles',
      description: 'Popular choices this month',
      frames: [
        {
          id: 'trendy-1',
          name: 'Retro Round',
          brand: 'StyleFrame',
          price: 179,
          image: '/frames/retro-round.png',
          overlay: '/frames/overlays/retro-round-overlay.png',
          features: ['Vintage design', 'Premium acetate', 'Adjustable nose pads'],
          suitableFor: ['Fashion', 'Creative professionals', 'Young adults']
        },
        {
          id: 'trendy-2',
          name: 'Bold Square',
          brand: 'UrbanLook',
          price: 159,
          image: '/frames/bold-square.png',
          overlay: '/frames/overlays/bold-square-overlay.png',
          features: ['Statement design', 'Durable frame', 'Multiple colors'],
          suitableFor: ['Strong prescription', 'Bold style', 'Professionals']
        }
      ]
    },
    budget: {
      title: 'Budget Friendly',
      description: 'Quality frames under $100',
      frames: [
        {
          id: 'budget-1',
          name: 'Essential Classic',
          brand: 'ValueVision',
          price: 79,
          image: '/frames/essential-classic.png',
          overlay: '/frames/overlays/essential-classic-overlay.png',
          features: ['Basic coating', 'Comfortable fit', '1-year warranty'],
          suitableFor: ['First-time wearers', 'Backup glasses', 'Students']
        },
        {
          id: 'budget-2',
          name: 'Simple Style',
          brand: 'EcoFrames',
          price: 89,
          image: '/frames/simple-style.png',
          overlay: '/frames/overlays/simple-style-overlay.png',
          features: ['Eco-friendly materials', 'Lightweight', 'Basic UV protection'],
          suitableFor: ['Casual wear', 'Reading', 'Everyday use']
        }
      ]
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Camera access is required for AR try-on. Please enable camera permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      setCameraActive(false)
    }
  }

  const selectFrame = (frame) => {
    setSelectedFrame(frame)
  }

  const addToCart = () => {
    // Simulate adding to cart
    const cartItem = {
      ...selectedFrame,
      prescription: userPrescription,
      addedAt: new Date().toISOString()
    }
    
    // Store in localStorage (in real app, would send to backend)
    const cart = JSON.parse(localStorage.getItem('glasses_cart') || '[]')
    cart.push(cartItem)
    localStorage.setItem('glasses_cart', JSON.stringify(cart))
    
    alert(`${selectedFrame.name} added to cart! Prescription details included.`)
  }

  const renderFrameOverlay = () => {
    if (!selectedFrame || !faceDetected || !faceMetrics) return null

    const { leftEye, rightEye, faceCenter } = faceMetrics
    if (!leftEye || !rightEye) return null

    // Calculate frame position and size based on face metrics
    const frameWidth = Math.abs(leftEye.center.x - rightEye.center.x) * 2.5 // Wider than eye distance
    const frameHeight = frameWidth * 0.4 // Typical glasses aspect ratio
    const frameX = faceCenter.x - frameWidth / 2
    const frameY = leftEye.center.y - frameHeight / 2

    return (
      <div
        className="frame-overlay"
        style={{
          position: 'absolute',
          left: `${frameX * 100}%`,
          top: `${frameY * 100}%`,
          width: `${frameWidth * 100}%`,
          height: `${frameHeight * 100}%`,
          backgroundImage: `url(${selectedFrame.overlay})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    )
  }

  return (
    <TestLayout
      title="AR Frame Try-On"
      description="See how glasses look on you with augmented reality"
      onExit={() => navigate('/dashboard')}
    >
      <div className="ar-tryon-page">
        <div className="tryon-container">
          {/* Camera View */}
          <div className="camera-section">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-feed"
              />
              
              {/* Face Detection */}
              <FaceDetector
                videoRef={videoRef}
                onFaceDetected={setFaceDetected}
                onFaceMetrics={setFaceMetrics}
                showOverlay={true}
              />

              {/* Frame Overlay */}
              {renderFrameOverlay()}

              {/* Camera Status */}
              <div className="camera-status">
                {!cameraActive && (
                  <div className="status-message">
                    <p>📷 Starting camera...</p>
                  </div>
                )}
                {cameraActive && !faceDetected && (
                  <div className="status-message">
                    <p>👤 Position your face in the camera</p>
                  </div>
                )}
                {faceDetected && !selectedFrame && (
                  <div className="status-message">
                    <p>✨ Perfect! Now select a frame to try on</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Frame Info */}
            {selectedFrame && (
              <motion.div
                className="selected-frame-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="frame-details">
                  <h3>{selectedFrame.name}</h3>
                  <p className="brand">{selectedFrame.brand}</p>
                  <p className="price">${selectedFrame.price}</p>
                </div>
                <div className="frame-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={addToCart}
                    disabled={!faceDetected}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSelectedFrame(null)}
                  >
                    Try Another
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Frame Selection */}
          <div className="frames-section">
            <div className="category-tabs">
              {Object.entries(frameCategories).map(([key, category]) => (
                <button
                  key={key}
                  className={`category-tab ${currentCategory === key ? 'active' : ''}`}
                  onClick={() => setCurrentCategory(key)}
                >
                  {category.title}
                </button>
              ))}
            </div>

            <div className="category-description">
              <p>{frameCategories[currentCategory].description}</p>
            </div>

            <div className="frames-grid">
              <AnimatePresence mode="wait">
                {frameCategories[currentCategory].frames.map((frame, index) => (
                  <motion.div
                    key={frame.id}
                    className={`frame-card ${selectedFrame?.id === frame.id ? 'selected' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => selectFrame(frame)}
                  >
                    <div className="frame-image">
                      <img src={frame.image} alt={frame.name} />
                      {selectedFrame?.id === frame.id && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                    <div className="frame-info">
                      <h4>{frame.name}</h4>
                      <p className="brand">{frame.brand}</p>
                      <p className="price">${frame.price}</p>
                      <div className="features">
                        {frame.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Prescription Info */}
        {userPrescription && (
          <div className="prescription-info">
            <h3>Your Prescription</h3>
            <div className="prescription-details">
              <div className="eye-prescription">
                <span>Left Eye:</span>
                <span>SPH: {userPrescription.leftEye?.sphere || 'N/A'}</span>
                <span>CYL: {userPrescription.leftEye?.cylinder || 'N/A'}</span>
              </div>
              <div className="eye-prescription">
                <span>Right Eye:</span>
                <span>SPH: {userPrescription.rightEye?.sphere || 'N/A'}</span>
                <span>CYL: {userPrescription.rightEye?.cylinder || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TestLayout>
  )
}

export default ARTryOn