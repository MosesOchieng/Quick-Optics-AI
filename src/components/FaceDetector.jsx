import { useRef, useEffect, useState } from 'react'
import './FaceDetector.css'

const FaceDetector = ({ 
  videoRef, 
  onFaceDetected, 
  onFaceLost, 
  onFaceMetrics,
  showOverlay = true,
  adaptiveBoxes = true 
}) => {
  const canvasRef = useRef(null)
  const faceMeshRef = useRef(null)
  const faceMeshReadyRef = useRef(false)
  const animationFrameRef = useRef(null)
  
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceBox, setFaceBox] = useState(null)
  const [eyeBoxes, setEyeBoxes] = useState({ left: null, right: null })
  const [faceMetrics, setFaceMetrics] = useState(null)
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    loadFaceMesh()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
    }
  }, [])

  const loadFaceMesh = async () => {
    if (faceMeshReadyRef.current || typeof window === 'undefined') return

    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
      
      if (!window.FaceMesh) return

      faceMeshRef.current = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      })

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5, // Lower threshold for easier detection
        minTrackingConfidence: 0.3    // Lower threshold for more stable tracking
      })

      faceMeshRef.current.onResults(handleFaceMeshResults)
      faceMeshReadyRef.current = true
      
      startProcessing()
    } catch (error) {
      console.warn('FaceMesh failed to load:', error)
    }
  }

  const startProcessing = () => {
    const processFrame = () => {
      if (videoRef.current && faceMeshRef.current && faceMeshReadyRef.current) {
        const video = videoRef.current
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          faceMeshRef.current.send({ image: video })
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }
    
    animationFrameRef.current = requestAnimationFrame(processFrame)
  }

  const getAlignmentGuidance = (horizontalOffset, verticalOffset) => {
    const threshold = 0.05 // Small movements threshold
    
    if (Math.abs(horizontalOffset) < threshold && Math.abs(verticalOffset) < threshold) {
      return "Perfect! Hold still."
    }
    
    let guidance = []
    
    if (horizontalOffset > threshold) {
      guidance.push("Move slightly left")
    } else if (horizontalOffset < -threshold) {
      guidance.push("Move slightly right")
    }
    
    if (verticalOffset > threshold) {
      guidance.push("Move up a bit")
    } else if (verticalOffset < -threshold) {
      guidance.push("Move down a bit")
    }
    
    return guidance.length > 0 ? guidance.join(" and ") : "Almost there!"
  }

  const handleFaceMeshResults = (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected
      if (faceDetected) {
        setFaceDetected(false)
        setFaceBox(null)
        setEyeBoxes({ left: null, right: null })
        setConfidence(0)
        onFaceLost?.()
      }
      return
    }

    const landmarks = results.multiFaceLandmarks[0]
    
    // Validate we have key facial landmarks
    if (!landmarks[10] || !landmarks[152] || !landmarks[234] || !landmarks[454]) {
      return
    }

    // Calculate face bounding box
    const facePoints = [
      landmarks[10],  // forehead center
      landmarks[152], // chin center
      landmarks[234], // left face
      landmarks[454]  // right face
    ]

    const minX = Math.min(...facePoints.map(p => p.x))
    const maxX = Math.max(...facePoints.map(p => p.x))
    const minY = Math.min(...facePoints.map(p => p.y))
    const maxY = Math.max(...facePoints.map(p => p.y))

    const faceWidth = maxX - minX
    const faceHeight = maxY - minY
    
    // Calculate face box with more generous padding for easier alignment
    const padding = 0.15 // Increased padding
    const paddedFaceBox = {
      x: Math.max(0, minX - faceWidth * padding),
      y: Math.max(0, minY - faceHeight * padding),
      width: Math.min(1, faceWidth * (1 + 2 * padding)),
      height: Math.min(1, faceHeight * (1 + 2 * padding))
    }

    // Calculate alignment guidance
    const faceCenterX = (minX + maxX) / 2
    const faceCenterY = (minY + maxY) / 2
    const screenCenterX = 0.5
    const screenCenterY = 0.5
    
    const horizontalOffset = faceCenterX - screenCenterX
    const verticalOffset = faceCenterY - screenCenterY
    
    // More lenient alignment thresholds
    const alignmentThreshold = 0.15 // Increased from typical 0.1
    const isHorizontallyAligned = Math.abs(horizontalOffset) < alignmentThreshold
    const isVerticallyAligned = Math.abs(verticalOffset) < alignmentThreshold
    const isWellAligned = isHorizontallyAligned && isVerticallyAligned

    setFaceBox(paddedFaceBox)

    // Calculate eye regions
    const leftEyeLandmarks = [
      landmarks[33], landmarks[7], landmarks[163], landmarks[144], landmarks[145],
      landmarks[153], landmarks[154], landmarks[155], landmarks[133], landmarks[173],
      landmarks[157], landmarks[158], landmarks[159], landmarks[160], landmarks[161], landmarks[246]
    ]
    
    const rightEyeLandmarks = [
      landmarks[362], landmarks[382], landmarks[381], landmarks[380], landmarks[374], landmarks[373],
      landmarks[390], landmarks[249], landmarks[263], landmarks[466], landmarks[388], landmarks[387],
      landmarks[386], landmarks[385], landmarks[384], landmarks[398]
    ]

    const calculateEyeBox = (eyeLandmarks) => {
      const eyeMinX = Math.min(...eyeLandmarks.map(p => p.x))
      const eyeMaxX = Math.max(...eyeLandmarks.map(p => p.x))
      const eyeMinY = Math.min(...eyeLandmarks.map(p => p.y))
      const eyeMaxY = Math.max(...eyeLandmarks.map(p => p.y))
      
      const eyeWidth = eyeMaxX - eyeMinX
      const eyeHeight = eyeMaxY - eyeMinY
      const eyePadding = 0.3

      return {
        x: Math.max(0, eyeMinX - eyeWidth * eyePadding),
        y: Math.max(0, eyeMinY - eyeHeight * eyePadding),
        width: Math.min(1, eyeWidth * (1 + 2 * eyePadding)),
        height: Math.min(1, eyeHeight * (1 + 2 * eyePadding))
      }
    }

    const leftEyeBox = calculateEyeBox(leftEyeLandmarks)
    const rightEyeBox = calculateEyeBox(rightEyeLandmarks)

    setEyeBoxes({ left: leftEyeBox, right: rightEyeBox })

    // Calculate face metrics
    const leftIris = landmarks[468]
    const rightIris = landmarks[473]
    const noseTip = landmarks[1]
    const chin = landmarks[152]
    const forehead = landmarks[10]

    const pupilDistance = Math.abs(leftIris.x - rightIris.x)
    const faceHeightMetric = Math.abs(forehead.y - chin.y)
    const faceWidthMetric = Math.abs(landmarks[234].x - landmarks[454].x)

    const metrics = {
      faceWidth: faceWidthMetric,
      faceHeight: faceHeightMetric,
      pupilDistance: pupilDistance,
      leftEye: {
        center: { x: leftIris.x, y: leftIris.y },
        box: leftEyeBox
      },
      rightEye: {
        center: { x: rightIris.x, y: rightIris.y },
        box: rightEyeBox
      },
      faceCenter: {
        x: faceCenterX,
        y: faceCenterY
      },
      alignment: {
        horizontalOffset: horizontalOffset,
        verticalOffset: verticalOffset,
        isHorizontallyAligned: isHorizontallyAligned,
        isVerticallyAligned: isVerticallyAligned,
        isWellAligned: isWellAligned,
        guidance: getAlignmentGuidance(horizontalOffset, verticalOffset)
      },
      landmarks: landmarks
    }

    setFaceMetrics(metrics)

    // Calculate confidence based on landmark quality
    const landmarkConfidence = Math.min(1, landmarks.length / 468)
    const sizeConfidence = Math.min(1, Math.max(0, (faceWidth - 0.1) / 0.4))
    const overallConfidence = (landmarkConfidence + sizeConfidence) / 2

    setConfidence(overallConfidence)

    // Face detected
    if (!faceDetected) {
      setFaceDetected(true)
      onFaceDetected?.(metrics)
    } else {
      onFaceMetrics?.(metrics)
    }
  }

  const renderOverlay = () => {
    if (!showOverlay || !videoRef.current) return null

    const video = videoRef.current
    const videoRect = video.getBoundingClientRect()

    return (
      <div 
        className="face-detector-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {/* Face bounding box */}
        {faceBox && (
          <div
            className={`face-box ${faceDetected ? 'detected' : ''}`}
            style={{
              position: 'absolute',
              left: `${faceBox.x * 100}%`,
              top: `${faceBox.y * 100}%`,
              width: `${faceBox.width * 100}%`,
              height: `${faceBox.height * 100}%`,
              border: `2px solid ${faceDetected ? '#00ff00' : '#ff0000'}`,
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="face-confidence">
              {Math.round(confidence * 100)}%
            </div>
          </div>
        )}

        {/* Eye boxes */}
        {adaptiveBoxes && eyeBoxes.left && (
          <div
            className="eye-box left-eye-box"
            style={{
              position: 'absolute',
              left: `${eyeBoxes.left.x * 100}%`,
              top: `${eyeBoxes.left.y * 100}%`,
              width: `${eyeBoxes.left.width * 100}%`,
              height: `${eyeBoxes.left.height * 100}%`,
              border: '1px solid #00ffff',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {adaptiveBoxes && eyeBoxes.right && (
          <div
            className="eye-box right-eye-box"
            style={{
              position: 'absolute',
              left: `${eyeBoxes.right.x * 100}%`,
              top: `${eyeBoxes.right.y * 100}%`,
              width: `${eyeBoxes.right.width * 100}%`,
              height: `${eyeBoxes.right.height * 100}%`,
              border: '1px solid #00ffff',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {/* Pupil indicators */}
        {faceMetrics && (
          <>
            <div
              className="pupil-indicator left-pupil"
              style={{
                position: 'absolute',
                left: `${faceMetrics.leftEye.center.x * 100}%`,
                top: `${faceMetrics.leftEye.center.y * 100}%`,
                width: '4px',
                height: '4px',
                backgroundColor: '#ff00ff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.1s ease'
              }}
            />
            <div
              className="pupil-indicator right-pupil"
              style={{
                position: 'absolute',
                left: `${faceMetrics.rightEye.center.x * 100}%`,
                top: `${faceMetrics.rightEye.center.y * 100}%`,
                width: '4px',
                height: '4px',
                backgroundColor: '#ff00ff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.1s ease'
              }}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
      {renderOverlay()}
    </>
  )
}

export default FaceDetector
