import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import cvie from '../services/CVIE'
import AIFeedback from '../components/AIFeedback'
import CVIEIndicator from '../components/CVIEIndicator'
import VoiceBot from '../components/VoiceBot'
import './EyeScan.css'

const EyeScan = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const captureIntervalRef = useRef(null)
  const lastFrameRef = useRef(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [isAligned, setIsAligned] = useState(false)
  const [aiMessage, setAiMessage] = useState('Look straight at the screen. Hold still.')
  const [scanData, setScanData] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [capturedFrames, setCapturedFrames] = useState([])
  const [currentConditionIndex, setCurrentConditionIndex] = useState(0)

  const conditionImages = [
    {
      id: 'healthy',
      label: 'Healthy reference eye',
      src: '/pexels-thirdman-6109552.jpg'
    },
    {
      id: 'screen-strain',
      label: 'Screen strain example',
      src: '/pexels-shvets-production-9773118.jpg'
    },
    {
      id: 'sample',
      label: 'Sample eye scan pattern',
      src: '/istockphoto-1305317626-612x612.jpg'
    }
  ]

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Rotate through condition image database for visual explanation
    const interval = setInterval(() => {
      setCurrentConditionIndex((prev) => (prev + 1) % conditionImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      // Simulate face alignment detection
      setTimeout(() => {
        setIsAligned(true)
        setAiMessage('Perfect alignment! Starting scan...')
      }, 2000)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const startScan = () => {
    setIsScanning(true)
    setScanProgress(0)
    setCapturedFrames([])
    setAiMessage('Scanning your eyes...')

    // Collect scan data for AI analysis
    const collectScanData = () => {
      // Simulate eye data collection
      const data = {
        eyePosition: { x: 0.5, y: 0.5 },
        movements: Array.from({ length: 10 }, () => ({
          speed: Math.random() * 3,
          amplitude: Math.random() * 0.3
        })),
        lighting: {
          brightness: 0.7,
          consistency: 0.85
        },
        imageData: {
          sharpness: 0.88,
          exposure: 0.75
        },
        blinks: Array.from({ length: 3 }, (_, i) => ({
          timestamp: Date.now() - (3 - i) * 2000
        })),
        gazePoints: Array.from({ length: 20 }, () => ({
          x: 0.5 + (Math.random() - 0.5) * 0.1,
          y: 0.5 + (Math.random() - 0.5) * 0.1
        }))
      }
      setScanData(data)

      // Analyze patterns with CVIE
      const patterns = cvie.analyzePatterns(data)
      setAiInsights(patterns)

      // Calculate confidence
      const confidenceData = cvie.calculateConfidence(data)
      setConfidence(confidenceData)

      // Build baseline if first scan
      if (!cvie.userBaseline) {
        cvie.buildBaseline({
          focusSpeed: 0.6,
          blinkPattern: data.blinks.map(b => b.timestamp),
          gazeStability: 0.85,
          lightAdaptation: 0.3,
          headMovement: 0.1,
          reactionTimes: [280, 290, 275, 285]
        })
      }
    }

    collectScanData()

    // Start capturing pupil snapshots during the scan
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      captureIntervalRef.current = setInterval(() => {
        if (!video.videoWidth || !video.videoHeight) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          lastFrameRef.current = dataUrl
          setCapturedFrames(prev => {
            if (prev.length >= 3) return prev
            return [...prev, dataUrl]
          })
        } catch (e) {
          console.error('Error capturing frame', e)
        }
      }, 1500)
    }

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current)
          }

          ;(async () => {
            // Calculate final AI comparison
            const comparison = cvie.comparePerformance({
              reactionTime: 285,
              focusScore: 82,
              stability: 85,
              colorScore: 88
            }, 30, 'mid-range')

            // Use last captured frame to "train-style" compare against dataset
            let conditionResult = { matches: [], usedDataset: false }
            try {
              if (lastFrameRef.current) {
                conditionResult = await cvie.compareEyeImage(lastFrameRef.current)
              }
            } catch (e) {
              console.warn('EyeScan: condition comparison failed', e)
            }

            // Save to storage for later use
            localStorage.setItem('cvie_analysis', JSON.stringify({
              baseline: cvie.userBaseline,
              comparison,
              patterns: aiInsights,
              conditionMatches: conditionResult.matches,
              timestamp: new Date().toISOString()
            }))

            setTimeout(() => {
              navigate('/vision-tests', { 
                state: { 
                  aiAnalysis: {
                    ...comparison,
                    conditionMatches: conditionResult.matches
                  }
                } 
              })
            }, 1000)
          })()

          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  useEffect(() => {
    if (isAligned && !isScanning) {
      // Trigger voice bot questions before starting scan
      if (window.voiceBot && window.voiceBot.startQuestions) {
        setTimeout(() => {
          window.voiceBot.startQuestions()
        }, 500)
      }
      
      const timer = setTimeout(() => {
        startScan()
      }, 3000) // Give time for questions
      return () => clearTimeout(timer)
    }
  }, [isAligned])

  return (
    <div className="eye-scan">
      <div className="scan-container">
        <div className="camera-view">
          {/* Live camera preview for video-based analysis */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
          />
          {/* Canvas reserved for computer-vision processing (eye detection, brightness, etc.) */}
          <canvas ref={canvasRef} className="scan-overlay" />

          {/* Face alignment frame */}
          <div className={`alignment-rectangle ${isAligned ? 'aligned' : ''}`}>
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>

          {/* Eye alignment circles */}
          <div className="eye-overlay">
            <div className="eye-marker left-eye"></div>
            <div className="eye-marker right-eye"></div>
          </div>

          {/* 3D Scanning Line */}
          {isScanning && (
            <motion.div
              className="scan-line-3d"
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}

          {/* Progress Indicator */}
          {isScanning && (
            <div className="scan-progress-container">
              <div className="progress-bar-scan">
                <div
                  className="progress-fill-scan"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="progress-text">{scanProgress}%</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="scan-status">
          <p>{aiMessage}</p>
        </div>

        {/* Scientific-style metrics panel */}
        {scanData && (
          <div className="scan-metrics">
            <div className="metric-group">
              <span className="metric-label">Brightness</span>
              <span className="metric-value">
                {Math.round((scanData.lighting?.brightness || 0) * 100)}%
              </span>
            </div>
            <div className="metric-group">
              <span className="metric-label">Lighting Stability</span>
              <span className="metric-value">
                {Math.round((scanData.lighting?.consistency || 0) * 100)}%
              </span>
            </div>
            <div className="metric-group">
              <span className="metric-label">Gaze Stability</span>
              <span className="metric-value">
                {scanData.gazePoints ? `${scanData.gazePoints.length} points` : '--'}
              </span>
            </div>
            <div className="metric-group">
              <span className="metric-label">Blink Events</span>
              <span className="metric-value">
                {scanData.blinks ? scanData.blinks.length : 0}
              </span>
            </div>
          </div>
        )}

        {/* Captured pupil snapshots */}
        {capturedFrames.length > 0 && (
          <div className="captured-frames">
            <h3>Pupil snapshots during scan</h3>
            <div className="captured-grid">
              {capturedFrames.map((frame, index) => (
                <div key={index} className="captured-frame">
                  <img src={frame} alt={`Pupil snapshot ${index + 1}`} />
                  <span className="captured-label">Frame {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condition image database viewer */}
        <div className="condition-gallery">
          <div className="condition-current">
            <h3>AI condition database</h3>
            <p className="condition-subtitle">
              Comparing your live pupil snapshots with reference eye patterns over time.
            </p>
            <div className="condition-image-wrapper">
              <img
                src={conditionImages[currentConditionIndex].src}
                alt={conditionImages[currentConditionIndex].label}
                className="condition-image"
              />
              <div className="condition-caption">
                {conditionImages[currentConditionIndex].label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CVIE Indicator (confidence based on computer-vision features) */}
      {isScanning && (
        <CVIEIndicator isActive={true} confidence={confidence} />
      )}

      {/* AI Feedback Component */}
      {scanData && (
        <AIFeedback 
          scanData={scanData}
          onAdjustment={(adjustment) => {
            setAiMessage(adjustment.message)
            // Send feedback to bot
            if (window.quickOpticsBot) {
              window.quickOpticsBot.provideFeedback('alignment', adjustment)
            }
          }}
        />
      )}

          {/* Voice Bot */}
          <VoiceBot
            mode="test"
            testType="eye-scan"
            screenContent={{
              title: 'Eye Scan',
              description: aiMessage
            }}
          />
    </div>
  )
}

export default EyeScan

