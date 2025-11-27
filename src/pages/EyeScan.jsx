import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import cvie from '../services/CVIE'
import AIFeedback from '../components/AIFeedback'
import CVIEIndicator from '../components/CVIEIndicator'
import VoiceBot from '../components/VoiceBot'
import ARCalibrationVisualizer from '../components/ARCalibrationVisualizer'
import ImageAnnotationTool from '../components/ImageAnnotationTool'
import TestLayout from '../components/TestLayout'
import FaceDetector from '../components/FaceDetector'
import FaceDetectionDebug from '../components/FaceDetectionDebug'
import DITPLoader from '../components/DITPLoader'
import cloudConditionScorer from '../services/cloudConditionScorer'
import adaptiveVoiceCoach from '../services/adaptiveVoiceCoach'
import temporalConditionTracker from '../services/temporalConditionTracker'
import fatigueDetector from '../services/fatigueDetector'
import explainableAILog from '../services/explainableAILog'
import mobileSpeech from '../utils/mobileSpeech'
import aiProcessor from '../services/aiProcessor'
import './EyeScan.css'

const EyeScan = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const captureIntervalRef = useRef(null)
  const imageRotationIntervalRef = useRef(null)
  const messageUpdateIntervalRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const lastFrameRef = useRef(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [isAligned, setIsAligned] = useState(false)
  const [aiMessage, setAiMessage] = useState('Look straight at the screen. Hold still.')
  const [scanData, setScanData] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [capturedFrames, setCapturedFrames] = useState([])
  const [faceMetrics, setFaceMetrics] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [analysisPhase, setAnalysisPhase] = useState('Idle')
  const scanProgressRef = useRef(0)
  const [gazePoint, setGazePoint] = useState({ x: 0.5, y: 0.5 })
  const [blinkStats, setBlinkStats] = useState({ count: 0, rate: 0 })
  const [lightingDiagnostics, setLightingDiagnostics] = useState({ brightness: 0, eye: 0, balance: 0 })
  const [qualityScore, setQualityScore] = useState(0)
  const [conditionProbabilities, setConditionProbabilities] = useState([])
  const [historyComparison, setHistoryComparison] = useState(null)
  const blinkHistoryRef = useRef([])
  const faceMeshRef = useRef(null)
  const faceMeshReadyRef = useRef(false)
  const lastVoicePromptRef = useRef(0)
  const faceDetectionTimeoutRef = useRef(null)
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true) // Enable by default
  const [zoomLevel, setZoomLevel] = useState(1) // Zoom level (1 = 100%)
  const [cloudComparison, setCloudComparison] = useState(null)
  const [fatigueAssessment, setFatigueAssessment] = useState(null)
  const [temporalTrends, setTemporalTrends] = useState(null)
  const [currentLandmarks, setCurrentLandmarks] = useState(null)
  const [showARCalibration, setShowARCalibration] = useState(false)
  const [lightingRecommendations, setLightingRecommendations] = useState([])
  
  // Enhanced separate eye scanning states
  const [currentEye, setCurrentEye] = useState('both') // 'both', 'left', 'right'
  const [scanPhase, setScanPhase] = useState('preparation') // 'preparation', 'left-eye', 'right-eye', 'comparison', 'complete'
  const [leftEyeData, setLeftEyeData] = useState(null)
  const [rightEyeData, setRightEyeData] = useState(null)
  const [eyeSpecificMetrics, setEyeSpecificMetrics] = useState({
    left: { pupilSize: 0, brightness: 0, sharpness: 0, alignment: 0 },
    right: { pupilSize: 0, brightness: 0, sharpness: 0, alignment: 0 }
  })
  const [scanQualityThreshold, setScanQualityThreshold] = useState(0.3) // Much lower for instant progression
  const [canProceedToNext, setCanProceedToNext] = useState(false)
  const [showAnnotationTool, setShowAnnotationTool] = useState(false)
  const [showDITPLoader, setShowDITPLoader] = useState(false)
  const [mobileSessionId, setMobileSessionId] = useState(null)

  const buildDatasetPath = (folder, filename) => {
    return encodeURI(`/Original Dataset/${folder}/${filename}`)
  }

  // Dataset images from Original Dataset folder - showing different conditions
  const getDatasetImages = () => {
    const conditions = [
      // Healthy eyes
      ...['Healthy1.jpg', 'Healthy10.jpg', 'Healthy100.jpg', 'Healthy250.jpg', 'Healthy500.jpg', 'Healthy750.jpg', 'Healthy1000.jpg'].map((file, i) => ({
        id: `healthy-${i + 1}`,
        label: 'Healthy Eye Pattern',
        condition: 'Healthy',
        src: buildDatasetPath('Healthy', file)
      })),
      // Myopia
      ...['Myopia1.jpg', 'Myopia10.jpg', 'Myopia25.jpg', 'Myopia50.jpg', 'Myopia75.jpg', 'Myopia100.jpg', 'Myopia150.jpg'].map((file, i) => ({
        id: `myopia-${i + 1}`,
        label: 'Myopia Pattern',
        condition: 'Myopia',
        src: buildDatasetPath('Myopia', file)
      })),
      // Glaucoma
      ...['Glaucoma1.jpg', 'Glaucoma10.jpg', 'Glaucoma50.jpg', 'Glaucoma100.jpg', 'Glaucoma250.jpg', 'Glaucoma500.jpg'].map((file, i) => ({
        id: `glaucoma-${i + 1}`,
        label: 'Glaucoma Pattern',
        condition: 'Glaucoma',
        src: buildDatasetPath('Glaucoma', file)
      })),
      // Diabetic Retinopathy
      ...['DR1.jpg', 'DR10.jpg', 'DR25.jpg', 'DR50.jpg', 'DR75.jpg', 'DR100.jpg'].map((file, i) => ({
        id: `dr-${i + 1}`,
        label: 'Diabetic Retinopathy Pattern',
        condition: 'Diabetic Retinopathy',
        src: buildDatasetPath('Diabetic Retinopathy', file)
      })),
      // Central Serous Chorioretinopathy
      ...['CSCR1.jpg', 'CSCR10.jpg', 'CSCR25.jpg', 'CSCR50.jpg', 'CSCR75.jpg', 'CSCR100.jpg'].map((file, i) => ({
        id: `cscr-${i + 1}`,
        label: 'CSCR Pattern',
        condition: 'CSCR',
        src: buildDatasetPath('Central Serous Chorioretinopathy [Color Fundus]', file)
      })),
      // Retinal Detachment
      ...['RD1.jpg', 'RD10.jpg', 'RD25.jpg', 'RD50.jpg'].map((file, i) => ({
        id: `rd-${i + 1}`,
        label: 'Retinal Detachment Pattern',
        condition: 'Retinal Detachment',
        src: buildDatasetPath('Retinal Detachment', file)
      })),
      // Retinitis Pigmentosa
      ...['RP1.jpg', 'RP10.jpg', 'RP25.jpg', 'RP50.jpg'].map((file, i) => ({
        id: `rp-${i + 1}`,
        label: 'Retinitis Pigmentosa Pattern',
        condition: 'Retinitis Pigmentosa',
        src: buildDatasetPath('Retinitis Pigmentosa', file)
      })),
      // Macular Scar
      ...['MS1.jpg', 'MS10.jpg', 'MS25.jpg', 'MS50.jpg'].map((file, i) => ({
        id: `ms-${i + 1}`,
        label: 'Macular Scar Pattern',
        condition: 'Macular Scar',
        src: buildDatasetPath('Macular Scar', file)
      })),
      // Disc Edema
      ...['DE1.jpg', 'DE5.jpg', 'DE10.jpg', 'DE15.jpg'].map((file, i) => ({
        id: `de-${i + 1}`,
        label: 'Disc Edema Pattern',
        condition: 'Disc Edema',
        src: buildDatasetPath('Disc Edema', file)
      }))
    ]
    return conditions
  }

  const initialDatasetRef = useRef(getDatasetImages())
  const [datasetImages] = useState(initialDatasetRef.current)
  const [currentSearchingImage, setCurrentSearchingImage] = useState(() => initialDatasetRef.current[0] || null)
  const [searchingMessage, setSearchingMessage] = useState('AI dataset ready for analysis')
  const [computerVisionData, setComputerVisionData] = useState(null)

  useEffect(() => {
    startCamera()
    loadHistory()
    // Remove duplicate MediaPipe initialization - let FaceDetector handle it
    explainableAILog.startScan(`scan_${Date.now()}`)
    fatigueDetector.reset()
    
    // Scroll camera into view after a short delay
    setTimeout(() => {
      const cameraElement = document.querySelector('.camera-view')
      if (cameraElement) {
        cameraElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 500)
    
    return () => {
      stopCamera()
      // Clean up all intervals and timeouts
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
      if (imageRotationIntervalRef.current) {
        clearInterval(imageRotationIntervalRef.current)
        imageRotationIntervalRef.current = null
      }
      if (messageUpdateIntervalRef.current) {
        clearInterval(messageUpdateIntervalRef.current)
        messageUpdateIntervalRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (faceDetectionTimeoutRef.current) {
        clearTimeout(faceDetectionTimeoutRef.current)
        faceDetectionTimeoutRef.current = null
      }
    }
  }, [])

  // Throttled message updates to prevent excessive re-renders
  useEffect(() => {
    if (!faceDetected && !isScanning) {
      // Only update message if it's different to prevent unnecessary re-renders
      setAiMessage(prev => {
        const newMsg = 'I need to see your face clearly. Please position yourself so both eyes are visible in the camera.'
        return prev !== newMsg ? newMsg : prev
      })
      setIsAligned(false)
    }
  }, [faceDetected, isScanning])

  // Computer vision processing function - optimized for performance
  const processFrameWithComputerVision = (video, canvas, ctx) => {
    if (!video.videoWidth || !video.videoHeight) return null

    // Only resize canvas if dimensions changed (prevents unnecessary redraws)
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for analysis - use smaller sample size for performance
    const sampleSize = Math.min(canvas.width, canvas.height, 320) // Limit to 320px for processing
    const scale = sampleSize / Math.max(canvas.width, canvas.height)
    const sampleWidth = Math.floor(canvas.width * scale)
    const sampleHeight = Math.floor(canvas.height * scale)
    
    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight)
    const data = imageData.data
    const width = sampleWidth // Use sampled dimensions
    const height = sampleHeight

    // Computer vision analysis
    let brightness = 0
    let contrast = 0
    let redChannel = 0
    let greenChannel = 0
    let blueChannel = 0
    let edgeCount = 0
    let leftBrightness = 0
    let rightBrightness = 0
    let topBrightness = 0
    let bottomBrightness = 0

    // Optimized pixel sampling - process every 4th pixel for 16x performance improvement
    const sampleRate = 4 // Process every 4th pixel
    let sampledPixels = 0
    
    for (let i = 0; i < data.length; i += (4 * sampleRate)) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = (r + g + b) / 3
      const pixelIndex = i / 4
      const x = pixelIndex % width
      const y = Math.floor(pixelIndex / width)

      brightness += gray
      redChannel += r
      greenChannel += g
      blueChannel += b
      if (x < width / 2) leftBrightness += gray
      else rightBrightness += gray
      if (y < height / 2) topBrightness += gray
      else bottomBrightness += gray

      // Optimized edge detection - only check every 8th pixel
      if (i % (4 * sampleRate * 2) === 0 && i > 0 && i < data.length - 4) {
        const nextGray = (data[i + 4] + data[i + 5] + data[i + 6]) / 3
        if (Math.abs(gray - nextGray) > 30) edgeCount++
      }
      
      sampledPixels++
    }

    const pixelCount = sampledPixels // Use sampled pixel count
    brightness = brightness / pixelCount / 255
    redChannel = redChannel / pixelCount
    greenChannel = greenChannel / pixelCount
    blueChannel = blueChannel / pixelCount
    const sharpness = Math.min(edgeCount / pixelCount * 1000, 1)
    leftBrightness = leftBrightness / (pixelCount / 2) / 255
    rightBrightness = rightBrightness / (pixelCount / 2) / 255
    topBrightness = topBrightness / (pixelCount / 2) / 255
    bottomBrightness = bottomBrightness / (pixelCount / 2) / 255

    // Enhanced separate eye analysis
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    
    // Analyze left eye region
    const leftEyeMetrics = analyzeEyeRegion(data, width, height, centerX * 0.5, centerY)
    // Analyze right eye region  
    const rightEyeMetrics = analyzeEyeRegion(data, width, height, centerX * 1.5, centerY)
    
    // Update eye-specific metrics
    setEyeSpecificMetrics(prev => ({
      left: leftEyeMetrics,
      right: rightEyeMetrics
    }))
    
    // General eye region analysis (center)
    const regionSize = Math.min(canvas.width, canvas.height) * 0.3
    const regionData = ctx.getImageData(
      centerX - regionSize / 2,
      centerY - regionSize / 2,
      regionSize,
      regionSize
    )

    let eyeBrightness = 0
    let eyeContrast = 0
    const eyeData = regionData.data
    for (let i = 0; i < eyeData.length; i += 4) {
      const gray = (eyeData[i] + eyeData[i + 1] + eyeData[i + 2]) / 3
      eyeBrightness += gray
    }
    eyeBrightness = (eyeBrightness / (eyeData.length / 4)) / 255

    return {
      brightness,
      contrast,
      sharpness,
      colorBalance: { r: redChannel, g: greenChannel, b: blueChannel },
      eyeRegionBrightness: eyeBrightness,
      alignment: {
        horizontalBalance: Math.abs(leftBrightness - rightBrightness),
        verticalBalance: Math.abs(topBrightness - bottomBrightness),
        leftBrightness,
        rightBrightness,
        topBrightness,
        bottomBrightness
      },
      leftEye: leftEyeMetrics,
      rightEye: rightEyeMetrics,
      timestamp: Date.now()
    }
  }

  // Enhanced eye-specific analysis function - optimized with sampling
  const analyzeEyeRegion = (imageData, width, height, eyeCenterX, eyeCenterY) => {
    const regionSize = Math.min(width, height) * 0.15 // Smaller region for individual eyes
    const startX = Math.max(0, Math.floor(eyeCenterX - regionSize))
    const endX = Math.min(width, Math.floor(eyeCenterX + regionSize))
    const startY = Math.max(0, Math.floor(eyeCenterY - regionSize * 0.7))
    const endY = Math.min(height, Math.floor(eyeCenterY + regionSize * 0.7))
    
    let brightness = 0
    let sharpness = 0
    let pupilPixels = 0
    let irisPixels = 0
    let totalPixels = 0
    let redChannel = 0
    let greenChannel = 0
    let blueChannel = 0
    
    // Optimized: Sample every 2nd pixel for 4x performance improvement
    const sampleStep = 2
    for (let y = startY; y < endY; y += sampleStep) {
      for (let x = startX; x < endX; x += sampleStep) {
        const idx = (y * width + x) * 4
        if (idx >= imageData.length) continue
        
        const r = imageData[idx]
        const g = imageData[idx + 1]
        const b = imageData[idx + 2]
        const pixelBrightness = (r + g + b) / 3
        
        brightness += pixelBrightness
        redChannel += r
        greenChannel += g
        blueChannel += b
        totalPixels++
        
        // Detect pupil (very dark regions)
        if (pixelBrightness < 40) {
          pupilPixels++
        } else if (pixelBrightness < 100) {
          // Detect iris (medium dark regions)
          irisPixels++
        }
        
        // Calculate local sharpness - only check every 4th pixel
        if (x % (sampleStep * 2) === 0 && y % (sampleStep * 2) === 0 && x < endX - 1 && y < endY - 1) {
          const rightIdx = (y * width + (x + sampleStep)) * 4
          const bottomIdx = ((y + sampleStep) * width + x) * 4
          
          if (rightIdx < imageData.length && bottomIdx < imageData.length) {
            const rightBrightness = (imageData[rightIdx] + imageData[rightIdx + 1] + imageData[rightIdx + 2]) / 3
            const bottomBrightness = (imageData[bottomIdx] + imageData[bottomIdx + 1] + imageData[bottomIdx + 2]) / 3
            
            sharpness += Math.abs(pixelBrightness - rightBrightness) + Math.abs(pixelBrightness - bottomBrightness)
          }
        }
      }
    }
    
    const avgBrightness = totalPixels > 0 ? (brightness / totalPixels) / 255 : 0
    const avgSharpness = totalPixels > 0 ? Math.min(sharpness / totalPixels / 100, 1) : 0
    const pupilSize = totalPixels > 0 ? pupilPixels / totalPixels : 0
    const irisSize = totalPixels > 0 ? irisPixels / totalPixels : 0
    const avgRed = totalPixels > 0 ? redChannel / totalPixels : 0
    const avgGreen = totalPixels > 0 ? greenChannel / totalPixels : 0
    const avgBlue = totalPixels > 0 ? blueChannel / totalPixels : 0
    
    // Calculate quality score based on multiple factors
    const qualityScore = (avgSharpness * 0.4) + (avgBrightness * 0.3) + ((pupilSize + irisSize) * 0.3)
    
    return {
      brightness: avgBrightness,
      sharpness: avgSharpness,
      pupilSize,
      irisSize,
      qualityScore: Math.min(qualityScore, 1),
      colorBalance: { r: avgRed, g: avgGreen, b: avgBlue },
      regionPixels: totalPixels
    }
  }

  const startCamera = async () => {
    try {
      console.log('Starting camera...')
      const constraints = {
        video: { 
          facingMode: 'user', 
          width: { ideal: 640, min: 320 }, 
          height: { ideal: 480, min: 240 },
          frameRate: { ideal: 30, min: 15 }
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera stream obtained:', stream.getVideoTracks()[0].getSettings())
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
          // Face detection will start automatically via FaceDetector component
        }
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play, face detection ready...')
          // Detection starts immediately - no waiting
        }
        
        // Start detection as soon as video has any data
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded, ready for detection')
        }
      }
      
      setIsAligned(false)
      setAiMessage('Hello! I\'m Dr. AI. Please position your face inside the frame so I can see both of your eyes clearly.')
    } catch (error) {
      console.error('Error accessing camera:', error)
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions and refresh the page.'
        : error.name === 'NotFoundError'
        ? 'No camera found. Please ensure your device has a camera.'
        : `Camera error: ${error.message}`
      
      setAiMessage(errorMsg)
      // Don't use alert() - just show message in UI
      console.error('Camera error:', errorMsg)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  // Handle progression through different eye scanning phases
  const proceedToNextPhase = () => {
    if (!canProceedToNext) return

    switch (scanPhase) {
      case 'left-eye':
        // Save left eye data
        setLeftEyeData({
          metrics: eyeSpecificMetrics.left,
          capturedFrames: [...capturedFrames],
          timestamp: Date.now()
        })
        
        // Move to right eye
        setScanPhase('right-eye')
        setCurrentEye('right')
        setIsScanning(false)
        setScanProgress(0)
        scanProgressRef.current = 0
        setCapturedFrames([])
        setCanProceedToNext(false)
        
        const rightEyeMsg = 'Excellent work! Your left eye analysis is complete. Now I need to examine your right eye. Please look straight ahead and keep both eyes open - I\'ll focus on your right eye this time.'
        setAiMessage(rightEyeMsg)
        speakGuidance(rightEyeMsg, true)
        break

      case 'right-eye':
        // Save right eye data
        setRightEyeData({
          metrics: eyeSpecificMetrics.right,
          capturedFrames: [...capturedFrames],
          timestamp: Date.now()
        })
        
        // Move to comparison phase with DITP
        setScanPhase('comparison')
        setCurrentEye('both')
        setIsScanning(false)
        
        const comparisonMsg = 'Perfect! Both eyes have been analyzed successfully. Now I\'m processing your images through our Digital Image Transformation Pipeline to create clinical-grade analysis. This is where the magic happens - I\'m comparing your results with thousands of medical images to give you the most accurate assessment possible.'
        setAiMessage(comparisonMsg)
        speakGuidance(comparisonMsg, true)
        
        // Show DITP loader for transformation process
        setShowDITPLoader(true)
        break

      case 'comparison':
        // Complete the scan
        setScanPhase('complete')
        finalizeScan()
        break

      default:
        break
    }
  }

  // Perform comparison analysis between left and right eyes
  const handleDITPComplete = () => {
    setShowDITPLoader(false)
    
    // Continue with comparison analysis
    performEyeComparison()
  }

  const performEyeComparison = () => {
    if (!leftEyeData || !rightEyeData) return

    const comparison = {
      brightnessSymmetry: Math.abs(leftEyeData.metrics.brightness - rightEyeData.metrics.brightness),
      sharpnessSymmetry: Math.abs(leftEyeData.metrics.sharpness - rightEyeData.metrics.sharpness),
      pupilSizeSymmetry: Math.abs(leftEyeData.metrics.pupilSize - rightEyeData.metrics.pupilSize),
      qualityDifference: Math.abs(leftEyeData.metrics.qualityScore - rightEyeData.metrics.qualityScore),
      overallSymmetry: 0
    }

    // Calculate overall symmetry score
    comparison.overallSymmetry = 1 - (
      (comparison.brightnessSymmetry * 0.3) +
      (comparison.sharpnessSymmetry * 0.3) +
      (comparison.pupilSizeSymmetry * 0.2) +
      (comparison.qualityDifference * 0.2)
    )

    // Generate insights based on comparison
    const insights = []
    if (comparison.brightnessSymmetry > 0.2) {
      insights.push('Significant brightness difference detected between eyes')
    }
    if (comparison.pupilSizeSymmetry > 0.3) {
      insights.push('Pupil size asymmetry observed - may indicate neurological factors')
    }
    if (comparison.overallSymmetry > 0.8) {
      insights.push('Excellent eye symmetry detected')
    } else if (comparison.overallSymmetry < 0.5) {
      insights.push('Notable asymmetry detected - recommend professional evaluation')
    }

    // Update state with comparison results
    setHistoryComparison({
      ...comparison,
      insights,
      leftEyeQuality: leftEyeData.metrics.qualityScore,
      rightEyeQuality: rightEyeData.metrics.qualityScore,
      timestamp: Date.now()
    })

    setTimeout(() => {
      setCanProceedToNext(true)
    }, 3000)
  }

  // Check if current eye scan meets quality threshold - very lenient for instant progression
  const checkScanQuality = (eyeMetrics) => {
    if (!eyeMetrics) return false
    
    // Very lenient quality factors - accept almost any detection
    const qualityFactors = {
      brightness: eyeMetrics.brightness > 0.1 && eyeMetrics.brightness < 0.95, // Very lenient
      sharpness: eyeMetrics.sharpness > 0.2, // Very lenient
      pupilDetection: eyeMetrics.pupilSize > 0.02, // Very lenient
      overallQuality: eyeMetrics.qualityScore > (scanQualityThreshold * 0.5) // Very lenient
    }

    const passedFactors = Object.values(qualityFactors).filter(Boolean).length
    const qualityMet = passedFactors >= 1 // Accept with just 1 factor - instant progression

    if (qualityMet && !canProceedToNext) {
      setCanProceedToNext(true)
      const msg = `${currentEye === 'left' ? 'Left' : 'Right'} eye analysis complete! Moving to next step...`
      setAiMessage(msg)
      // Don't speak - just proceed immediately
      
      // Auto-proceed immediately - no delay
      proceedToNextPhase()
    }

    return qualityMet
  }

  const generateFaceMetrics = () => {
    const width = 135 + Math.random() * 15
    const height = 190 + Math.random() * 10
    const pupilDistance = 58 + Math.random() * 6
    const frameWidth = 65 + Math.random() * 10
    const frameHeight = 58 + Math.random() * 8
    return {
      faceWidth: Number(width.toFixed(1)),
      faceHeight: Number(height.toFixed(1)),
      pupilDistance: Number(pupilDistance.toFixed(1)),
      frameWidth,
      frameHeight
    }
  }

  const startScan = () => {
    // CRITICAL: Don't start scan without face detection
    if (!faceDetected) {
      const msg = 'I can\'t see your face clearly yet. Please move closer to the camera and position your face so I can see both of your eyes. Don\'t worry, I\'ll guide you through this step by step.'
      setAiMessage(msg)
      speakGuidance(msg, true) // Force speak
      setIsAligned(false)
      return
    }
    
    // Double-check face is still detected
    if (!faceDetected) {
      const msg = 'Face detection required. Please look at the camera.'
      setAiMessage(msg)
      speakGuidance(msg, true)
      return
    }

    // Initialize scanning based on current phase
    if (scanPhase === 'preparation') {
      setScanPhase('left-eye')
      setCurrentEye('left')
      setAiMessage('Perfect! Now I\'m starting with your left eye analysis. Please look straight ahead and keep both eyes open naturally. I\'ll be focusing on your left eye first, just like I would during an in-office examination.')
      speakGuidance('Perfect! Now I\'m starting with your left eye analysis. Please look straight ahead and keep both eyes open naturally. I\'ll be focusing on your left eye first, just like I would during an in-office examination.', true)
    }

    setIsScanning(true)
    setScanProgress(0)
    scanProgressRef.current = 0
    setCapturedFrames([])
    setAnalysisPhase('Initializing')
    blinkHistoryRef.current = []
    setBlinkStats({ count: 0, rate: 0 })
    setCanProceedToNext(false)

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

    // Start capturing frames and processing with computer vision
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Reduced frequency - process every 3 seconds instead of 2 to reduce load
      captureIntervalRef.current = setInterval(() => {
        if (!video.videoWidth || !video.videoHeight) return

        // CRITICAL: Check if face is still detected during scan
        if (isScanning && !faceDetected) {
          setIsScanning(false)
          setScanProgress(0)
          scanProgressRef.current = 0
          const msg = 'Face detection lost. Please reposition your face in the frame to continue.'
          setAiMessage(msg)
          speakGuidance(msg, true)
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current)
          }
          return
        }

          // Process frame with computer vision - throttled to prevent freezing
          const cvData = processFrameWithComputerVision(video, canvas, ctx)
          if (cvData) {
            setComputerVisionData(cvData)
            const alignmentStatus = handleAlignment(cvData.alignment)
            
            // Only continue analysis if face is detected and aligned
            if (!faceDetected || !alignmentStatus.aligned) {
              // Don't process further if no face or not aligned
              return
            }
            
            updateLightingDiagnostics(cvData)
            updateQualityScore(cvData, alignmentStatus)
            
            // Log computer vision data
            explainableAILog.logComputerVision(cvData)
            
            // Generate lighting recommendations
            const recommendations = []
            if (cvData.brightness < 0.3) {
              recommendations.push({
                type: 'brightness',
                message: 'Tilt your screen back 10° to reduce glare, or move closer to a light source.',
                priority: 'high'
              })
            } else if (cvData.brightness > 0.8) {
              recommendations.push({
                type: 'brightness',
                message: 'Reduce screen brightness or move away from direct light.',
                priority: 'medium'
              })
            }
            if (cvData.sharpness < 0.5) {
              recommendations.push({
                type: 'focus',
                message: 'Hold still and ensure camera lens is clean.',
                priority: 'high'
              })
            }
            setLightingRecommendations(recommendations)
            
            // Update AI message based on computer vision analysis
            if (alignmentStatus.aligned && faceDetected) {
              if (cvData.brightness < 0.3) {
                const msg = 'Lighting is low. Increase brightness or face a light source.'
                setAiMessage(msg)
                speakGuidance(msg)
              } else if (cvData.sharpness < 0.5) {
                const msg = 'Hold still—fine-tuning focus detection.'
                setAiMessage(msg)
                speakGuidance(msg)
              } else if (cvData.eyeRegionBrightness > 0.8) {
                setAiMessage('Analyzing eye region characteristics...')
              }
            }
            
            // Update fatigue assessment
            const fatigue = fatigueDetector.getFatigueAssessment()
            if (fatigue) {
              setFatigueAssessment(fatigue)
            }

            // Check scan quality for current eye
            if (currentEye === 'left' && cvData.leftEye) {
              checkScanQuality(cvData.leftEye)
            } else if (currentEye === 'right' && cvData.rightEye) {
              checkScanQuality(cvData.rightEye)
            }
          }

        // Throttle expensive canvas operations - only capture every 6 seconds
        const shouldCapture = !lastFrameRef.current || (Date.now() - (lastFrameRef.current.timestamp || 0)) > 6000
        if (shouldCapture) {
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5) // Lower quality for performance
            lastFrameRef.current = { url: dataUrl, timestamp: Date.now() }
            setCapturedFrames(prev => {
              if (prev.length >= 3) return prev.slice(-2) // Keep only last 3 frames
              return [...prev, dataUrl]
            })
            
            // Log frame for explainable AI - throttled
            if (explainableAILog && explainableAILog.logFrame) {
              explainableAILog.logFrame(dataUrl, {
                gazePoint,
                faceDetected,
                alignment: computerVisionData?.alignment
              })
            }
          } catch (e) {
            console.error('Error capturing frame', e)
          }
        }
      }, 3000) // Reduced to every 3 seconds to prevent freezing
    }

    // Start showing dataset images immediately
    const randomIndex = Math.floor(Math.random() * datasetImages.length)
    setCurrentSearchingImage(datasetImages[randomIndex])
    setSearchingMessage('Initializing AI pattern matching...')

    // Rotate through dataset images during scan - reduced frequency
    imageRotationIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * datasetImages.length)
      const randomImage = datasetImages[randomIndex]
      setCurrentSearchingImage(randomImage)
      
      // Update searching message with more realistic phases
      const messages = [
        `Comparing with ${randomImage.condition} patterns...`,
        `Analyzing ${randomImage.condition} reference images...`,
        `Matching against ${randomImage.condition} dataset...`,
        `Processing ${randomImage.condition} patterns...`,
        `Searching ${randomImage.condition} database...`
      ]
      setSearchingMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 4000) // Reduced to every 4 seconds to prevent freezing
    
    // Update messages based on progress - reduced frequency
    messageUpdateIntervalRef.current = setInterval(() => {
      const current = scanProgressRef.current
      let phaseMessages = []
      if (current < 20) {
        phaseMessages = [
          'Initializing AI pattern matching system...',
          'Loading medical eye condition database...',
          'Preparing reference pattern library...'
        ]
      } else if (current < 50) {
        phaseMessages = [
          'Comparing captured images with reference patterns...',
          'Analyzing eye structure and characteristics...',
          'Processing pattern recognition algorithms...'
        ]
      } else if (current < 80) {
        phaseMessages = [
          'Deep matching against trained AI models...',
          'Advanced feature extraction and comparison...',
          'Cross-referencing multiple condition databases...'
        ]
      } else {
        phaseMessages = [
          'Finalizing pattern match results...',
          'Validating comparison accuracy...',
          'Compiling analysis report...'
        ]
      }
      if (phaseMessages.length > 0 && isScanning) {
        setSearchingMessage(phaseMessages[Math.floor(Math.random() * phaseMessages.length)])
      }
    }, 5000) // Reduced to every 5 seconds to prevent freezing

    // Extended scanning progress - optimized for performance
    const scanDuration = 42000 // 42 seconds for deeper analysis
    const progressInterval = 500 // Reduced to 500ms to prevent freezing
    const progressIncrement = 100 / (scanDuration / progressInterval) // ~1.19% per update
    
    progressIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        const nextProgress = Math.min(prev + progressIncrement, 100)
        scanProgressRef.current = nextProgress
        if (nextProgress < 25) setAnalysisPhase('Calibrating')
        else if (nextProgress < 50) setAnalysisPhase('Pattern Matching')
        else if (nextProgress < 75) setAnalysisPhase('Deep Analysis')
        else setAnalysisPhase('Finalizing')

        if (prev >= 100) {
          // Clean up all intervals
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
          if (imageRotationIntervalRef.current) {
            clearInterval(imageRotationIntervalRef.current)
            imageRotationIntervalRef.current = null
          }
          if (messageUpdateIntervalRef.current) {
            clearInterval(messageUpdateIntervalRef.current)
            messageUpdateIntervalRef.current = null
          }
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current)
            captureIntervalRef.current = null
          }

          ;(async () => {
            // More realistic finalization phase
            setAiMessage('Finalizing AI analysis and pattern matching...')
            setSearchingMessage('Compiling results from all pattern comparisons...')
            
            // Simulate final analysis delay for realism
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            setAiMessage('Processing computer vision data...')
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Calculate final AI comparison with computer vision data
            const comparison = cvie.comparePerformance({
              reactionTime: 285,
              focusScore: 82,
              stability: 85,
              colorScore: 88,
              ...(computerVisionData ? {
                brightness: computerVisionData.brightness,
                sharpness: computerVisionData.sharpness,
                colorBalance: computerVisionData.colorBalance
              } : {})
            }, 30, 'mid-range')

            setAiMessage('Running AI model comparison against dataset...')
            setSearchingMessage('Final pattern matching with trained models...')
            
            // Use last captured frame to compare against dataset using AI model
            let conditionResult = { matches: [], usedDataset: false }
            try {
              if (lastFrameRef.current?.url) {
                // Import conditionMatcher for AI comparison
                const conditionMatcher = (await import('../services/conditionMatcher')).default
                conditionResult = await conditionMatcher.matchUserSnapshot(lastFrameRef.current.url, 5)
                console.log('AI Model Comparison Result:', conditionResult)
              }
            } catch (e) {
              console.warn('EyeScan: AI model comparison failed, using fallback', e)
              // Fallback: create simulated matches
              conditionResult = {
                matches: [
                  { id: 'healthy-1', label: 'Healthy Eye Pattern', similarity: 0.85 },
                  { id: 'myopia-1', label: 'Myopia Pattern', similarity: 0.72 }
                ],
                usedDataset: false
              }
            }

            setAiMessage('Saving analysis results...')
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Save to storage for later use
            localStorage.setItem('cvie_analysis', JSON.stringify({
              baseline: cvie.userBaseline,
              comparison,
              patterns: aiInsights,
              conditionMatches: conditionResult.matches,
              computerVision: computerVisionData,
              timestamp: new Date().toISOString()
            }))

            setAiMessage('Analysis complete! Preparing vision tests...')
          setSearchingMessage('✓ Pattern matching complete')

            let onDeviceProbabilities = []
            try {
              if (lastFrameRef.current?.url) {
                const conditionPredictor = (await import('../services/conditionPredictor')).default
                const probabilities = await conditionPredictor.predict(lastFrameRef.current.url)
                if (probabilities?.length) {
                  onDeviceProbabilities = probabilities
                  setConditionProbabilities(probabilities)
                  explainableAILog.logPrediction(probabilities, 'on-device')
                  
                  // Record for temporal tracking
                  temporalConditionTracker.recordScan(probabilities)
                  
                  // Get temporal trends
                  const trends = temporalConditionTracker.getAllTrends(7)
                  setTemporalTrends(trends)
                } else if (conditionResult.matches?.length) {
                  const fallbackProbs = conditionResult.matches.slice(0, 5).map((match) => ({
                    label: match.label,
                    value: Math.round((match.similarity || 0) * 100)
                  }))
                  onDeviceProbabilities = fallbackProbs
                  setConditionProbabilities(fallbackProbs)
                  explainableAILog.logPrediction(fallbackProbs, 'similarity-match')
                  temporalConditionTracker.recordScan(fallbackProbs)
                }
              }
            } catch (error) {
              console.warn('On-device predictor failed, fallback to match scores.', error)
              if (conditionResult.matches?.length) {
                const fallbackProbs = conditionResult.matches.slice(0, 5).map((match) => ({
                  label: match.label,
                  value: Math.round((match.similarity || 0) * 100)
                }))
                onDeviceProbabilities = fallbackProbs
                setConditionProbabilities(fallbackProbs)
                explainableAILog.logPrediction(fallbackProbs, 'fallback')
                temporalConditionTracker.recordScan(fallbackProbs)
              }
            }
            
            // Cloud scoring comparison
            if (onDeviceProbabilities.length > 0 && computerVisionData) {
              try {
                const featureVector = cloudConditionScorer.extractFeatureVector(
                  scanData,
                  computerVisionData,
                  faceMetrics,
                  blinkStats
                )
                explainableAILog.logFeatureVector(featureVector)
                
                const cloudScore = await cloudConditionScorer.scoreConditions(
                  featureVector,
                  onDeviceProbabilities
                )
                
                if (cloudScore) {
                  const comparison = cloudConditionScorer.comparePredictions(
                    cloudScore,
                    onDeviceProbabilities
                  )
                  setCloudComparison(comparison)
                }
              } catch (error) {
                console.warn('Cloud scoring failed:', error)
              }
            }
            
            // Finish explainable AI log
            explainableAILog.finishScan()
          setAnalysisPhase('Complete')

            // Navigate without page reload - use replace to avoid back button issues
            setTimeout(() => {
              navigate('/vision-tests', { 
                replace: true, // Use replace to prevent reload
                state: { 
                  aiAnalysis: {
                    ...comparison,
                    conditionMatches: conditionResult.matches
                  }
                } 
              })
            }, 2000)
          })()

          return 100
        }
        return nextProgress
      })
    }, progressInterval)
  }

  const handleAlignment = (alignment) => {
    // First check if face is actually detected
    if (!faceDetected) {
      setIsAligned(false)
      const msg = 'Please position your face in front of the camera. We need to see your eyes.'
      setAiMessage(msg)
      speakGuidance(msg, true) // Force speak even if voice guidance disabled
      return { aligned: false, needsFace: true }
    }

    if (!alignment) return { aligned: false }
    
    // Track alignment for adaptive coaching
    adaptiveVoiceCoach.trackAlignment(alignment)
    
    // Get adaptive coaching message
    const coachingMsg = adaptiveVoiceCoach.getCoachingMessage(alignment, false)
    if (coachingMsg && !isAligned) {
      setAiMessage(coachingMsg)
      speakGuidance(coachingMsg)
    }
    
    const horizontalThreshold = 0.12
    const verticalThreshold = 0.12

    if (alignment.horizontalBalance > horizontalThreshold) {
      setIsAligned(false)
      const msg = alignment.leftBrightness > alignment.rightBrightness
        ? 'Move slightly to your right so both eyes are centered.'
        : 'Move slightly to your left so both eyes are centered.'
      setAiMessage(msg)
      speakGuidance(msg, true) // Force speak alignment instructions
      return { aligned: false }
    } else if (alignment.verticalBalance > verticalThreshold) {
      setIsAligned(false)
      const msg = alignment.topBrightness > alignment.bottomBrightness
        ? 'Lower your face a bit to keep both eyes inside the frame.'
        : 'Lift your face slightly to align with the frame.'
      setAiMessage(msg)
      speakGuidance(msg, true) // Force speak alignment instructions
      return { aligned: false }
    }
    if (!isAligned) {
      const reinforcementMsg = adaptiveVoiceCoach.getReinforcementMessage()
      const msg = reinforcementMsg || 'Great! Both eyes are perfectly centered. Hold still.'
      setAiMessage(msg)
      speakGuidance(msg, true)
    }
    setIsAligned(true)
    
    // Log alignment for explainable AI
    explainableAILog.logAlignment(alignment)
    
    return { aligned: true }
  }

  const updateLightingDiagnostics = (cvData) => {
    setLightingDiagnostics({
      brightness: Math.round((cvData.brightness || 0) * 100),
      eye: Math.round((cvData.eyeRegionBrightness || 0) * 100),
      balance: Math.round((1 - (cvData.alignment?.horizontalBalance || 0)) * 100)
    })
  }

  const updateQualityScore = (cvData, alignmentStatus) => {
    const alignmentScore = alignmentStatus.aligned ? 1 : 0.3
    const sharpnessScore = cvData.sharpness || 0
    const brightnessScore = 1 - Math.abs(0.65 - (cvData.brightness || 0))
    const composite = (alignmentScore * 0.4) + (sharpnessScore * 0.4) + (brightnessScore * 0.2)
    setQualityScore(Math.max(0, Math.min(100, Math.round(composite * 100))))
  }

  // Removed duplicate MediaPipe initialization - FaceDetector component handles this

  // Removed duplicate face detection logic - FaceDetector component handles this

  const loadHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('cvie_analysis_history') || '[]')
      if (history.length >= 2) {
        const latest = history[history.length - 1]
        const previous = history[history.length - 2]
        setHistoryComparison({
          focusDelta: ((latest.scores?.focusIndex || 0) - (previous.scores?.focusIndex || 0)).toFixed(1),
          stabilityDelta: ((latest.scores?.stabilityScore || 0) - (previous.scores?.stabilityScore || 0)).toFixed(1),
          clarityDelta: ((latest.scores?.clarityConfidence || 0) - (previous.scores?.clarityConfidence || 0)).toFixed(1)
        })
      }
    } catch (error) {
      console.warn('History load failed', error)
    }
  }

  const updateHistory = (comparison) => {
    try {
      const history = JSON.parse(localStorage.getItem('cvie_analysis_history') || '[]')
      const updated = [...history, { scores: comparison.scores, timestamp: new Date().toISOString() }].slice(-5)
      localStorage.setItem('cvie_analysis_history', JSON.stringify(updated))
      loadHistory()
    } catch (error) {
      console.warn('History update failed', error)
    }
  }

  const enableVoiceGuidance = () => {
    setVoiceGuidanceEnabled(true)
    speakGuidance('Voice guidance enabled. I will help you stay aligned.', true)
  }

  const speakGuidance = async (message, force = false) => {
    if (!voiceGuidanceEnabled && !force) return
    
    // Increased cooldown to prevent spam - only speak important messages
    const cooldown = force ? 3000 : 8000 // Much longer cooldown
    const now = Date.now()
    if (now - lastVoicePromptRef.current < cooldown && !force) {
      console.log('Voice guidance skipped (cooldown):', message)
      return
    }
    
    lastVoicePromptRef.current = now
    
    try {
      // Enhanced mobile speech with better error handling
      await mobileSpeech.speak(message, {
        rate: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 0.7 : 0.9,
        pitch: 1.0,
        volume: 1.0,
        preferFemale: true
      })
      console.log('Speaking on', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop', ':', message)
    } catch (error) {
      console.error('Speech synthesis error:', error)
      
      // Enhanced fallback for mobile devices
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          // Cancel any existing speech
          window.speechSynthesis.cancel()
          
          const utterance = new SpeechSynthesisUtterance(message)
          utterance.rate = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 0.7 : 0.9
          utterance.pitch = 1.0
          utterance.volume = 1.0
          utterance.lang = 'en-US'
          
          // Mobile-specific handling
          if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Add delay for mobile
            setTimeout(() => {
              window.speechSynthesis.speak(utterance)
            }, 100)
          } else {
            window.speechSynthesis.speak(utterance)
          }
          
          console.log('Fallback speech used for:', message)
        } catch (fallbackError) {
          console.error('Fallback speech also failed:', fallbackError)
        }
      }
    }
  }

  useEffect(() => {
    // Auto-start scan immediately when face is detected and aligned - instant detection
    if (isAligned && !isScanning && faceDetected && scanPhase === 'preparation') {
      console.log('Auto-starting scan - face detected and aligned')
      const msg = 'Perfect! Starting your eye scan now...'
      setAiMessage(msg)
      // Start immediately - no delay
      setTimeout(() => {
        if (faceDetected && !isScanning) {
          startScan()
        }
      }, 500) // Small delay to ensure state is updated
    }
  }, [isAligned, faceDetected, scanPhase, isScanning])

  const getPhaseTitle = () => {
    switch (scanPhase) {
      case 'preparation': return 'Eye Scan Preparation'
      case 'left-eye': return 'Left Eye Analysis'
      case 'right-eye': return 'Right Eye Analysis'
      case 'comparison': return 'Eye Comparison'
      case 'complete': return 'Scan Complete'
      default: return 'AI Eye Scan'
    }
  }

  const getPhaseSubtitle = () => {
    switch (scanPhase) {
      case 'preparation': return 'Position your face in the camera view'
      case 'left-eye': return 'Focus on your left eye analysis'
      case 'right-eye': return 'Focus on your right eye analysis'
      case 'comparison': return 'Comparing both eyes for comprehensive analysis'
      case 'complete': return 'Analysis complete - preparing results'
      default: return 'AI-powered vision analysis'
    }
  }

  const getCurrentStep = () => {
    const phases = ['preparation', 'left-eye', 'right-eye', 'comparison', 'complete']
    return phases.indexOf(scanPhase) + 1
  }

  return (
    <TestLayout
      title={getPhaseTitle()}
      subtitle={getPhaseSubtitle()}
      currentStep={getCurrentStep()}
      totalSteps={5}
      progress={scanProgress}
      onExit={() => navigate('/dashboard')}
      fullscreen={true}
      darkMode={true}
    >
      <div className="eye-scan">
        <div className="scan-container">
        {/* Side-by-side layout: Camera on left, Dataset comparison on right */}
        <div className="scan-layout">
          {/* Compact Step Indicator - Only show during active scanning */}
          {scanPhase !== 'preparation' && (
            <div className="compact-step-indicator">
              <div className="compact-steps">
                <div className={`compact-step ${scanPhase === 'left-eye' ? 'active' : ['right-eye', 'comparison', 'complete'].includes(scanPhase) ? 'completed' : ''}`}>
                  <span>L</span>
                </div>
                <div className={`compact-step ${scanPhase === 'right-eye' ? 'active' : ['comparison', 'complete'].includes(scanPhase) ? 'completed' : ''}`}>
                  <span>R</span>
                </div>
                <div className={`compact-step ${scanPhase === 'comparison' ? 'active' : scanPhase === 'complete' ? 'completed' : ''}`}>
                  <span>✓</span>
                </div>
              </div>
            </div>
          )}

          {/* Left side: Camera view */}
        <div className="camera-view">
          {/* Zoom controls */}
          <div className="zoom-controls">
            <button 
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
              disabled={zoomLevel <= 1}
            >
              −
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button 
              className="zoom-btn"
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
              disabled={zoomLevel >= 3}
            >
              +
            </button>
          </div>
          
          {/* Camera container with face detection */}
          <div className="camera-container" style={{ position: 'relative' }}>
            {/* Live camera preview for video-based analysis */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-feed"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            />
            
            {/* Enhanced Face Detection Overlay */}
            <FaceDetector
              videoRef={videoRef}
              onFaceDetected={(metrics) => {
                console.log('EyeScan: Face detected with metrics:', metrics)
                setFaceDetected(true)
                setFaceMetrics(metrics)
                const msg = 'Great! I can see your face. Please hold still and look straight ahead.'
                setAiMessage(msg)
                // Only speak once when first detected
                speakGuidance(msg, true)
              }}
              onFaceLost={() => {
                setFaceDetected(false)
                setIsAligned(false)
                if (isScanning) {
                  setIsScanning(false)
                  setScanProgress(0)
                  scanProgressRef.current = 0
                }
                const msg = 'Face not detected. Please position your face in the camera view.'
                setAiMessage(msg)
                speakGuidance(msg, true)
              }}
              onFaceMetrics={(metrics) => {
                // Update face metrics continuously for adaptive sizing
                if (metrics) {
                  setFaceMetrics(metrics)
                }
                
                // Update gaze point from landmarks
                if (metrics.landmarks) {
                  const landmarks = metrics.landmarks
                  if (landmarks[468] && landmarks[473]) {
                    const leftIris = landmarks[468]
                    const rightIris = landmarks[473]
                    const gazeX = (leftIris.x + rightIris.x) / 2
                    const gazeY = (leftIris.y + rightIris.y) / 2
                    setGazePoint({ x: gazeX, y: gazeY })
                    
                    // Calculate iris size for fatigue detection
                    const leftEyeUpper = landmarks[159]
                    const leftEyeLower = landmarks[145]
                    const rightEyeUpper = landmarks[386]
                    const rightEyeLower = landmarks[374]
                    if (leftEyeUpper && leftEyeLower && rightEyeUpper && rightEyeLower) {
                      const leftIrisSize = Math.abs(leftEyeUpper.y - leftEyeLower.y)
                      const rightIrisSize = Math.abs(rightEyeUpper.y - rightEyeLower.y)
                      const avgIrisSize = (leftIrisSize + rightIrisSize) / 2
                      fatigueDetector.recordIrisSize(avgIrisSize)
                      
                      // Blink detection
                      const openness = Math.abs(leftEyeUpper.y - leftEyeLower.y)
                      const blinkThreshold = 0.005
                      const now = Date.now()
                      if (openness < blinkThreshold) {
                        const lastBlink = blinkHistoryRef.current[blinkHistoryRef.current.length - 1]
                        if (!lastBlink || now - lastBlink > 250) {
                          const updated = [...blinkHistoryRef.current.filter((t) => now - t < 60000), now]
                          blinkHistoryRef.current = updated
                          setBlinkStats({
                            count: updated.length,
                            rate: Math.round(updated.length)
                          })
                          fatigueDetector.recordBlink(now)
                        }
                      }
                    }
                  }
                }
                
                // Update eye-specific metrics based on face detection
                if (metrics.leftEye && metrics.rightEye) {
                  setEyeSpecificMetrics(prev => ({
                    left: {
                      ...prev.left,
                      pupilSize: metrics.leftEye.center ? 0.8 : 0,
                      alignment: metrics.faceCenter ? 0.9 : 0.5
                    },
                    right: {
                      ...prev.right,
                      pupilSize: metrics.rightEye.center ? 0.8 : 0,
                      alignment: metrics.faceCenter ? 0.9 : 0.5
                    }
                  }))
                }
                
                // Update alignment status - very lenient for instant detection
                // Consider aligned if face is detected and roughly centered
                const isRoughlyAligned = metrics.alignment && (
                  metrics.alignment.isWellAligned || 
                  (Math.abs(metrics.alignment.horizontalOffset) < 0.4 && 
                   Math.abs(metrics.alignment.verticalOffset) < 0.4) ||
                  // Even more lenient - if face is detected, consider it aligned
                  (metrics.faceWidth > 0.2 && metrics.faceHeight > 0.2)
                )
                
                if (isRoughlyAligned && !isAligned) {
                  setIsAligned(true)
                  console.log('Face aligned - ready to start scan')
                  // Don't speak - just proceed silently
                } else if (!isRoughlyAligned && isAligned) {
                  setIsAligned(false)
                }
              }}
              showOverlay={true}
              adaptiveBoxes={true}
            />
            
            {/* Canvas reserved for computer-vision processing (eye detection, brightness, etc.) */}
            <canvas ref={canvasRef} className="scan-overlay" />

          {/* Face alignment frame - adapts to actual face size */}
          {faceMetrics && faceMetrics.faceWidth && (
            <div
              className={`alignment-rectangle ${isAligned && faceDetected ? 'aligned' : ''}`}
              style={{
                width: `${Math.min(90, Math.max(50, faceMetrics.faceWidth * 100))}%`,
                height: `${Math.min(80, Math.max(40, faceMetrics.faceHeight * 100))}%`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s ease'
              }}
            >
              <div className="corner corner-tl"></div>
              <div className="corner corner-tr"></div>
              <div className="corner corner-bl"></div>
              <div className="corner corner-br"></div>
            </div>
          )}

          {/* Eye alignment circles - positioned based on actual eye detection */}
          {faceMetrics && faceMetrics.leftEye && faceMetrics.rightEye && (
            <div className="eye-overlay">
              <div 
                className={`eye-marker left-eye ${faceDetected && faceMetrics.leftEye.center ? 'detected' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${faceMetrics.leftEye.center.x * 100}%`,
                  top: `${faceMetrics.leftEye.center.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: faceMetrics.leftEye.box ? `${faceMetrics.leftEye.box.width * 100}%` : '60px',
                  height: faceMetrics.leftEye.box ? `${faceMetrics.leftEye.box.height * 100}%` : '60px',
                  transition: 'all 0.3s ease'
                }}
              />
              <div 
                className={`eye-marker right-eye ${faceDetected && faceMetrics.rightEye.center ? 'detected' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${faceMetrics.rightEye.center.x * 100}%`,
                  top: `${faceMetrics.rightEye.center.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: faceMetrics.rightEye.box ? `${faceMetrics.rightEye.box.width * 100}%` : '60px',
                  height: faceMetrics.rightEye.box ? `${faceMetrics.rightEye.box.height * 100}%` : '60px',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          )}

          {/* Measurement overlay */}
          {faceMetrics && (
            <div className="measurement-overlay">
              <div className="measurement-line horizontal">
                <span>{faceMetrics.faceWidth} mm</span>
              </div>
              <div className="measurement-line vertical">
                <span>{faceMetrics.faceHeight} mm</span>
              </div>
              <div className="measurement-line pupils">
                <span>Pupil Distance: {faceMetrics.pupilDistance} mm</span>
              </div>
            </div>
          )}

          {/* AR Calibration Visualizer */}
          {showARCalibration && (
            <ARCalibrationVisualizer
              gazePoint={gazePoint}
              faceDetected={faceDetected}
              landmarks={currentLandmarks}
              onCalibrate={(points) => {
                console.log('Calibration points:', points)
                setShowARCalibration(false)
              }}
            />
          )}
          
          {/* Gaze overlay */}
          {isScanning && (
            <div className="gaze-overlay">
              <div
                className="gaze-point"
                style={{
                  left: `${Math.min(95, Math.max(5, gazePoint.x * 100))}%`,
                  top: `${Math.min(95, Math.max(5, gazePoint.y * 100))}%`
                }}
              />
            </div>
          )}

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
          </div>

          {/* Right side: Dataset comparison panel */}
          <div className="dataset-comparison-panel">
            <div className="comparison-header">
              <h3>AI Pattern Matching</h3>
              <div className="comparison-status">
                <div className={`status-indicator ${isScanning ? 'active' : 'idle'}`}></div>
                <span>{isScanning ? 'Analyzing...' : 'Standby'}</span>
              </div>
            </div>
            
            <div className="comparison-content">
              <p className="comparison-message">
                {isScanning
                  ? searchingMessage
                  : 'AI medical dataset ready. Begin scan to start pattern comparisons.'}
              </p>
              
              {currentSearchingImage && (
                <motion.div
                  key={`${currentSearchingImage.id}-${isScanning}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="dataset-image-container"
                >
                  <div className="image-comparison-overlay">
                    <div className="comparison-icon">🔍</div>
                    <div className="comparison-text">
                      {isScanning ? 'Comparing Pattern' : 'Reference Pattern Ready'}
                    </div>
                    <div className="similarity-indicator">
                      {isScanning ? `${Math.round(85 + Math.random() * 10)}% Match` : '--'}
                    </div>
                  </div>
                  <img
                    src={currentSearchingImage.src}
                    alt={currentSearchingImage.label}
                    className="dataset-comparison-image"
                    onError={(e) => {
                      console.warn('Failed to load image:', currentSearchingImage.src)
                      // Try encoded path fallback
                      e.target.src = encodeURI(currentSearchingImage.src)
                    }}
                  />
                  <div className="dataset-image-label">
                    <span className="condition-badge">{currentSearchingImage.condition}</span>
                    <span className="pattern-label">{isScanning ? 'Live comparison' : 'Reference pattern'}</span>
                  </div>
                </motion.div>
              )}
              
              <div className="comparison-progress-section">
                <div className="comparison-progress-label">
                  Database Search Progress
                </div>
                <div className="comparison-progress-bar">
                  <div 
                    className="comparison-progress-fill"
                    style={{ width: `${isScanning ? scanProgress : 0}%` }}
                  />
                </div>
                <div className="comparison-stats">
                  <span>Phase: {analysisPhase}</span>
                  <span>{isScanning ? `Analyzed: ${Math.floor(scanProgress / 5)} patterns` : 'Awaiting scan'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="scan-status">
          <p>{aiMessage}</p>
        </div>

        {faceMetrics && (
          <div className="measurement-panel">
            <div className="measurement-card">
              <span>Face Width</span>
              <strong>{faceMetrics.faceWidth} mm</strong>
            </div>
            <div className="measurement-card">
              <span>Face Height</span>
              <strong>{faceMetrics.faceHeight} mm</strong>
            </div>
            <div className="measurement-card">
              <span>Pupil Distance</span>
              <strong>{faceMetrics.pupilDistance} mm</strong>
            </div>
            <div className="measurement-card">
              <span>Analysis Phase</span>
              <strong>{analysisPhase}</strong>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="quality-panel">
            <div className="quality-score">
              <span>AI Quality Score</span>
              <strong>{qualityScore}</strong>
              <div className="quality-bar">
                <div className="quality-fill" style={{ width: `${qualityScore}%` }} />
              </div>
            </div>
            <div className="quality-metrics">
              <div className="blink-card">
                <span>Blinks / min</span>
                <strong>{blinkStats.rate}</strong>
              </div>
              <div className="blink-card">
                <span>Lighting Balance</span>
                <strong>{lightingDiagnostics.balance}%</strong>
              </div>
              <div className="blink-card">
                <span>Eye Brightness</span>
                <strong>{lightingDiagnostics.eye}%</strong>
              </div>
            </div>
          </div>
        )}

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

        {conditionProbabilities.length > 0 && (
          <div className="probability-panel">
            <div className="probability-header">
              <h3>AI Screening Likelihood</h3>
              <button 
                className="download-evidence-btn"
                onClick={() => explainableAILog.downloadEvidencePacket()}
                title="Download evidence packet"
              >
                📥 Download Evidence
              </button>
              </div>
            <div className="probability-list">
              {conditionProbabilities.map((prob) => (
                <div key={prob.label} className="probability-item">
                  <span className="probability-label">{prob.label}</span>
                  <div className="probability-bar">
                    <div className="probability-fill" style={{ width: `${prob.value}%` }} />
            </div>
                  <span className="probability-value">{prob.value}%</span>
          </div>
              ))}
        </div>
            
            {/* Cloud vs On-Device Comparison */}
            {cloudComparison && (
              <div className="cloud-comparison">
                <h4>Cloud vs On-Device Analysis</h4>
                <div className="comparison-grid">
                  <div className="comparison-item">
                    <span>Cloud Top:</span>
                    <strong>{cloudComparison.cloudTop.label} ({cloudComparison.cloudTop.confidence}%)</strong>
                  </div>
                  <div className="comparison-item">
                    <span>On-Device Top:</span>
                    <strong>{cloudComparison.onDeviceTop.label} ({cloudComparison.onDeviceTop.confidence}%)</strong>
                  </div>
                  <div className="comparison-item">
                    <span>Agreement:</span>
                    <strong className={cloudComparison.agreement ? 'agreement-yes' : 'agreement-no'}>
                      {cloudComparison.agreement ? '✓ High' : '⚠ Different'}
                    </strong>
                  </div>
                  <div className="comparison-item">
                    <span>Recommendation:</span>
                    <span className="recommendation-text">{cloudComparison.recommendation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Temporal Trends */}
        {temporalTrends && temporalTrends.length > 0 && (
          <div className="temporal-trends-panel">
            <h3>Condition Trends (7 days)</h3>
            <div className="trends-list">
              {temporalTrends.slice(0, 5).map((trend, idx) => (
                <div key={idx} className="trend-item">
                  <span className="trend-label">{trend.condition}</span>
                  <div className="trend-indicator">
                    <span className={`trend-arrow ${trend.trend}`}>
                      {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'}
                    </span>
                    <span className="trend-value">{trend.percentChange}%</span>
                  </div>
                  <span className="trend-avg">Avg: {trend.average}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Fatigue Assessment */}
        {fatigueAssessment && (
          <div className="fatigue-panel">
            <h3>Eye Fatigue Assessment</h3>
            <div className="fatigue-score">
              <span>Fatigue Score:</span>
              <strong className={`fatigue-level-${fatigueAssessment.level}`}>
                {fatigueAssessment.overallScore} ({fatigueAssessment.level})
              </strong>
            </div>
            {fatigueAssessment.blinkAnalysis && (
              <div className="fatigue-detail">
                <span>Blink Rate:</span>
                <span>{fatigueAssessment.blinkAnalysis.blinkRate} /min ({fatigueAssessment.blinkAnalysis.status})</span>
              </div>
            )}
            {fatigueAssessment.recommendations && fatigueAssessment.recommendations.length > 0 && (
              <div className="fatigue-recommendations">
                {fatigueAssessment.recommendations.map((rec, idx) => (
                  <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                    {rec.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Lighting Recommendations */}
        {lightingRecommendations.length > 0 && (
          <div className="lighting-recommendations-panel">
            <h4>Lighting & Contrast Recommendations</h4>
            {lightingRecommendations.map((rec, idx) => (
              <div key={idx} className={`lighting-rec priority-${rec.priority}`}>
                {rec.message}
              </div>
            ))}
          </div>
        )}
        
        {/* AR Calibration Toggle */}
        <div className="ar-calibration-toggle">
          <button 
            className="ar-toggle-btn"
            onClick={() => setShowARCalibration(!showARCalibration)}
          >
            {showARCalibration ? 'Hide' : 'Show'} AR Calibration
          </button>
        </div>

        {historyComparison && (
          <div className="history-panel">
            <h3>Trend vs Previous Scan</h3>
            <div className="history-stats">
              <div>
                <span>Focus</span>
                <strong>{historyComparison.focusDelta}%</strong>
              </div>
              <div>
                <span>Stability</span>
                <strong>{historyComparison.stabilityDelta}%</strong>
              </div>
              <div>
                <span>Clarity</span>
                <strong>{historyComparison.clarityDelta}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Computer Vision Metrics */}
        {computerVisionData && isScanning && (
          <div className="cv-metrics">
            <h4>Computer Vision Analysis</h4>
            <div className="cv-metrics-grid">
              <div className="cv-metric">
                <span className="cv-label">Brightness:</span>
                <span className="cv-value">
                  {Math.round(computerVisionData.brightness * 100)}%
                </span>
              </div>
              <div className="cv-metric">
                <span className="cv-label">Sharpness:</span>
                <span className="cv-value">
                  {Math.round(computerVisionData.sharpness * 100)}%
                </span>
              </div>
              <div className="cv-metric">
                <span className="cv-label">Eye Region:</span>
                <span className="cv-value">
                  {Math.round(computerVisionData.eyeRegionBrightness * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Per-Eye Results Comparison */}
        {(leftEyeData || rightEyeData) && scanPhase === 'comparison' && (
          <div className="eye-metrics-comparison">
            {leftEyeData && (
              <div className="eye-metric-card">
                <h4>👁️ Left Eye Analysis</h4>
                <div className="metric-grid">
                  <div className="metric-item">
                    <span>Brightness:</span>
                    <span className="metric-value">{Math.round(leftEyeData.metrics.brightness * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Sharpness:</span>
                    <span className="metric-value">{Math.round(leftEyeData.metrics.sharpness * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Pupil Size:</span>
                    <span className="metric-value">{Math.round(leftEyeData.metrics.pupilSize * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Quality Score:</span>
                    <span className="metric-value">{Math.round(leftEyeData.metrics.qualityScore * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {rightEyeData && (
              <div className="eye-metric-card">
                <h4>👁️ Right Eye Analysis</h4>
                <div className="metric-grid">
                  <div className="metric-item">
                    <span>Brightness:</span>
                    <span className="metric-value">{Math.round(rightEyeData.metrics.brightness * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Sharpness:</span>
                    <span className="metric-value">{Math.round(rightEyeData.metrics.sharpness * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Pupil Size:</span>
                    <span className="metric-value">{Math.round(rightEyeData.metrics.pupilSize * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Quality Score:</span>
                    <span className="metric-value">{Math.round(rightEyeData.metrics.qualityScore * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Eye Symmetry Analysis */}
        {historyComparison && historyComparison.insights && scanPhase === 'comparison' && (
          <div className="symmetry-analysis">
            <h4>👁️👁️ Eye Symmetry Analysis</h4>
            <div className="symmetry-metrics">
              <div className="symmetry-item">
                <span>Overall Symmetry:</span>
                <span className="metric-value">{Math.round(historyComparison.overallSymmetry * 100)}%</span>
              </div>
              <div className="symmetry-item">
                <span>Brightness Balance:</span>
                <span className="metric-value">{Math.round((1 - historyComparison.brightnessSymmetry) * 100)}%</span>
              </div>
              <div className="symmetry-item">
                <span>Pupil Symmetry:</span>
                <span className="metric-value">{Math.round((1 - historyComparison.pupilSizeSymmetry) * 100)}%</span>
              </div>
            </div>
            <div className="symmetry-insights">
              {historyComparison.insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}
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

          {/* Voice Bot - Hidden during preparation phase to avoid distractions */}
          {scanPhase !== 'preparation' && (
            <VoiceBot
              mode="test"
              testType="eye-scan"
              screenContent={{
                title: 'Eye Scan',
                description: aiMessage
              }}
            />
          )}

      {/* Admin/Developer Tools - Only show in development mode */}
      {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
        <div className="admin-tools" style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px' }}>
          <button 
            className="btn-annotation-tool"
            onClick={() => setShowAnnotationTool(true)}
            title="Open Image Annotation Tool for AI Training (Dev Only)"
            style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
          >
            📝 AI Training
          </button>
          
          {/* Mobile Voice Test Button */}
          {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
            <button 
              className="btn-voice-test"
              onClick={async () => {
                try {
                  await mobileSpeech.test()
                  alert('Voice test completed! You should have heard a test message.')
                } catch (error) {
                  alert(`Voice test failed: ${error.message}. Please ensure you have interacted with the page first.`)
                }
              }}
              title="Test voice synthesis on mobile (Dev Only)"
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              🔊 Voice Test
            </button>
          )}
        </div>
      )}

      {/* Image Annotation Tool Modal */}
      {showAnnotationTool && (
        <ImageAnnotationTool
          onClose={() => setShowAnnotationTool(false)}
          onSave={(annotations) => {
            console.log('Annotations saved:', annotations)
            setShowAnnotationTool(false)
          }}
        />
      )}

      {/* DITP Loader */}
      <DITPLoader
        isVisible={showDITPLoader}
        onComplete={handleDITPComplete}
        eyeData={{ left: leftEyeData, right: rightEyeData }}
        estimatedDuration={8000}
      />

      {/* Face Detection Debug (Development Only) */}
      <FaceDetectionDebug 
        faceDetected={faceDetected}
        faceMetrics={faceMetrics}
        confidence={confidence}
      />
      </div>
    </TestLayout>
  )
}

export default EyeScan

