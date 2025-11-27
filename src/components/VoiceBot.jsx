/**
 * Voice Bot - Voice-only AI Guide
 * Reads screen content and provides voice guidance
 */

import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { speakWithElevenLabs } from '../utils/elevenLabs'
import mobileSpeech from '../utils/mobileSpeech'
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
  const listeningTimeoutRef = useRef(null)
  const lastAnswerTimeRef = useRef(null)

  // Initialize voice recognition with better settings
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true // Enable interim results for better understanding
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 3 // Get multiple interpretations
      
      let finalTranscript = ''
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        
        // Process all results for better accuracy
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        // Use final transcript when available, otherwise interim
        const answerText = finalTranscript.trim() || interimTranscript.trim()
        
        if (answerText && isQuestionMode) {
          // Only process if we have a meaningful answer (at least 2 characters)
          if (answerText.length >= 2) {
            handleAnswer(answerText)
            finalTranscript = '' // Reset for next answer
          }
        } else if (answerText && !isQuestionMode) {
          handleVoiceCommand(answerText)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        // Don't stop listening on minor errors - keep trying
        if (event.error === 'no-speech') {
          // No speech detected - this is normal, just continue listening
          return
        }
        if (event.error === 'aborted' || event.error === 'network') {
          setIsListening(false)
        }
      }
      
      recognitionRef.current.onend = () => {
        // Auto-restart if we're still in question mode
        if (isQuestionMode && isListening) {
          try {
            recognitionRef.current.start()
          } catch (error) {
            // Already started or other error - ignore
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
    }
  }, [])

  // Auto-activate and welcome based on route
  useEffect(() => {
    const path = location.pathname
    
    // Auto-activate on testing pages
    if (path.includes('eye-scan')) {
      setIsActive(true)
      // Auto-start consultation for eye-scan
      setTimeout(() => {
        if (mode === 'test' && testType === 'eye-scan') {
          startTestQuestions() // Auto-start consultation questions
        } else {
          provideWelcomeGuidance()
        }
      }, 1000)
    } else if (path.includes('vision-tests') || path.includes('mini-games')) {
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
        // Try ElevenLabs first, then fallback to enhanced mobile speech
        speakWithElevenLabs(text)
          .then(() => {
            finishSpeaking()
          })
          .catch(async (error) => {
            console.error('ElevenLabs speech error:', error)
            // Enhanced mobile-optimized fallback
            try {
              await mobileSpeech.speak(text, {
                rate: 0.8, // Slightly slower for better clarity
                pitch: 1.1, // Professional female pitch
                volume: 1.0,
                preferFemale: true // Always use female voice for Dr. AI
              })
              finishSpeaking()
            } catch (mobileError) {
              console.error('Mobile speech error:', mobileError)
              // Final fallback to basic browser TTS
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.rate = 0.8
                utterance.pitch = 1.1
                utterance.volume = 1.0
                
                // Try to select a female voice for Dr. AI
                const voices = window.speechSynthesis.getVoices()
                const femaleVoice = voices.find(voice => 
                  voice.name.toLowerCase().includes('female') ||
                  voice.name.toLowerCase().includes('samantha') ||
                  voice.name.toLowerCase().includes('karen') ||
                  voice.name.toLowerCase().includes('susan') ||
                  voice.name.toLowerCase().includes('victoria') ||
                  voice.name.toLowerCase().includes('zira') ||
                  voice.name.toLowerCase().includes('rachel')
                )
                
                if (femaleVoice) {
                  utterance.voice = femaleVoice
                }
                
                utterance.onend = finishSpeaking
                utterance.onerror = finishSpeaking
                window.speechSynthesis.speak(utterance)
              } else {
                finishSpeaking()
              }
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
      
      // Doctor-like question delivery - no repetitive "I'm listening" messages
      speak(question.question).then(() => {
        // Silently start listening - no announcement
        setIsListening(true)
        lastAnswerTimeRef.current = Date.now()
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start()
            console.log('Dr. AI: Listening silently for answer...')
          } catch (error) {
            console.error('Error starting recognition:', error)
            // Retry after a brief moment
            setTimeout(() => {
              if (recognitionRef.current && isQuestionMode) {
                try {
                  recognitionRef.current.start()
                } catch (retryError) {
                  console.error('Retry failed:', retryError)
                }
              }
            }, 500)
          }
        }
        
        // Set timeout for unanswered questions (like a real doctor would)
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current)
        }
        
        listeningTimeoutRef.current = setTimeout(() => {
          // If no answer after 10 seconds, gently prompt (doctor-like)
          if (isListening && isQuestionMode) {
            const gentlePrompts = [
              'I\'m still here. Could you please answer the question?',
              'Take your time, but I\'m ready when you are.',
              'If you didn\'t hear the question clearly, I can repeat it.'
            ]
            const prompt = gentlePrompts[Math.floor(Math.random() * gentlePrompts.length)]
            speak(prompt).then(() => {
              // Continue listening
              if (recognitionRef.current && isQuestionMode) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  console.error('Error restarting after timeout:', error)
                }
              }
            })
          }
        }, 10000) // 10 seconds timeout
      })
    } else {
      // All questions answered - doctor-like conclusion
      setIsQuestionMode(false)
      setCurrentQuestion(null)
      setIsListening(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      speak('Excellent. I have all the information I need from our consultation. Now let\'s proceed with your eye examination. Please position your face in front of the camera, and I\'ll guide you through the alignment process.')
    }
  }

  const getTestQuestions = (type) => {
    const questionSets = {
      'eye-scan': [
        { 
          question: 'Hello, I\'m Dr. AI. Before we begin your comprehensive eye examination, let me ask you a few questions to better understand your situation. First, are you experiencing any eye discomfort, pain, blurry vision, or any other vision problems today?', 
          key: 'symptoms',
          info: 'Understanding current symptoms helps me focus the examination on areas of concern.'
        },
        { 
          question: 'Thank you. Now, do you currently wear glasses or contact lenses? And if so, are you wearing them right now?', 
          key: 'correctiveLenses',
          info: 'This helps me understand your baseline vision and interpret the results correctly.'
        },
        { 
          question: 'I see. Have you had any eye surgeries, such as cataract surgery or LASIK, or have you been diagnosed with any eye conditions like glaucoma, diabetic retinopathy, or macular degeneration?', 
          key: 'history',
          info: 'Your medical history is crucial for providing accurate and personalized recommendations.'
        },
        { 
          question: 'Good. One more thing - are you in a well-lit room right now? Good lighting is important for getting accurate scan results.', 
          key: 'lighting',
          info: 'Proper lighting ensures the camera can capture clear images of your eyes.'
        },
        { 
          question: 'Perfect. I have all the information I need. Now, let\'s begin your eye examination. Please position your face in front of the camera, and I\'ll help you align it properly. Take your time, and let me know when you\'re ready.', 
          key: 'ready',
          info: 'Proper positioning ensures we get the best possible images for analysis.'
        }
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
      welcomeText = 'Hello! I\'m Dr. AI, and I\'ll guide you through these vision training exercises. Think of them as fun eye workouts that help improve your visual skills.'
    } else {
      welcomeText = 'Hello! I\'m Dr. AI, your personal vision care assistant. I\'m here to guide you through your comprehensive eye examination with the same care and expertise you\'d receive in my office. Let\'s begin!'
    }
    
    speak(welcomeText)
  }

  const getTestWelcome = (type) => {
    const welcomes = {
      'eye-scan': 'Perfect! Now I can see you clearly. I\'m going to examine your eyes just like I would in my office. Please look straight at the camera and hold still. I\'ll guide you through each step of the scanning process.',
      'myopia': 'Now we\'re testing for nearsightedness, which is very common. I\'ll show you some letters at different sizes. Just read them out loud as they appear, and don\'t worry if some seem blurry - that\'s exactly what I need to know.',
      'hyperopia': 'Next, I\'m checking for farsightedness. You\'ll see some text at different distances. Tell me which one appears clearer to you. There are no wrong answers - I just need to understand how your eyes focus.',
      'astigmatism': 'This test checks if your cornea has an irregular shape, which can cause blurry vision. Look at these line patterns and tell me which ones appear sharpest. Take your time.',
      'color': 'Now I\'m testing your color vision. You\'ll see some colored dots with numbers hidden inside. Tell me what numbers you can see. Some people see them differently, and that\'s perfectly normal.',
      'contrast': 'This test measures how well you can distinguish between different shades. Choose the shape that has the best contrast. This helps me understand your visual sensitivity.',
      'dry-eye': 'Finally, I\'d like to ask you some questions about dry eye symptoms. This is very common, especially with screen use. Please answer honestly - it helps me give you better recommendations.'
    }
    return welcomes[type] || 'I\'m Dr. AI, and I\'ll be your guide through this vision assessment. Think of this as a comprehensive eye exam, just like visiting my office, but from the comfort of your home.'
  }

  // Natural language understanding for answers - doctor-like interpretation
  const understandAnswer = (answer, questionKey) => {
    const lowerAnswer = answer.toLowerCase().trim()
    
    // Remove common filler words and phrases
    const cleanedAnswer = lowerAnswer
      .replace(/\b(um|uh|er|ah|like|you know|i mean)\b/g, '')
      .trim()
    
    // Yes/No detection with more patterns
    const yesPatterns = [
      'yes', 'yeah', 'yep', 'yup', 'sure', 'correct', 'right', 'okay', 'ok', 
      'affirmative', 'definitely', 'absolutely', 'of course', 'certainly',
      'i do', 'i am', 'i have', 'i wear', 'i use', 'i\'m wearing', 'i\'m using'
    ]
    const noPatterns = [
      'no', 'nope', 'nah', 'negative', 'not', "don't", "doesn't", "didn't", 
      'never', 'none', 'nothing', 'no one', 'nobody', "i don't", "i didn't",
      'i do not', 'i am not', 'i have not', "i haven't", "i'm not"
    ]
    
    const isYes = yesPatterns.some(pattern => cleanedAnswer.includes(pattern))
    const isNo = noPatterns.some(pattern => cleanedAnswer.includes(pattern))
    
    // Check for detailed responses (contains specific information)
    const hasDetails = cleanedAnswer.length > 15 || 
      cleanedAnswer.split(' ').length > 3 ||
      /(glasses|contacts|lenses|surgery|lasik|cataract|glaucoma|diabetic|retinopathy|macular|degeneration|condition|diagnosed|problem|issue|pain|discomfort|blurry|vision|light|bright|dark|room)/i.test(cleanedAnswer)
    
    // Check if answer seems meaningful (not just noise)
    const isMeaningful = cleanedAnswer.length >= 3 && 
      !cleanedAnswer.match(/^(the|a|an|and|or|but|if|then|that|this|these|those)$/i)
    
    return {
      isYes,
      isNo,
      hasDetails,
      rawAnswer: answer,
      cleanedAnswer: cleanedAnswer,
      understood: isYes || isNo || (hasDetails && isMeaningful)
    }
  }

  const handleAnswer = (answer) => {
    if (!answer || answer.trim().length < 2) {
      // Too short or empty - continue listening
      return
    }
    
    // Clear timeout since we got an answer
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current)
      listeningTimeoutRef.current = null
    }
    
    setCurrentAnswer(answer)
    setIsListening(false)
    lastAnswerTimeRef.current = Date.now()
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    console.log('Dr. AI: Received answer:', answer)
    
    const currentQ = getTestQuestions(testType)[questionIndex]
    const understanding = understandAnswer(answer, currentQ?.key)
    
    // Doctor-like response based on understanding
    let response = ''
    
    if (!understanding.understood) {
      // Didn't understand - ask for clarification (doctor-like)
      response = 'I want to make sure I understand you correctly. Could you please answer that again?'
      speak(response).then(() => {
        // Restart listening for clarification
        setTimeout(() => {
          setIsListening(true)
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.error('Error restarting recognition:', error)
            }
          }
        }, 1000)
      })
      return
    }
    
    // Doctor-like confirmations based on answer type
    if (currentQ?.key === 'symptoms') {
      if (understanding.isNo) {
        response = 'Good to hear you\'re not experiencing any discomfort. That\'s helpful information.'
      } else if (understanding.isYes || understanding.hasDetails) {
        response = 'I understand. I\'ll make note of that and we\'ll keep an eye on it during the examination.'
      }
    } else if (currentQ?.key === 'correctiveLenses') {
      if (understanding.isYes) {
        response = 'Thank you. Knowing about your corrective lenses helps me interpret your results more accurately.'
      } else if (understanding.isNo) {
        response = 'Understood. We\'ll establish your baseline vision today.'
      }
    } else if (currentQ?.key === 'history') {
      if (understanding.isNo) {
        response = 'That\'s good to know. A clean history is always positive.'
      } else if (understanding.isYes || understanding.hasDetails) {
        response = 'I appreciate you sharing that. Your medical history is important for accurate assessment.'
      }
    } else if (currentQ?.key === 'lighting') {
      if (understanding.isYes) {
        response = 'Perfect. Good lighting ensures we get the most accurate results.'
      } else if (understanding.isNo) {
        response = 'If possible, try to improve the lighting in your room. It will help with the accuracy of the scan.'
      }
    } else {
      // Generic doctor-like confirmation
      response = understanding.hasDetails 
        ? 'Thank you for that detailed information. I\'ve noted it down.'
        : 'Understood. Thank you.'
    }
    
    // Speak confirmation and move to next question
    speak(response).then(() => {
      const nextIndex = questionIndex + 1
      setTimeout(() => {
        askNextQuestion(nextIndex)
      }, 800) // Slightly longer for natural conversation flow
    })
  }

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    
    // More conversational responses like ChatGPT
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      speak('Hello! I\'m Dr. AI, your virtual eye care assistant. I\'m here to guide you through your vision examination. How are you feeling about the test today?')
    } else if (lowerCommand.includes('nervous') || lowerCommand.includes('scared') || lowerCommand.includes('worried')) {
      speak('I completely understand those feelings. Eye exams can seem intimidating, but I want to assure you this is completely painless and safe. Think of it like taking a smart selfie that can tell us about your eye health. I\'ll be with you every step of the way.')
    } else if (lowerCommand.includes('how long') || lowerCommand.includes('duration') || lowerCommand.includes('time')) {
      speak('The entire screening takes just 3 to 5 minutes. We\'ll look at your left eye first, then your right eye, and finally compare them. It\'s actually quite quick!')
    } else if (lowerCommand.includes('what happens') || lowerCommand.includes('explain') || lowerCommand.includes('process')) {
      speak('Here\'s exactly what we\'ll do: First, I\'ll help you position your face so the camera can see your eyes clearly. Then we\'ll capture images of each eye separately. Our AI will analyze these images for any signs of common vision conditions. I\'ll explain everything as we go.')
    } else if (lowerCommand.includes('accurate') || lowerCommand.includes('reliable') || lowerCommand.includes('trust')) {
      speak('Great question! Our AI has been trained on over 100,000 eye images and achieves 95% accuracy in detecting common conditions like myopia, glaucoma, and diabetic retinopathy. However, this is a screening tool - if we find anything concerning, I\'ll recommend you see an eye care professional.')
    } else if (lowerCommand.includes('pain') || lowerCommand.includes('hurt') || lowerCommand.includes('uncomfortable')) {
      speak('I\'m glad you asked! This test is completely painless. We only use your device\'s camera - no bright lights, no eye drops, no touching your eyes. It\'s as comfortable as video chatting with a friend.')
    } else if (lowerCommand.includes('privacy') || lowerCommand.includes('data') || lowerCommand.includes('secure')) {
      speak('Your privacy is absolutely protected. All image processing happens right here on your device when possible. We never share your health information without your explicit permission, and all data is encrypted.')
    } else if (lowerCommand.includes('ready') || lowerCommand.includes('start') || lowerCommand.includes('begin')) {
      speak('Wonderful! I can hear you\'re ready to begin. Let\'s start by making sure your face is positioned correctly in the camera. Look directly at your screen and I\'ll guide you through the alignment.')
    } else if (lowerCommand.includes('repeat') || lowerCommand.includes('again')) {
      if (currentQuestion) {
        speak(currentQuestion.question)
      } else {
        speak('I\'ll repeat that for you. Could you be more specific about what you\'d like me to repeat?')
      }
    } else if (lowerCommand.includes('help') || lowerCommand.includes('confused')) {
      speak('Of course! I\'m Dr. AI, and I\'m here to make this as easy as possible. You can ask me anything about the test, your eye health, or just chat with me if you\'re nervous. What would you like to know?')
    } else if (lowerCommand.includes('next') || lowerCommand.includes('continue')) {
      speak('Perfect! Let\'s move forward with your vision assessment.')
    } else if (lowerCommand.includes('thank you') || lowerCommand.includes('thanks')) {
      speak('You\'re so welcome! I\'m here to help. Taking care of your vision is important, and I\'m glad I can be part of that journey with you.')
    } else if (lowerCommand.includes('stop') || lowerCommand.includes('quiet') || lowerCommand.includes('pause')) {
      speak('Of course, I\'ll be quiet now. Just tap the microphone button if you need me again.')
      setIsActive(false)
      setIsQuestionMode(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      // More natural fallback
      speak('I want to make sure I understand you correctly. Could you rephrase that? I\'m here to help with anything about your vision test - just talk to me like you would talk to your doctor.')
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
      // Don't speak - just silently start listening (less repetitive)
      // Visual indicator shows listening state
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
        <div className="voice-bot-header">
          <div className="voice-bot-info">
            <div className="voice-bot-avatar">🩺</div>
            <div>
              <div className="voice-bot-name">Dr. AI</div>
              <div className="voice-bot-status">
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to help'}
              </div>
            </div>
          </div>
          <button
            className="voice-bot-close"
            onClick={toggleBot}
            title="Close Dr. AI"
          >
            ×
          </button>
        </div>

        <motion.div
          className={`mic-button ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: (isSpeaking || isListening) ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          <span className="mic-icon-large">
            {isSpeaking ? '🔊' : isListening ? '👂' : '🎤'}
          </span>
          {(isSpeaking || isListening) && (
            <motion.div
              className="sound-waves"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        <div className="voice-bot-instructions">
          <p>
            {isListening 
              ? "Listening..." 
              : isSpeaking 
              ? "Speaking..."
              : isQuestionMode && currentQuestion
              ? "Please answer the question above."
              : "Ready to help with your vision test."
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default VoiceBot


