import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DITPLoader.css'

const DITPLoader = ({ 
  isVisible, 
  onComplete, 
  eyeData = null,
  estimatedDuration = 8000 // 8 seconds total
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(estimatedDuration)
  const [stepProgress, setStepProgress] = useState(0)
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)

  const ditpSteps = [
    {
      id: 'preprocessing',
      title: 'Mobile Image Preprocessing',
      description: 'Normalizing illumination, adjusting contrast, removing noise',
      icon: '📱',
      duration: 1500, // 1.5 seconds
      color: '#3b82f6',
      tasks: [
        'Removing glare and reflections',
        'Adjusting contrast to clinical standards',
        'Correcting field-of-view alignment',
        'Filtering smartphone sensor noise'
      ]
    },
    {
      id: 'gan-translation',
      title: 'AI Image Translation',
      description: 'Converting mobile image to clinical-grade using GANs',
      icon: '🎨',
      duration: 3000, // 3 seconds
      color: '#8b5cf6',
      tasks: [
        'Applying CycleGAN domain translation',
        'Enhancing details with Pix2Pix',
        'Reconstructing layers with Diffusion model',
        'Generating Digital Eye Construct'
      ]
    },
    {
      id: 'feature-extraction',
      title: 'Clinical Feature Extraction',
      description: 'Extracting medical features for dataset alignment',
      icon: '🔍',
      duration: 2000, // 2 seconds
      color: '#10b981',
      tasks: [
        'Analyzing blood vessel patterns',
        'Measuring optic disc parameters',
        'Evaluating macula structure',
        'Detecting pathological features'
      ]
    },
    {
      id: 'domain-adaptation',
      title: 'Domain Adaptation',
      description: 'Aligning with medical datasets for clinical analysis',
      icon: '🧠',
      duration: 1500, // 1.5 seconds
      color: '#f59e0b',
      tasks: [
        'Matching Kaggle dataset standards',
        'Aligning with NIH/IDRiD formats',
        'Generating synthetic examples',
        'Finalizing clinical compatibility'
      ]
    }
  ]

  useEffect(() => {
    if (!isVisible) return

    startTimeRef.current = Date.now()
    setCurrentStep(0)
    setProgress(0)
    setTimeRemaining(estimatedDuration)
    setStepProgress(0)

    // Start the progression
    runDITPSimulation()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isVisible])

  const runDITPSimulation = async () => {
    let totalElapsed = 0

    for (let stepIndex = 0; stepIndex < ditpSteps.length; stepIndex++) {
      const step = ditpSteps[stepIndex]
      setCurrentStep(stepIndex)
      setStepProgress(0)

      // Animate step progress
      await animateStepProgress(step.duration, totalElapsed)
      totalElapsed += step.duration

      // Update overall progress
      const overallProgress = ((stepIndex + 1) / ditpSteps.length) * 100
      setProgress(overallProgress)
    }

    // Complete the process
    setTimeout(() => {
      onComplete?.()
    }, 500)
  }

  const animateStepProgress = (duration, startTime) => {
    return new Promise((resolve) => {
      const stepStartTime = Date.now()
      
      const updateProgress = () => {
        const elapsed = Date.now() - stepStartTime
        const stepProg = Math.min((elapsed / duration) * 100, 100)
        const totalElapsed = startTime + elapsed
        const remaining = Math.max(estimatedDuration - totalElapsed, 0)
        
        setStepProgress(stepProg)
        setTimeRemaining(remaining)
        
        // Update overall progress smoothly
        const overallProg = Math.min((totalElapsed / estimatedDuration) * 100, 100)
        setProgress(overallProg)

        if (elapsed < duration) {
          requestAnimationFrame(updateProgress)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(updateProgress)
    })
  }

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  const currentStepData = ditpSteps[currentStep]

  if (!isVisible) return null

  return (
    <div className="ditp-loader-overlay">
      <div className="ditp-loader-container">
        
        {/* Header */}
        <div className="ditp-header">
          <motion.div
            className="ditp-logo"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🔥
          </motion.div>
          <h1>Creating Digital Eye Construct</h1>
          <p>Transforming your mobile image to clinical-grade using AI</p>
        </div>

        {/* Eye Construction Visualization */}
        <div className="eye-construction">
          <div className="eye-container">
            
            {/* Base Eye Structure */}
            <div className="eye-base">
              <div className="sclera"></div>
              <div className="iris">
                <div className="pupil">
                  <motion.div
                    className="pupil-highlight"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>

            {/* Construction Layers */}
            <AnimatePresence>
              {currentStep >= 0 && (
                <motion.div
                  className="construction-layer preprocessing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {currentStep >= 1 && (
                <motion.div
                  className="construction-layer gan-translation"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {currentStep >= 2 && (
                <motion.div
                  className="construction-layer feature-extraction"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              
              {currentStep >= 3 && (
                <motion.div
                  className="construction-layer domain-adaptation"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </AnimatePresence>

            {/* Scanning Effect */}
            <motion.div
              className="scan-line"
              animate={{ 
                y: [-100, 100],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />

            {/* Construction Particles */}
            <div className="construction-particles">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  animate={{
                    x: [0, Math.random() * 200 - 100],
                    y: [0, Math.random() * 200 - 100],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  style={{
                    backgroundColor: currentStepData?.color || '#3b82f6'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Information */}
        <div className="progress-info">
          
          {/* Overall Progress */}
          <div className="overall-progress">
            <div className="progress-header">
              <h3>Overall Progress</h3>
              <div className="progress-stats">
                <span className="percentage">{Math.round(progress)}%</span>
                <span className="time-remaining">
                  {timeRemaining > 0 ? formatTime(timeRemaining) : 'Completing...'}
                </span>
              </div>
            </div>
            
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="current-step">
            <div className="step-header">
              <div className="step-icon" style={{ color: currentStepData?.color }}>
                {currentStepData?.icon}
              </div>
              <div className="step-info">
                <h4>{currentStepData?.title}</h4>
                <p>{currentStepData?.description}</p>
              </div>
              <div className="step-progress">
                {Math.round(stepProgress)}%
              </div>
            </div>
            
            <div className="step-progress-bar">
              <motion.div
                className="step-progress-fill"
                style={{ 
                  width: `${stepProgress}%`,
                  backgroundColor: currentStepData?.color 
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Current Tasks */}
          <div className="current-tasks">
            <h5>Current Tasks:</h5>
            <div className="task-list">
              {currentStepData?.tasks.map((task, index) => {
                const taskProgress = Math.max(0, (stepProgress - (index * 25)) / 25) * 100
                const isActive = taskProgress > 0
                const isComplete = taskProgress >= 100
                
                return (
                  <motion.div
                    key={task}
                    className={`task-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="task-indicator">
                      {isComplete ? '✓' : isActive ? '⟳' : '○'}
                    </div>
                    <span className="task-text">{task}</span>
                    {isActive && !isComplete && (
                      <div className="task-progress">
                        <div 
                          className="task-progress-fill"
                          style={{ width: `${Math.min(taskProgress, 100)}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Step Indicators */}
          <div className="step-indicators">
            {ditpSteps.map((step, index) => (
              <div
                key={step.id}
                className={`step-indicator ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'complete' : ''}`}
              >
                <div 
                  className="step-dot"
                  style={{ 
                    backgroundColor: index <= currentStep ? step.color : '#e5e7eb',
                    borderColor: step.color
                  }}
                >
                  {index < currentStep ? '✓' : step.icon}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="technical-details">
          <div className="detail-item">
            <span className="label">Processing Mode:</span>
            <span className="value">Clinical-Grade DITP</span>
          </div>
          <div className="detail-item">
            <span className="label">Target Quality:</span>
            <span className="value">95% Medical Accuracy</span>
          </div>
          <div className="detail-item">
            <span className="label">Dataset Compatibility:</span>
            <span className="value">Kaggle, NIH, IDRiD, Messidor</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DITPLoader
