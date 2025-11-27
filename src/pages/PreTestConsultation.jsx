import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceBot from '../components/VoiceBot'
import TestLayout from '../components/TestLayout'
import aiProcessor from '../services/aiProcessor'
import './PreTestConsultation.css'

const PreTestConsultation = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [userResponses, setUserResponses] = useState({})
  const [recommendedTests, setRecommendedTests] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [consultationComplete, setConsultationComplete] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [instructionStep, setInstructionStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const instructionScreens = [
    {
      id: 'welcome',
      title: 'Welcome to Your Personal Vision Consultation',
      subtitle: 'Meet Dr. AI - Your Virtual Eye Care Specialist',
      description: 'I\'ll ask you a few questions to understand your vision needs and recommend the perfect tests for you.',
      icon: '🩺',
      animation: 'fadeInUp',
      tips: [
        'This consultation takes about 2-3 minutes',
        'You can speak naturally or use the buttons',
        'All your responses are completely private',
        'I\'ll create a personalized assessment plan for you'
      ]
    },
    {
      id: 'voice-setup',
      title: 'Let\'s Set Up Voice Interaction',
      subtitle: 'Talk to me naturally, just like a real doctor visit',
      description: 'You can speak your answers or click the options. I\'ll listen carefully to understand your needs.',
      icon: '🎤',
      animation: 'slideInRight',
      tips: [
        'Speak clearly and naturally',
        'I understand conversational language',
        'You can ask me questions anytime',
        'Don\'t worry about perfect grammar'
      ]
    },
    {
      id: 'privacy',
      title: 'Your Privacy is Protected',
      subtitle: 'Professional-grade security for your health data',
      description: 'Everything we discuss is confidential and secure. Your vision health information is never shared without your permission.',
      icon: '🔒',
      animation: 'zoomIn',
      tips: [
        'All data is encrypted and secure',
        'No information shared with third parties',
        'You control your health data',
        'HIPAA-compliant privacy standards'
      ]
    },
    {
      id: 'ready',
      title: 'Ready to Begin?',
      subtitle: 'Let\'s discover your vision health together',
      description: 'I\'m excited to help you understand your vision needs. Let\'s start with a friendly conversation about how you\'ve been feeling about your eyesight.',
      icon: '✨',
      animation: 'bounceIn',
      tips: [
        'Be honest about any concerns',
        'No question is too small',
        'I\'m here to help, not judge',
        'This is your personalized consultation'
      ]
    }
  ]

  const consultationSteps = [
    {
      id: 'welcome',
      question: "Hello! I'm Dr. AI, your personal vision care assistant. I'd like to learn about your vision concerns to recommend the best tests for you. How are you feeling about your vision lately?",
      options: ['Great, no issues', 'Some concerns', 'Significant problems', 'Just want a checkup'],
      followUp: "Thank you for sharing that with me."
    },
    {
      id: 'symptoms',
      question: "Do you experience any of these symptoms? You can tell me about blurry vision, eye strain, headaches, difficulty seeing at night, or any other concerns.",
      options: ['Blurry vision', 'Eye strain/fatigue', 'Headaches', 'Night vision issues', 'No symptoms'],
      followUp: "I understand. Let me note that down."
    },
    {
      id: 'lifestyle',
      question: "Tell me about your daily activities. Do you spend a lot of time on screens, read frequently, drive at night, or have any specific visual demands?",
      options: ['Heavy screen use', 'Lots of reading', 'Night driving', 'Sports/outdoor activities', 'Office work'],
      followUp: "That's very helpful information for tailoring your assessment."
    },
    {
      id: 'history',
      question: "Do you have any family history of eye conditions like glaucoma, macular degeneration, or diabetes? Or do you currently wear glasses or contacts?",
      options: ['Family history of eye disease', 'Currently wear glasses/contacts', 'Diabetes in family', 'No known history'],
      followUp: "Thank you. This helps me understand your risk factors."
    }
  ]

  const nextInstructionStep = () => {
    if (instructionStep < instructionScreens.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setInstructionStep(instructionStep + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      startConsultation()
    }
  }

  const startConsultation = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setShowInstructions(false)
      setIsTransitioning(false)
    }, 500)
  }

  const skipInstructions = () => {
    setShowInstructions(false)
  }

  const analyzeResponsesAndRecommend = async () => {
    try {
      console.log('Processing consultation with AI...')
      
      // Process consultation with AI
      const consultationAnalysis = await aiProcessor.processConsultation(userResponses)
      
      // Get AI-generated recommendations
      const aiRecommendations = consultationAnalysis.recommendations
      
      // Store consultation analysis for later use
      localStorage.setItem('consultation_analysis', JSON.stringify(consultationAnalysis))
      
      setRecommendedTests(aiRecommendations)
      setConsultationComplete(true)
      
      console.log('Consultation analysis complete:', consultationAnalysis)
    } catch (error) {
      console.error('Failed to process consultation:', error)
      
      // Fallback to basic recommendations if AI fails
      const fallbackTests = [{
        id: 'comprehensive-scan',
        name: 'AI Eye Scan',
        description: 'Complete analysis of both eyes using advanced AI',
        duration: '3-5 minutes',
        priority: 'essential',
        reason: 'Provides baseline assessment of your overall eye health'
      }]
      
      setRecommendedTests(fallbackTests)
      setConsultationComplete(true)
    }
  }

  const handleStepComplete = (response) => {
    const step = consultationSteps[currentStep]
    setUserResponses(prev => ({
      ...prev,
      [step.id]: Array.isArray(response) ? response : [response]
    }))

    if (currentStep < consultationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      analyzeResponsesAndRecommend()
    }
  }

  const startRecommendedTests = () => {
    // Store recommended tests for the test process
    localStorage.setItem('recommended_tests', JSON.stringify(recommendedTests))
    navigate('/start-test')
  }

  if (consultationComplete) {
    return (
      <TestLayout
        title="Your Personalized Assessment Plan"
        description="Based on our consultation, here are my recommendations"
        onExit={() => navigate('/dashboard')}
      >
        <div className="consultation-results">
          <div className="results-header">
            <div className="doctor-avatar">🩺</div>
            <div>
              <h2>Dr. AI's Recommendations</h2>
              <p>Based on your responses, I've created a personalized vision assessment plan</p>
            </div>
          </div>

          <div className="recommended-tests">
            {recommendedTests.map((test, index) => (
              <motion.div
                key={test.id}
                className={`test-recommendation ${test.priority}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="test-priority">
                  {test.priority === 'essential' && '🔴'}
                  {test.priority === 'recommended' && '🟡'}
                  {test.priority === 'important' && '🟠'}
                </div>
                <div className="test-details">
                  <h3>{test.name}</h3>
                  <p>{test.description}</p>
                  <div className="test-meta">
                    <span className="duration">⏱️ {test.duration}</span>
                    <span className="reason">{test.reason}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="consultation-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={startRecommendedTests}
            >
              Start My Assessment ({recommendedTests.length} tests)
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Review Later
            </button>
          </div>
        </div>
      </TestLayout>
    )
  }

  const currentStepData = consultationSteps[currentStep]
  const currentInstruction = instructionScreens[instructionStep]

  // Immersive Instruction Screens
  if (showInstructions) {
    return (
      <div className="immersive-consultation">
        <div className="instruction-background">
          <div className="floating-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  '--delay': Math.random() * 3 + 's',
                  '--duration': Math.random() * 2 + 3 + 's',
                  '--x': Math.random() * 100 + '%',
                  '--y': Math.random() * 100 + '%'
                }}
              />
            ))}
          </div>
          
          <div className="instruction-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={instructionStep}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`instruction-screen ${isTransitioning ? 'transitioning' : ''}`}
              >
                <div className="instruction-content">
                  <motion.div 
                    className="instruction-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  >
                    {currentInstruction.icon}
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="instruction-title"
                  >
                    {currentInstruction.title}
                  </motion.h1>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="instruction-subtitle"
                  >
                    {currentInstruction.subtitle}
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="instruction-description"
                  >
                    {currentInstruction.description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="instruction-tips"
                  >
                    {currentInstruction.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                        className="tip-item"
                      >
                        <span className="tip-icon">✓</span>
                        <span className="tip-text">{tip}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="instruction-actions"
                >
                  <div className="progress-indicator">
                    <div className="progress-dots">
                      {instructionScreens.map((_, index) => (
                        <div
                          key={index}
                          className={`progress-dot ${index === instructionStep ? 'active' : ''} ${index < instructionStep ? 'completed' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="progress-text">
                      {instructionStep + 1} of {instructionScreens.length}
                    </span>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline"
                      onClick={skipInstructions}
                    >
                      Skip Introduction
                    </button>
                    <button 
                      className="btn btn-primary btn-large"
                      onClick={nextInstructionStep}
                    >
                      {instructionStep === instructionScreens.length - 1 ? 'Start Consultation' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TestLayout
      title="Vision Consultation"
      description="Let's discuss your vision health"
      currentStep={currentStep + 1}
      totalSteps={consultationSteps.length}
      onExit={() => navigate('/dashboard')}
    >
      <div className="consultation-page">
        <div className="consultation-container">
          <div className="doctor-section">
            <div className="doctor-avatar large">🩺</div>
            <div className="doctor-info">
              <h2>Dr. AI</h2>
              <p>Virtual Eye Care Specialist</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="consultation-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="question-bubble">
                <p>{currentStepData.question}</p>
              </div>

              <div className="response-options">
                {currentStepData.options.map((option, index) => (
                  <motion.button
                    key={option}
                    className="option-button"
                    onClick={() => handleStepComplete(option)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              <div className="voice-prompt">
                <p>💬 You can also just talk to me naturally - I'm listening!</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Voice Bot for Consultation */}
        <VoiceBot
          mode="consultation"
          onResponse={handleStepComplete}
          currentQuestion={currentStepData.question}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      </div>
    </TestLayout>
  )
}

export default PreTestConsultation
