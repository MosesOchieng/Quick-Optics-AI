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
  const lastUpdateRef = useRef(0)
  const updateThrottleMs = 100 // Throttle state updates to every 100ms
  const lastVideoRefLog = useRef(0)
  const lastFaceMeshLog = useRef(0)
  const processingActiveRef = useRef(false)

  useEffect(() => {
    loadFaceMesh()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Don't close the global instance - other components might be using it
      // Only close if this is the only instance
      if (faceMeshRef.current && window.__faceMeshInstance === faceMeshRef.current) {
        // Check if there are other FaceDetector components
        const otherDetectors = document.querySelectorAll('.face-detector-overlay')
        if (otherDetectors.length <= 1) {
          faceMeshRef.current.close()
          window.__faceMeshInstance = null
        }
      }
    }
  }, [])

  const loadFaceMesh = async () => {
    // Prevent multiple initializations - use global flag
    if (faceMeshReadyRef.current || typeof window === 'undefined') return
    
    // Suppress MediaPipe dependency warnings during initialization
    const originalWarn = console.warn
    const suppressDependencyWarnings = () => {
      console.warn = (...args) => {
        const message = args.join(' ')
        // Suppress MediaPipe dependency loading messages
        if (message.includes('still waiting on run dependencies') || 
            message.includes('dependency:') ||
            message.includes('end of list')) {
          return // Suppress these messages
        }
        originalWarn.apply(console, args)
      }
    }
    
    suppressDependencyWarnings()
    
    // Restore console.warn after initialization
    const restoreConsole = () => {
      setTimeout(() => {
        console.warn = originalWarn
      }, 5000) // Restore after 5 seconds
    }
    
    if (window.__faceMeshInitializing) {
      console.log('FaceDetector: MediaPipe already initializing, waiting...')
      // Wait for existing initialization
      let attempts = 0
      while (window.__faceMeshInitializing && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      if (window.__faceMeshInstance) {
        faceMeshRef.current = window.__faceMeshInstance
        faceMeshRef.current.onResults(handleFaceMeshResults)
        faceMeshReadyRef.current = true
        console.log('FaceDetector: Using existing MediaPipe instance')
        startProcessing()
        return
      }
    }

    const loadScript = (src) => new Promise((resolve, reject) => {
      // Check if script already loaded
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })

    try {
      window.__faceMeshInitializing = true
      console.log('FaceDetector: Loading MediaPipe FaceMesh...')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
      
      if (!window.FaceMesh) {
        console.error('FaceDetector: FaceMesh not available after script load')
        window.__faceMeshInitializing = false
        return
      }

      console.log('FaceDetector: Creating FaceMesh instance...')
      
      // Fix for MediaPipe Module.arguments error
      // MediaPipe uses Emscripten which manages Module internally
      // We must NOT touch Module.arguments or Module.arguments_ - let MediaPipe handle it
      // The error occurs when we try to access Module.arguments after MediaPipe has initialized
      
      // Wait for MediaPipe script to fully load
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Additional wait for WASM and model files to be ready
      let dependencyWaitAttempts = 0
      while (dependencyWaitAttempts < 30) {
        if (window.FaceMesh && typeof window.FaceMesh === 'function') {
          break
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        dependencyWaitAttempts++
      }
      
      try {
      // Create FaceMesh - MediaPipe will handle Module setup internally
      // Do NOT access or modify window.Module before or after this
      faceMeshRef.current = new window.FaceMesh({
        locateFile: (file) => {
          // Handle different file types and paths
          if (file.includes('.tflite')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          } else if (file.includes('.wasm')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          } else if (file.includes('.data')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          } else if (file.includes('.binarypb')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          }
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
        // Add error handler for dependency loading
        onError: (error) => {
          // Suppress dependency loading warnings - they're normal during initialization
          if (!error.message || !error.message.includes('dependency')) {
            console.warn('FaceDetector: MediaPipe error:', error)
          }
        }
      })
        // Store globally to prevent multiple instances
        window.__faceMeshInstance = faceMeshRef.current
      } catch (initError) {
        console.error('FaceDetector: Error initializing FaceMesh:', initError)
        window.__faceMeshInitializing = false
        // Don't retry - let it fail gracefully
        console.warn('FaceDetector: Continuing without face detection')
        return
      }

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false, // Disable refined landmarks to reduce memory (saves ~30% memory)
        minDetectionConfidence: 0.2, // Lower threshold to ensure face detection works
        minTrackingConfidence: 0.2,  // Lower threshold to ensure tracking works
        selfieMode: true             // Mirror the input for front-facing camera
      })

      faceMeshRef.current.onResults(handleFaceMeshResults)
      faceMeshReadyRef.current = true
      window.__faceMeshInitializing = false
      
      console.log('FaceDetector: MediaPipe FaceMesh initialized successfully')
      restoreConsole() // Restore console after successful initialization
      
      // Start processing after a short delay to ensure video is ready
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log('FaceDetector: Starting face detection processing')
          startProcessing()
        } else {
          console.log('FaceDetector: Waiting for video to be ready...')
          // Wait for video to be ready
          const checkVideo = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              console.log('FaceDetector: Video ready, starting processing')
              clearInterval(checkVideo)
              startProcessing()
            }
          }, 100)
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkVideo)
            console.log('FaceDetector: Starting processing anyway (timeout)')
            startProcessing()
          }, 5000)
        }
      }, 300)
    } catch (error) {
      restoreConsole() // Restore console on error
      console.error('FaceDetector: FaceMesh failed to load:', error)
      // Try to provide helpful error information
      if (error.message && error.message.includes('network')) {
        console.error('Network error - check internet connection')
      } else if (error.message && error.message.includes('CORS')) {
        console.error('CORS error - MediaPipe CDN may be blocked')
      }
    }
  }

  const startProcessing = () => {
    if (processingActiveRef.current) return // Prevent multiple processing loops
    processingActiveRef.current = true
    
    let lastProcessTime = 0
    // Balanced throttle for mobile/low-end devices - process every 300ms (~3fps)
    // This reduces memory usage while still allowing face detection to work
    const throttleMs = 300
    
    // Create a smaller canvas for downscaling to reduce memory
    const processCanvas = document.createElement('canvas')
    const processCtx = processCanvas.getContext('2d')
    const MAX_PROCESS_WIDTH = 320 // Maximum width for processing (reduces memory by ~10x)
    const MAX_PROCESS_HEIGHT = 240 // Maximum height for processing
    
    const processFrame = (timestamp) => {
      // Throttle processing to prevent freezing and reduce memory usage
      if (timestamp - lastProcessTime < throttleMs) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
        return
      }
      
      lastProcessTime = timestamp
      
      // Check if video ref is available and valid
      if (!videoRef.current) {
        // Video not mounted yet - continue checking but don't process
        animationFrameRef.current = requestAnimationFrame(processFrame)
        return
      }
      
      // Check if video is actually ready
      if (videoRef.current.readyState < 2) {
        // Video not loaded yet - continue checking
        animationFrameRef.current = requestAnimationFrame(processFrame)
        return
      }
      
      if (faceMeshRef.current && faceMeshReadyRef.current) {
        const video = videoRef.current
        // Process when video is ready
        if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          // Try to use video directly first (better detection), fallback to downscaled if needed
          try {
            // Send video directly for better face detection accuracy
            faceMeshRef.current.send({ image: video })
          } catch (error) {
            // If direct video fails, use downscaled version
            console.log('FaceDetector: Using downscaled frame for processing')
            const videoAspect = video.videoWidth / video.videoHeight
            let processWidth = Math.min(video.videoWidth, MAX_PROCESS_WIDTH)
            let processHeight = Math.min(video.videoHeight, MAX_PROCESS_HEIGHT)
            
            // Maintain aspect ratio
            if (processWidth / processHeight > videoAspect) {
              processWidth = processHeight * videoAspect
            } else {
              processHeight = processWidth / videoAspect
            }
            
            // Only resize canvas if dimensions changed
            if (processCanvas.width !== processWidth || processCanvas.height !== processHeight) {
              processCanvas.width = processWidth
              processCanvas.height = processHeight
            }
            
            // Draw downscaled frame
            processCtx.drawImage(video, 0, 0, processWidth, processHeight)
            
            // Send downscaled image to MediaPipe
            try {
              faceMeshRef.current.send({ image: processCanvas })
            } catch (sendError) {
              console.error('FaceDetector: Error sending downscaled frame:', sendError)
            }
          }
        } else {
          // Video not ready - silently continue
        }
      } else {
        // FaceMesh not ready yet - silently continue checking
        // Only log once every 5 seconds to reduce console noise
        const now = Date.now()
        if (!videoRef.current && (!lastVideoRefLog.current || now - lastVideoRefLog.current > 5000)) {
          lastVideoRefLog.current = now
          // Video ref will be available when video element is mounted - this is normal
        }
        if (!faceMeshRef.current && (!lastFaceMeshLog.current || now - lastFaceMeshLog.current > 5000)) {
          lastFaceMeshLog.current = now
          // FaceMesh still initializing - this is normal during startup
        }
      }
      // Continue processing with throttling
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }
    
    // Start processing with delay to allow initialization
    // Only start if video ref is available
    const startWhenReady = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
      } else {
        // Check again in 100ms
        setTimeout(startWhenReady, 100)
      }
    }
    setTimeout(startWhenReady, 500)
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
    // Throttle updates to prevent freezing
    const now = Date.now()
    if (now - lastUpdateRef.current < updateThrottleMs && faceDetected) {
      return // Skip this update - too frequent
    }
    lastUpdateRef.current = now
    
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected
      if (faceDetected) {
        console.log('FaceDetector: Face lost')
        setFaceDetected(false)
        setFaceBox(null)
        setEyeBoxes({ left: null, right: null })
        setConfidence(0)
        onFaceLost?.()
      }
      return
    }

    const landmarks = results.multiFaceLandmarks[0]
    
    // Very lenient validation - accept face with minimal landmarks for instant detection
    // Only require basic landmarks to be present
    if (!landmarks || landmarks.length < 10) {
      return
    }
    
    // Use more lenient landmark checks - accept if we have any face landmarks
    const hasBasicLandmarks = landmarks[10] || landmarks[152] || landmarks[234] || landmarks[454] || landmarks[0]
    if (!hasBasicLandmarks) {
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
    
    // Very lenient alignment thresholds for instant detection
    const alignmentThreshold = 0.25 // Much more lenient - detects faster
    const isHorizontallyAligned = Math.abs(horizontalOffset) < alignmentThreshold
    const isVerticallyAligned = Math.abs(verticalOffset) < alignmentThreshold
    const isWellAligned = isHorizontallyAligned && isVerticallyAligned

    setFaceBox(paddedFaceBox)

    // Calculate eye regions - use more landmarks for better detection
    // Filter out undefined landmarks for robustness
    const leftEyeLandmarks = [
      landmarks[33], landmarks[7], landmarks[163], landmarks[144], landmarks[145],
      landmarks[153], landmarks[154], landmarks[155], landmarks[133], landmarks[173],
      landmarks[157], landmarks[158], landmarks[159], landmarks[160], landmarks[161], landmarks[246],
      landmarks[468] // Left iris center
    ].filter(Boolean) // Remove undefined landmarks
    
    const rightEyeLandmarks = [
      landmarks[362], landmarks[382], landmarks[381], landmarks[380], landmarks[374], landmarks[373],
      landmarks[390], landmarks[249], landmarks[263], landmarks[466], landmarks[388], landmarks[387],
      landmarks[386], landmarks[385], landmarks[384], landmarks[398],
      landmarks[473] // Right iris center
    ].filter(Boolean) // Remove undefined landmarks

    const calculateEyeBox = (eyeLandmarks) => {
      // Handle cases with few landmarks - use defaults if needed
      if (!eyeLandmarks || eyeLandmarks.length === 0) {
        return null
      }
      
      const validLandmarks = eyeLandmarks.filter(p => p && p.x !== undefined && p.y !== undefined)
      if (validLandmarks.length === 0) {
        return null
      }
      
      const eyeMinX = Math.min(...validLandmarks.map(p => p.x))
      const eyeMaxX = Math.max(...validLandmarks.map(p => p.x))
      const eyeMinY = Math.min(...validLandmarks.map(p => p.y))
      const eyeMaxY = Math.max(...validLandmarks.map(p => p.y))
      
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

    // Calculate face metrics with fallbacks for missing landmarks
    const leftIris = landmarks[468] || (leftEyeBox ? {
      x: leftEyeBox.x + leftEyeBox.width / 2,
      y: leftEyeBox.y + leftEyeBox.height / 2
    } : null)
    
    const rightIris = landmarks[473] || (rightEyeBox ? {
      x: rightEyeBox.x + rightEyeBox.width / 2,
      y: rightEyeBox.y + rightEyeBox.height / 2
    } : null)
    
    const noseTip = landmarks[1] || landmarks[4] || { x: 0.5, y: 0.5 }
    const chin = landmarks[152] || landmarks[175] || { x: 0.5, y: 0.8 }
    const forehead = landmarks[10] || landmarks[151] || { x: 0.5, y: 0.2 }

    const pupilDistance = leftIris && rightIris ? Math.abs(leftIris.x - rightIris.x) : 0.1
    const faceHeightMetric = Math.abs(forehead.y - chin.y) || 0.3
    const faceWidthMetric = landmarks[234] && landmarks[454] 
      ? Math.abs(landmarks[234].x - landmarks[454].x) 
      : (faceWidth || 0.3)

    const metrics = {
      faceWidth: faceWidthMetric,
      faceHeight: faceHeightMetric,
      pupilDistance: pupilDistance,
      leftEye: {
        center: leftIris ? { x: leftIris.x, y: leftIris.y } : (leftEyeBox ? {
          x: leftEyeBox.x + leftEyeBox.width / 2,
          y: leftEyeBox.y + leftEyeBox.height / 2
        } : null),
        box: leftEyeBox
      },
      rightEye: {
        center: rightIris ? { x: rightIris.x, y: rightIris.y } : (rightEyeBox ? {
          x: rightEyeBox.x + rightEyeBox.width / 2,
          y: rightEyeBox.y + rightEyeBox.height / 2
        } : null),
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
      console.log('FaceDetector: Face detected with confidence:', overallConfidence)
      setFaceDetected(true)
      onFaceDetected?.(metrics)
    } else {
      onFaceMetrics?.(metrics)
    }
  }

  const renderOverlay = () => {
    // Always render overlay if showOverlay is true, even if video isn't ready yet
    if (!showOverlay) return null

    return (
      <div 
        className="face-detector-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100 // Increased to ensure it's above video
        }}
      >
        {/* Face bounding box - always show placeholder if no face detected */}
        {faceBox ? (
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
              transition: 'all 0.3s ease',
              zIndex: 11
            }}
          >
            <div className="face-confidence">
              {Math.round(confidence * 100)}%
            </div>
          </div>
        ) : (
          // Show placeholder frame when no face detected
          <div
            className="face-box placeholder"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              zIndex: 11
            }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              Position face here
            </div>
          </div>
        )}

        {/* Eye boxes - change color based on detection */}
        {adaptiveBoxes && (eyeBoxes.left || !faceDetected) && (
          <div
            className={`eye-box left-eye-box ${faceDetected && faceMetrics?.leftEye?.center ? 'detected' : ''}`}
            style={{
              position: 'absolute',
              left: eyeBoxes.left ? `${eyeBoxes.left.x * 100}%` : '35%',
              top: eyeBoxes.left ? `${eyeBoxes.left.y * 100}%` : '45%',
              width: eyeBoxes.left ? `${eyeBoxes.left.width * 100}%` : '8%',
              height: eyeBoxes.left ? `${eyeBoxes.left.height * 100}%` : '8%',
              border: `2px solid ${faceDetected && faceMetrics?.leftEye?.center ? '#00ff00' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: faceDetected && faceMetrics?.leftEye?.center 
                ? '0 0 10px rgba(0, 255, 0, 0.5)' 
                : '0 0 5px rgba(255, 255, 255, 0.2)',
              zIndex: 11
            }}
          >
            {faceDetected && faceMetrics?.leftEye?.center && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#00ff00',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>✓</div>
            )}
          </div>
        )}

        {adaptiveBoxes && (eyeBoxes.right || !faceDetected) && (
          <div
            className={`eye-box right-eye-box ${faceDetected && faceMetrics?.rightEye?.center ? 'detected' : ''}`}
            style={{
              position: 'absolute',
              left: eyeBoxes.right ? `${eyeBoxes.right.x * 100}%` : '57%',
              top: eyeBoxes.right ? `${eyeBoxes.right.y * 100}%` : '45%',
              width: eyeBoxes.right ? `${eyeBoxes.right.width * 100}%` : '8%',
              height: eyeBoxes.right ? `${eyeBoxes.right.height * 100}%` : '8%',
              border: `2px solid ${faceDetected && faceMetrics?.rightEye?.center ? '#00ff00' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: faceDetected && faceMetrics?.rightEye?.center 
                ? '0 0 10px rgba(0, 255, 0, 0.5)' 
                : '0 0 5px rgba(255, 255, 255, 0.2)',
              zIndex: 11
            }}
          >
            {faceDetected && faceMetrics?.rightEye?.center && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#00ff00',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>✓</div>
            )}
          </div>
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
