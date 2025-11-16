/**
 * Voice Bot - Voice-only AI Guide
 * Reads screen content and provides voice guidance
 */

import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { speakWithElevenLabs } from '../utils/elevenLabs'
import screenAnalyzer from '../utils/screenAnalyzer'
import './VoiceBot.css'

const VoiceBot = ({ 
  mode = 'general', // 'onboarding', 'test', 'game', 'results'
  testType = null,
  screenContent = null // Content to read from screen
}) => {
  const location = useLocation()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isQuestionMode, setIsQuestionMode] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentAnswer, setCurrentAnswer] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const recognitionRef = useRef(null)
  const speechQueueRef = useRef([])
  const isProcessingRef = useRef(false)
  const screenAnalysisRef = useRef(null)

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        if (isQuestionMode) {
          handleAnswer(transcript)
        } else {
          handleVoiceCommand(transcript)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Auto-activate and welcome based on route
  useEffect(() => {
    const path = location.pathname
    
    // Auto-activate on testing pages
    if (path.includes('vision-tests') || path.includes('eye-scan') || path.includes('mini-games')) {
      setIsActive(true)
      setTimeout(() => {
        provideWelcomeGuidance()
      }, 1000)
    } else if (path === '/onboarding') {
      setIsActive(true)
      setTimeout(() => {
        speak('Welcome to Quick Optics AI! I\'ll guide you through the setup process. Swipe through the slides to learn more.')
      }, 500)
    } else if (path === '/results') {
      setIsActive(true)
      setTimeout(() => {
        speak('Here are your vision test results. I can help explain what they mean.')
      }, 1000)
    }
  }, [location.pathname, mode, testType])

  // Silently analyze screen content when it changes
  useEffect(() => {
    if (screenContent && isActive) {
      // Analyze silently without speaking
      const analysis = screenAnalyzer.analyze(screenContent)
      screenAnalysisRef.current = analysis
      
      // Only speak if guidance is needed
      const needsCommunication = screenAnalyzer.getCommunicationNeeds(screenContent)
      if (needsCommunication !== 'none') {
        provideContextualGuidance(screenContent, needsCommunication)
      }
    }
  }, [screenContent, isActive])

  const speak = async (text) => {
    if (!text || isProcessingRef.current) return Promise.resolve()
    
    isProcessingRef.current = true
    setIsSpeaking(true)

    return new Promise((resolve) => {
      const finishSpeaking = () => {
        setIsSpeaking(false)
        isProcessingRef.current = false
        processQueue()
        resolve()
      }

      try {
        speakWithElevenLabs(text)
          .then(() => {
            finishSpeaking()
          })
          .catch((error) => {
            console.error('Speech error:', error)
            // Fallback to browser TTS with female voice
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text)
              utterance.rate = 0.9
              utterance.pitch = 1.2 // Higher pitch for female voice
              // Try to use a female voice
              const voices = window.speechSynthesis.getVoices()
              const femaleVoice = voices.find(v => 
                v.name.toLowerCase().includes('female') || 
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('samantha')
              )
              if (femaleVoice) utterance.voice = femaleVoice
              
              utterance.onend = finishSpeaking
              utterance.onerror = finishSpeaking
              window.speechSynthesis.speak(utterance)
            } else {
              finishSpeaking()
            }
          })
      } catch (error) {
        console.error('Speech setup error:', error)
        finishSpeaking()
      }
    })
  }

  const processQueue = () => {
    if (speechQueueRef.current.length > 0 && !isProcessingRef.current) {
      const nextText = speechQueueRef.current.shift()
      speak(nextText)
    }
  }

  const queueSpeech = (text) => {
    speechQueueRef.current.push(text)
    if (!isProcessingRef.current) {
      processQueue()
    }
  }

  const provideContextualGuidance = (content, needs) => {
    if (needs === 'welcome') {
      if (mode === 'onboarding') {
        speak('Welcome to Quick Optics AI! Swipe through to learn more about our vision testing.')
      }
    } else if (needs === 'guidance') {
      if (content.description) {
        speak(content.description)
      }
    } else if (needs === 'instruction') {
      if (mode === 'test' && testType) {
        startTestQuestions()
      }
    }
  }

  const startTestQuestions = () => {
    setIsQuestionMode(true)
    setQuestionIndex(0)
    askNextQuestion(0)
  }

  const askNextQuestion = (index) => {
    const questions = getTestQuestions(testType)
    if (index < questions.length) {
      const question = questions[index]
      setCurrentQuestion(question)
      setQuestionIndex(index)
      speak(question.question).then(() => {
        setIsListening(true)
        if (recognitionRef.current) {
          recognitionRef.current.start()
        }
      })
    } else {
      // All questions answered
      setIsQuestionMode(false)
      setCurrentQuestion(null)
      speak('Thank you for answering. Let\'s continue with the test.')
    }
  }

  const getTestQuestions = (type) => {
    const questionSets = {
      'eye-scan': [
        { question: 'Are you in a well-lit room?', key: 'lighting' },
        { question: 'Can you see the alignment frame clearly?', key: 'visibility' },
        { question: 'Are you comfortable and ready to begin?', key: 'ready' }
      ],
      'myopia': [
        { question: 'Can you read the letters on the screen?', key: 'readability' },
        { question: 'Are the letters clear or blurry?', key: 'clarity' }
      ],
      'hyperopia': [
        { question: 'Which text appears clearer, near or far?', key: 'focus' }
      ],
      'astigmatism': [
        { question: 'Do all the lines appear equally clear?', key: 'uniformity' }
      ],
      'color': [
        { question: 'Can you see the numbers in the colored circles?', key: 'colorVision' }
      ]
    }
    
    return questionSets[type] || []
  }

  const provideWelcomeGuidance = () => {
    let welcomeText = ''
    
    if (mode === 'test') {
      welcomeText = getTestWelcome(testType)
    } else if (mode === 'game') {
      welcomeText = 'Welcome to Vision Trainer! I\'ll guide you through each mini-game. Listen carefully to my instructions.'
    } else {
      welcomeText = 'Welcome! I\'m your voice guide. I\'ll help you through the vision testing process. Just listen and follow my instructions.'
    }
    
    speak(welcomeText)
  }

  const getTestWelcome = (type) => {
    const welcomes = {
      'eye-scan': 'Welcome to the Eye Scan! Please look straight at the camera and hold still. I will guide you through the scanning process.',
      'myopia': 'Starting the Myopia Test. This checks for nearsightedness. Read the letters as they appear and tell me what you see.',
      'hyperopia': 'Next is the Hyperopia Test. This measures farsightedness. Focus on the text and tell me which one is clearer.',
      'astigmatism': 'This is the Astigmatism Test. Look at the line patterns and identify which one appears clearest.',
      'color': 'Time for the Color Blindness Test. Look at the colored dots and tell me what number you see.',
      'contrast': 'Now the Contrast Sensitivity Test. Choose the shape with the best contrast.',
      'dry-eye': 'Finally, the Dry Eye Risk Test. Please answer the questions honestly.'
    }
    return welcomes[type] || 'Welcome to the vision test. I\'ll guide you through each step.'
  }

  const handleAnswer = (answer) => {
    setCurrentAnswer(answer)
    setIsListening(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Confirm the answer
    const confirmations = [
      'Got it, thank you.',
      'Understood.',
      'Perfect, I\'ve noted that.',
      'Thank you for that information.'
    ]
    const confirmation = confirmations[Math.floor(Math.random() * confirmations.length)]
    
    speak(confirmation).then(() => {
      // Move to next question
      const nextIndex = questionIndex + 1
      setTimeout(() => {
        askNextQuestion(nextIndex)
      }, 1000)
    })
  }

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('repeat') || lowerCommand.includes('again')) {
      if (currentQuestion) {
        speak(currentQuestion.question)
      }
    } else if (lowerCommand.includes('help')) {
      speak('I\'m here to guide you. Just answer my questions or say "repeat" if you need me to repeat anything.')
    } else if (lowerCommand.includes('next') || lowerCommand.includes('continue')) {
      speak('Great! Let\'s continue.')
    } else if (lowerCommand.includes('stop') || lowerCommand.includes('quiet')) {
      setIsActive(false)
      setIsQuestionMode(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      if (isQuestionMode && currentQuestion) {
        speak('I\'m listening for your answer.')
      } else {
        speak('I\'m listening. You can ask me to repeat instructions or say "help" for assistance.')
      }
    }
  }

  const toggleBot = () => {
    if (isActive) {
      setIsActive(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } else {
      setIsActive(true)
      provideWelcomeGuidance()
    }
  }

  // Expose functions globally for other components
  useEffect(() => {
    window.voiceBot = {
      speak,
      queueSpeech,
      provideGuidance: (text) => speak(text),
      startQuestions: startTestQuestions,
      analyzeScreen: (content) => screenAnalyzer.analyze(content)
    }

    return () => {
      delete window.voiceBot
    }
  }, [])

  // Load voices for fallback TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  if (!isActive) {
    return (
      <motion.button
        className="voice-bot-toggle"
        onClick={toggleBot}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <span className="mic-icon">🎤</span>
        <span className="toggle-label">Voice Guide</span>
      </motion.button>
    )
  }

  return (
    <motion.div
      className="voice-bot-container"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <div className="voice-bot-main">
        <motion.div
          className={`mic-button ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          <span className="mic-icon-large">🎤</span>
          {isSpeaking && (
            <motion.div
              className="sound-waves"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
        

        <button
          className="voice-bot-close"
          onClick={toggleBot}
          title="Close Voice Guide"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

export default VoiceBot


