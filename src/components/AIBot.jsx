/**
 * Quick Optics AI Bot
 * Intelligent assistant for vision testing, eyewear recommendations, and eye-health support
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cvie from '../services/CVIE'
import './AIBot.css'

const AIBot = ({ 
  mode = 'test', // 'test', 'game', 'eyewear', 'general'
  testType = null,
  onInstruction = null,
  onAdjustment = null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentInstruction, setCurrentInstruction] = useState(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Initialize bot with welcome message
    if (mode === 'test' && testType) {
      addMessage('bot', getTestIntroduction(testType))
    } else if (mode === 'game') {
      addMessage('bot', 'Welcome to Vision Trainer! I\'ll guide you through the mini-games and help you improve your visual skills.')
    } else {
      addMessage('bot', 'Hello! I\'m your Quick Optics AI assistant. How can I help you today?')
    }

    // Initialize voice recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.onresult = handleVoiceInput
      recognitionRef.current.onerror = () => setIsListening(false)
    }
  }, [mode, testType])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (sender, text, type = 'text') => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      type,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    
    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleVoiceInput = (event) => {
    const transcript = event.results[0][0].transcript
    addMessage('user', transcript)
    processUserInput(transcript)
    setIsListening(false)
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processUserInput = (input) => {
    const lowerInput = input.toLowerCase()
    
    // Process commands
    if (lowerInput.includes('help') || lowerInput.includes('what')) {
      provideHelp()
    } else if (lowerInput.includes('next') || lowerInput.includes('continue')) {
      provideNextStep()
    } else if (lowerInput.includes('repeat') || lowerInput.includes('again')) {
      repeatLastInstruction()
    } else {
      addMessage('bot', 'I understand. Let me help you with that.')
    }
  }

  const provideHelp = () => {
    let helpText = ''
    if (mode === 'test') {
      helpText = 'I\'ll guide you through this vision test step by step. Make sure you\'re in a well-lit area and hold your device steady. Follow my instructions carefully for accurate results.'
    } else if (mode === 'game') {
      helpText = 'These mini-games test different aspects of your vision. I\'ll explain each game, help you calibrate, and provide feedback on your performance.'
    } else {
      helpText = 'I can help you with vision tests, eyewear recommendations, and general eye health questions. What would you like to know?'
    }
    addMessage('bot', helpText)
    if (voiceEnabled) speak(helpText)
  }

  const provideNextStep = () => {
    if (onInstruction) {
      onInstruction('next')
    }
  }

  const repeatLastInstruction = () => {
    if (currentInstruction) {
      addMessage('bot', currentInstruction)
      if (voiceEnabled) speak(currentInstruction)
    }
  }

  const getTestIntroduction = (testType) => {
    const introductions = {
      myopia: 'I\'ll guide you through the Myopia (nearsightedness) test. We\'ll check how well you can see distant objects. Please position yourself about 2 feet from the screen.',
      hyperopia: 'Let\'s test for Hyperopia (farsightedness). This measures your ability to focus on nearby objects. Make sure you\'re in a comfortable position.',
      astigmatism: 'The Astigmatism test checks for irregular curvature in your eye. I\'ll help you align properly for accurate results.',
      color: 'We\'ll test your color vision now. This is quick and easy - just tell me what colors you see.',
      contrast: 'The Contrast Sensitivity test measures how well you can distinguish objects from their background. Let\'s begin!',
      'dry-eye': 'I\'ll help you assess your dry eye risk. This involves monitoring your blink patterns and eye comfort.'
    }
    return introductions[testType] || 'I\'ll guide you through this vision test. Let\'s get started!'
  }

  // Real-time feedback functions
  const provideFeedback = (feedbackType, data) => {
    let message = ''
    
    switch (feedbackType) {
      case 'alignment':
        if (data.tooClose) {
          message = 'Move back a bit. You\'re too close to the camera.'
        } else if (data.tooFar) {
          message = 'Move closer to the screen for better accuracy.'
        } else if (data.offCenter) {
          message = 'Please center your face in the frame.'
        } else {
          message = 'Perfect position! Hold still.'
        }
        break
      
      case 'lighting':
        if (data.tooDark) {
          message = 'The lighting is too low. Try moving towards a window or turning on more lights.'
        } else if (data.tooBright) {
          message = 'The lighting is too bright. Try reducing glare or moving away from direct light.'
        } else {
          message = 'Lighting looks good!'
        }
        break
      
      case 'stability':
        if (data.moving) {
          message = 'Please hold your head steady for accurate results.'
        } else {
          message = 'Great! Keep holding still.'
        }
        break
      
      case 'blink':
        if (data.tooFrequent) {
          message = 'Try to blink normally. You\'re blinking a bit too frequently.'
        } else if (data.tooRare) {
          message = 'Remember to blink naturally to keep your eyes comfortable.'
        }
        break
      
      case 'performance':
        if (data.accuracy < 0.5) {
          message = 'Let\'s try that again. Take your time and focus carefully.'
        } else if (data.accuracy > 0.9) {
          message = 'Excellent! You\'re doing great. Let\'s continue.'
        }
        break
      
      default:
        message = data.message || 'Keep going!'
    }

    if (message) {
      addMessage('bot', message, 'feedback')
      if (voiceEnabled) speak(message)
      setCurrentInstruction(message)
      
      if (onAdjustment) {
        onAdjustment({ type: feedbackType, message, data })
      }
    }
  }

  // Expose feedback function for parent components
  useEffect(() => {
    if (window.quickOpticsBot) {
      window.quickOpticsBot.provideFeedback = provideFeedback
      window.quickOpticsBot.addMessage = addMessage
      window.quickOpticsBot.speak = speak
    } else {
      window.quickOpticsBot = { provideFeedback, addMessage, speak }
    }
  }, [])

  const handleSendMessage = (e) => {
    e.preventDefault()
    const input = e.target.message.value.trim()
    if (!input) return

    addMessage('user', input)
    processUserInput(input)
    e.target.reset()
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isListening) stopListening()
    if (isSpeaking) window.speechSynthesis.cancel()
  }

  return (
    <>
      {/* Bot Toggle Button */}
      <motion.button
        className="bot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="bot-icon">🤖</span>
        {isOpen ? 'Close' : 'AI Assistant'}
      </motion.button>

      {/* Bot Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bot-container"
          >
            <div className="bot-header">
              <div className="bot-header-info">
                <span className="bot-avatar">🤖</span>
                <div>
                  <h3>Quick Optics AI Bot</h3>
                  <p className="bot-status">Online • Ready to help</p>
                </div>
              </div>
              <div className="bot-controls">
                <button
                  className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
                  onClick={toggleVoice}
                  title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                >
                  {voiceEnabled ? '🔊' : '🔇'}
                </button>
                <button
                  className="bot-close"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="bot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${message.sender}`}
                >
                  {message.sender === 'bot' && (
                    <span className="message-avatar">🤖</span>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    {message.type === 'feedback' && (
                      <span className="message-type">Real-time feedback</span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="bot-input">
              <div className="input-container">
                <input
                  type="text"
                  name="message"
                  placeholder="Type a message or ask for help..."
                  disabled={isListening}
                />
                <div className="input-actions">
                  {voiceEnabled && (
                    <button
                      type="button"
                      className={`voice-button ${isListening ? 'listening' : ''}`}
                      onClick={isListening ? stopListening : startListening}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? '⏹️' : '🎤'}
                    </button>
                  )}
                  <button type="submit" className="send-button">
                    Send
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIBot

