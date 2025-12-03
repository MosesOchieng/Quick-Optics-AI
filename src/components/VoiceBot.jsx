/**
 * Voice Bot - Voice-only AI Guide
 * Reads screen content and provides voice guidance
 */

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { speakWithElevenLabs } from '../utils/elevenLabs'
import mobileSpeech from '../utils/mobileSpeech'
import screenAnalyzer from '../utils/screenAnalyzer'
import voiceActivityDetector from '../utils/voiceActivityDetection'
import conversationAI from '../utils/conversationAI'
import adaptiveLearning from '../services/adaptiveLearning'
import { useVoiceBot } from '../contexts/VoiceBotContext'
import './VoiceBot.css'

const VoiceBot = ({ 
  mode = 'general', // 'onboarding', 'test', 'game', 'results'
  testType = null,
  screenContent = null // Content to read from screen
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const voiceBotContext = useVoiceBot()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isQuestionMode, setIsQuestionMode] = useState(false)
  const [isQuietMode, setIsQuietMode] = useState(false) // New: Quiet mode state
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentAnswer, setCurrentAnswer] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [language, setLanguage] = useState('en') // 'en' for English, 'sw' for Swahili
  const recognitionRef = useRef(null)
  const speechQueueRef = useRef([])
  const isProcessingRef = useRef(false)
  const screenAnalysisRef = useRef(null)
  const listeningTimeoutRef = useRef(null)
  const lastAnswerTimeRef = useRef(null)
  const lastAnswerProcessedRef = useRef(0)
  const answerThrottleMs = 1000 // Prevent processing same answer multiple times
  
  // Learning and adaptation state
  const answerHistoryRef = useRef([]) // Store all answers for learning
  const userProfileRef = useRef({}) // Build user profile from answers
  const eyeMovementRef = useRef({ gazePoints: [], movements: [], stability: 0 })
  const adaptiveQuestionsRef = useRef([]) // Dynamically generated questions based on answers
  
  // Conversation memory and context for intelligent responses
  const conversationHistoryRef = useRef([]) // Store conversation context
  const userPreferencesRef = useRef({}) // Store user preferences and patterns
  const responseVariationsRef = useRef(new Map()) // Track response variations to avoid repetition
  const contextRef = useRef({}) // Current conversation context
  
  // Voice Activity Detection state
  const vadInitializedRef = useRef(false)
  const humanVoiceDetectedRef = useRef(false)
  const shouldListenRef = useRef(false)

  // Detect language from text - Enhanced with extensive Swahili vocabulary
  const detectLanguage = (text) => {
    const swahiliWords = [
      // Greetings and common words
      'jambo', 'habari', 'asante', 'karibu', 'pole', 'sawa', 'hapana', 'ndiyo', 'ndio', 'siyo', 'sio',
      'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao', 'hapa', 'huko', 'hapo', 'huku',
      'leo', 'kesho', 'jana', 'sasa', 'zamani', 'baadaye', 'kabla', 'baada', 'mwaka', 'mwezi', 'siku',
      'na', 'au', 'lakini', 'kwa', 'katika', 'kutoka', 'hadi', 'mpaka', 'kama', 'kwa sababu',
      // Eye and health related
      'macho', 'jicho', 'machozi', 'kuona', 'angalia', 'tazama', 'ona', 'mwangaza', 'giza',
      'afya', 'mgonjwa', 'daktari', 'hospitali', 'dawa', 'tiba', 'chakula', 'maji',
      'moto', 'baridi', 'nzuri', 'baya', 'kubwa', 'ndogo', 'refu', 'fupi', 'wazi', 'fifia',
      // Medical terms
      'upasuaji', 'uchunguzi', 'mtihani', 'dalili', 'hali', 'tatizo', 'maumivu', 'uchungu',
      'miwani', 'lenzi', 'macho', 'kuona', 'msaada', 'usaidizi',
      // Common phrases
      'tafadhali', 'samahani', 'pole sana', 'asante sana', 'karibu tena',
      'nina', 'sina', 'nimekuwa', 'sijawahi', 'navaa', 'sivai', 'natumia', 'situmii',
      'ninaweza', 'siwezi', 'nafahamu', 'sifahamu', 'naelewa', 'sielewi',
      // Numbers and quantities
      'moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa', 'kumi',
      'kidogo', 'sana', 'mengi', 'chache', 'yote', 'wote', 'zote',
      // Actions
      'fanya', 'anza', 'maliza', 'endelea', 'acha', 'ngoja', 'subiri',
      'sema', 'ongea', 'sikiliza', 'sikia', 'elewa', 'fahamu',
      // Questions
      'nini', 'wapi', 'lini', 'nani', 'kwa nini', 'jinsi gani', 'vipi',
      // Responses
      'sawa', 'haya', 'kweli', 'hakika', 'bila shaka', 'labda', 'pengine',
      'hapana', 'la', 'siyo', 'kamwe', 'hakuna', 'hamna'
    ]
    
    const lowerText = text.toLowerCase()
    const swahiliCount = swahiliWords.filter(word => {
      // Check for word boundaries to avoid false matches
      const regex = new RegExp(`\\b${word}\\b`, 'i')
      return regex.test(lowerText)
    }).length
    const totalWords = text.split(/\s+/).filter(w => w.length > 2).length // Only count meaningful words
    
    // If more than 15% of meaningful words are Swahili, consider it Swahili
    // Also check for common Swahili phrases
    const hasSwahiliPhrases = /(jambo|habari|asante|tafadhali|samahani|pole|sawa|hapana|ndiyo)/i.test(lowerText)
    
    if ((swahiliCount > 0 && (swahiliCount / Math.max(totalWords, 1)) > 0.15) || hasSwahiliPhrases) {
      return 'sw'
    }
    return 'en'
  }

  // Initialize voice recognition with better settings
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true // Continuous listening for automatic turn-taking
      recognitionRef.current.interimResults = false // Disable interim results to reduce processing
      // Support both English and Swahili - use Kenyan locale
      recognitionRef.current.lang = 'en-KE,sw-KE' // Kenyan English and Swahili
      recognitionRef.current.maxAlternatives = 1 // Reduced to 1 for better performance
      
      recognitionRef.current.onresult = (event) => {
        // Only process if human voice was detected
        if (!humanVoiceDetectedRef.current && !shouldListenRef.current) {
          return // Ignore non-human sounds
        }
        
        // Process all results for better accuracy, but prioritize final results
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        // Use final transcript if available, otherwise use interim
        const transcript = (finalTranscript || interimTranscript).trim()
        
        if (transcript && transcript.length >= 2) {
          // Verify it's likely human speech (contains words, not just noise)
          const hasWords = /\b\w{2,}\b/.test(transcript)
          if (hasWords) {
            // Log what was heard for debugging
            console.log('VoiceBot heard (human voice):', transcript, 'Language detected:', detectLanguage(transcript))
            
            if (isQuestionMode) {
              handleAnswer(transcript)
            } else {
              handleVoiceCommand(transcript)
            }
          }
        } else if (transcript.length > 0 && transcript.length < 2) {
          // Very short response - might be incomplete, wait for more
          console.log('Very short transcript, waiting for more:', transcript)
        }
      }
      
      // Auto-restart listening when it stops (for continuous voice activation)
      recognitionRef.current.onend = () => {
        // Only restart if we're active, not speaking, not in quiet mode, and human voice was detected
        if (isActive && !isSpeaking && !isQuietMode && recognitionRef.current && (humanVoiceDetectedRef.current || shouldListenRef.current)) {
          // Small delay before restarting to prevent rapid restarts
          setTimeout(() => {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch (error) {
              // Recognition might already be starting - ignore
            }
          }, 100)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        // Handle different error types with user-friendly messages
        if (event.error === 'no-speech') {
          // No speech detected - this is normal, just continue listening silently
          return
        } else if (event.error === 'network') {
          // Network errors are common and expected - don't spam console
          // Only log occasionally for debugging
          if (Math.random() < 0.01) { // Log ~1% of network errors
            console.warn('Speech recognition network error (this is normal if offline)')
          }
          // Try to restart after a delay
          if (isActive && !isSpeaking && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start()
                setIsListening(true)
              } catch (error) {
                // Ignore restart errors
              }
            }, 2000)
          }
          return
        } else if (event.error === 'audio-capture') {
          // Microphone not available
          if (isQuestionMode || isActive) {
            const errorMsg = language === 'sw'
              ? 'Samahani, naweza kuwa na shida kusikia. Tafadhali hakikisha mikrofoni yako imewashwa na inaruhusiwa.'
              : 'I\'m sorry, I might be having trouble hearing you. Please make sure your microphone is on and allowed.'
            speak(errorMsg)
          }
        } else if (event.error === 'not-allowed') {
          // Permission denied
          const errorMsg = language === 'sw'
            ? 'Samahani, nimekataliwa ruhusa ya kutumia mikrofoni. Tafadhali ruhusu mikrofoni katika mipangilio ya kivinjari chako.'
            : 'I\'m sorry, I was denied permission to use the microphone. Please allow microphone access in your browser settings.'
          speak(errorMsg)
        } else if (event.error === 'aborted') {
          // Recognition aborted - try to restart if still in question mode
          if (isQuestionMode && isActive) {
            setTimeout(() => {
              if (recognitionRef.current && isQuestionMode) {
                try {
                  recognitionRef.current.start()
                } catch (e) {
                  console.log('Could not restart recognition:', e)
                }
              }
            }, 1000)
          }
        } else if (event.error === 'network') {
          // Network error
          const errorMsg = language === 'sw'
            ? 'Samahani, kuna shida ya mtandao. Tafadhali hakikisha uko na muunganisho wa intaneti.'
            : 'I\'m sorry, there\'s a network issue. Please make sure you have an internet connection.'
          speak(errorMsg)
          setIsListening(false)
        } else {
          // Other errors - try to continue
          console.log('Recognition error, attempting to continue:', event.error)
          if (isQuestionMode && isActive) {
            setTimeout(() => {
              if (recognitionRef.current && isQuestionMode) {
                try {
                  recognitionRef.current.start()
                } catch (e) {
                  console.log('Could not restart after error:', e)
                }
              }
            }, 2000)
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

  // Load language preference and quiet mode from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('voiceBot_language')
    if (savedLang === 'sw' || savedLang === 'en') {
      setLanguage(savedLang)
    }
    
    const savedQuietMode = localStorage.getItem('voiceBot_quietMode')
    if (savedQuietMode === 'true') {
      setIsQuietMode(true)
      setIsActive(false)
    }
  }, [])

  // Save language preference and quiet mode
  useEffect(() => {
    localStorage.setItem('voiceBot_language', language)
    localStorage.setItem('voiceBot_quietMode', isQuietMode.toString())
  }, [language, isQuietMode])

  // Initialize Voice Activity Detection (even in quiet mode to detect wake commands)
  useEffect(() => {
    // Initialize VAD even in quiet mode so we can detect wake commands
    if (!vadInitializedRef.current) {
      voiceActivityDetector.initialize().then(initialized => {
        if (initialized) {
          vadInitializedRef.current = true
          
          // Start VAD to detect human voice
          voiceActivityDetector.startDetection(
            // On human voice detected
            (analysis) => {
              humanVoiceDetectedRef.current = true
              shouldListenRef.current = true
              
              // Start recognition if not already listening
              if (!isListening && recognitionRef.current && !isSpeaking) {
                try {
                  recognitionRef.current.start()
                  setIsListening(true)
                } catch (error) {
                  // Recognition might already be starting
                }
              }
            },
            // On silence detected
            (analysis) => {
              // Keep listening flag for a bit in case user pauses
              setTimeout(() => {
                if (!humanVoiceDetectedRef.current) {
                  shouldListenRef.current = false
                }
              }, 2000)
            }
          )
        }
      })
    }
    
    return () => {
      if (vadInitializedRef.current) {
        voiceActivityDetector.stopDetection()
      }
    }
  }, [isActive, isListening, isSpeaking])

  // Auto-activate and welcome based on route (only if not in quiet mode)
  useEffect(() => {
    if (isQuietMode) {
      // Don't auto-activate if in quiet mode
      return
    }
    
    const path = location.pathname
    
    // Auto-activate on testing pages
    if (path.includes('eye-scan')) {
      setIsActive(true)
      // VAD will handle starting recognition when human voice is detected
      setTimeout(() => {
        if (mode === 'test' && testType === 'eye-scan') {
          startTestQuestions() // Auto-start consultation questions
        } else {
          provideWelcomeGuidance()
        }
      }, 1000)
    } else if (path === '/dashboard') {
      // Auto-activate on dashboard with greeting - bilingual
      setIsActive(true)
      setTimeout(() => {
        const greeting = language === 'sw'
          ? 'Jambo! Mimi ni Quick Optics AI. Ninaweza kukusaidia na mtihani wako wa macho, kujibu maswali, au kukuongoza katika programu. Zungumza tu kwa asili - nasikiliza kila wakati.'
          : 'Hello! I\'m Quick Optics AI. I can help you with your vision testing, answer questions, or guide you through the app. Just speak naturally - I\'m always listening.'
        speak(greeting)
        // Start continuous listening on dashboard
        if (recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch (error) {
              console.log('Recognition already started or error:', error)
            }
          }, 2000)
        }
      }, 1000)
    } else if (path.includes('vision-tests') || path.includes('mini-games')) {
      setIsActive(true)
      setTimeout(() => {
        // Auto-start listening
        if (recognitionRef.current && !isSpeaking) {
          try {
            recognitionRef.current.start()
            setIsListening(true)
          } catch (error) {
            // Recognition might already be starting
          }
        }
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
  }, [location.pathname, mode, testType, language, isQuietMode])

  // Read and reason about screen content automatically
  useEffect(() => {
    if (screenContent && isActive && !isSpeaking && !isQuietMode) {
      // Analyze screen content
      const analysis = screenAnalyzer.analyze(screenContent)
      screenAnalysisRef.current = analysis
      
      // Read screen content and provide intelligent reasoning
      if (screenContent.title || screenContent.description) {
        const screenText = `${screenContent.title ? screenContent.title + '. ' : ''}${screenContent.description || ''}`
        if (screenText.trim().length > 10) {
          // Provide intelligent summary of what's on screen
          const summary = `I can see you're on the ${screenContent.title || 'page'}. ${screenContent.description || 'Let me know if you need help.'}`
          // Only speak if it's new information
          if (screenAnalysisRef.current?.lastSpoken !== summary) {
            screenAnalysisRef.current.lastSpoken = summary
            queueSpeech(summary)
          }
        }
      }
      
      // Check if guidance is needed
      const needsCommunication = screenAnalyzer.getCommunicationNeeds(screenContent)
      if (needsCommunication !== 'none') {
        provideContextualGuidance(screenContent, needsCommunication)
      }
    }
  }, [screenContent, isActive, isSpeaking])

  const speak = async (text) => {
    // Don't speak if in quiet mode
    if (isQuietMode) {
      console.log('VoiceBot: Quiet mode active, not speaking')
      return Promise.resolve()
    }
    
    if (!text || isProcessingRef.current) return Promise.resolve()
    
    isProcessingRef.current = true
    setIsSpeaking(true)

    return new Promise((resolve) => {
      const finishSpeaking = () => {
        setIsSpeaking(false)
        isProcessingRef.current = false
        
        // Reset voice detection flag - VAD will detect next human voice
        humanVoiceDetectedRef.current = false
        
        // VAD will automatically start recognition when human voice is detected
        // No need to manually start here - let VAD handle it
        
        processQueue()
        resolve()
      }

      try {
        // Detect language from text or use current language setting
        const detectedLang = detectLanguage(text) || language
        
        // Try ElevenLabs first with language detection, then fallback to enhanced mobile speech
        speakWithElevenLabs(text, undefined, detectedLang)
          .then(() => {
            finishSpeaking()
          })
          .catch(async (error) => {
            console.error('ElevenLabs speech error:', error)
            // Enhanced mobile-optimized fallback with language support
            try {
              await mobileSpeech.speak(text, {
                rate: 0.8, // Slightly slower for better clarity
                pitch: 1.1, // Natural pitch
                volume: 1.0,
                preferFemale: true, // Always use female voice
                lang: detectedLang === 'sw' ? 'sw-KE' : 'en-KE' // Kenyan locale
              })
              finishSpeaking()
            } catch (mobileError) {
              console.error('Mobile speech error:', mobileError)
              // Final fallback to basic browser TTS with language
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.rate = 0.8
                utterance.pitch = 1.1
                utterance.volume = 1.0
                utterance.lang = detectedLang === 'sw' ? 'sw-KE' : 'en-KE'
                
                // Try to select a Kenyan/Swahili voice, then female voice
                const voices = window.speechSynthesis.getVoices()
                const selectedVoice = voices.find(voice => 
                  voice.lang.includes('sw') || voice.lang.includes('KE')
                ) || voices.find(voice => 
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
      
      // Intelligent, natural question delivery with context
      const stepNumber = index + 1
      const totalSteps = questions.length
      
      // Use ConversationAI to generate natural question introduction
      const context = conversationAI.getContext()
      context.language = language
      context.currentStep = stepNumber
      context.totalSteps = totalSteps
      
      // Natural step introduction
      let stepIntro = ''
      if (totalSteps > 1) {
        if (stepNumber === 1) {
          stepIntro = language === 'sw'
            ? 'Sawa, tuanze na swali la kwanza. '
            : 'Alright, let\'s start with the first question. '
        } else if (stepNumber === totalSteps) {
          stepIntro = language === 'sw'
            ? 'Swali la mwisho. '
            : 'Last question. '
        } else {
          stepIntro = language === 'sw'
            ? `Swali la ${stepNumber} la ${totalSteps}. `
            : `Question ${stepNumber} of ${totalSteps}. `
        }
      }
      
      const friendlyQuestion = `${stepIntro}${question.question}`
      conversationAI.addToHistory('bot', friendlyQuestion, { questionKey: question.key })
      
      speak(friendlyQuestion).then(() => {
        // Silently start listening - no announcement
        setIsListening(true)
        lastAnswerTimeRef.current = Date.now()
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start()
            console.log('Quick Optics AI: Listening automatically for answer...')
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
            const gentlePrompts = language === 'sw' ? [
              'Bado niko hapa. Tafadhali jibu swali?',
              'Chukua muda wako, lakini niko tayari unapokuwa tayari.',
              'Ikiwa hukusikia swali wazi, naweza kurudia.',
              'Pole pole, niko hapa kukusubiri.',
              'Unaweza kujibu sasa, au sema "ruka" ikiwa ungependa kuendelea.'
            ] : [
              'I\'m still here. Could you please answer the question?',
              'Take your time, but I\'m ready when you are.',
              'If you didn\'t hear the question clearly, I can repeat it.',
              'No rush, I\'m here waiting for you.',
              'You can answer now, or say "skip" if you\'d like to move on.'
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
      // All questions answered - intelligent, natural conclusion
      setIsQuestionMode(false)
      setCurrentQuestion(null)
      setIsListening(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      
      // Generate natural conclusion based on conversation context
      const context = conversationAI.getContext()
      context.language = language
      const userMood = context.userMood || 'neutral'
      
      let conclusion = ''
      if (userMood === 'nervous') {
        conclusion = language === 'sw'
          ? 'Asante sana kwa kushiriki taarifa zako. Nina taarifa zote ninazohitaji. Sasa tuendelee na uchunguzi wako wa macho. Usiwe na wasiwasi - nitakuwa nawe kila hatua na nitaeleza kila kitu tunachofanya. Tafadhali weka uso wako mbele ya kamera unapokuwa tayari.'
          : 'Thank you so much for sharing that information with me. I have everything I need now. Let\'s move on to your eye examination. Don\'t worry - I\'ll be with you every step of the way and I\'ll explain everything we\'re doing. Just position your face in front of the camera when you\'re ready.'
      } else {
        conclusion = language === 'sw'
          ? 'Asante sana! Nina taarifa zote ninazohitaji. Sasa tuendelee na uchunguzi wako wa macho. Nitakuongoza hatua kwa hatua - hakuna haja ya kuharaka. Tafadhali weka uso wako mbele ya kamera unapokuwa tayari.'
          : 'Thank you so much! I have all the information I need. Now let\'s move on to your eye examination. I\'ll guide you step by step - there\'s no rush. Just position your face in front of the camera when you\'re ready.'
      }
      
      conversationAI.addToHistory('bot', conclusion)
      speak(conclusion)
    }
  }

  const getTestQuestions = (type) => {
    const isSwahili = language === 'sw'
    
    const questionSets = {
      'eye-scan': isSwahili ? [
        { 
          question: 'Hujambo! Mimi ni Daktari AI kutoka Quick Optics. Kabla ya kuanza, hebu tujue kidogo kuhusu hali yako ya macho. Je, una ulemavu wowote wa macho au matatizo ya kuona leo?', 
          key: 'symptoms'
        },
        { 
          question: 'Sawa, nimeelewa. Swali la pili: Je, unavaa miwani au lenzi za macho?', 
          key: 'correctiveLenses'
        },
        { 
          question: 'Asante. Je, umewahi kuwa na upasuaji wa macho au hali zozote zilizotambuliwa na daktari?', 
          key: 'history'
        },
        { 
          question: 'Vizuri. Je, uko katika chumba chenye mwanga mzuri? Hii ni muhimu ili niweze kuona macho yako vizuri.', 
          key: 'lighting'
        },
        { 
          question: 'Mkuu! Sasa tuko tayari. Tafadhali weka uso wako mbele ya kamera, na nitakuongoza hatua kwa hatua. Usiwe na wasiwasi - nitakuwa hapa kila hatua!', 
          key: 'ready'
        }
      ] : [
        { 
          question: 'Hi there! I\'m Dr. AI from Quick Optics. Before we begin, let me get to know you a bit. Are you experiencing any eye discomfort or vision problems today?', 
          key: 'symptoms'
        },
        { 
          question: 'Got it, thanks for sharing. Next question: Do you wear glasses or contact lenses?', 
          key: 'correctiveLenses'
        },
        { 
          question: 'Thank you. Have you had any eye surgeries or conditions diagnosed by a doctor?', 
          key: 'history'
        },
        { 
          question: 'Good to know. Are you in a well-lit room? This helps me see your eyes clearly.', 
          key: 'lighting'
        },
        { 
          question: 'Perfect! We\'re all set. Now, please position your face in front of the camera, and I\'ll guide you step by step. Don\'t worry - I\'ll be with you every step of the way!', 
          key: 'ready'
        }
      ],
      'myopia': isSwahili ? [
        { question: 'Je, unaweza kusoma herufi kwenye skrini?', key: 'readability' },
        { question: 'Je, herufi ziko wazi au zimefifia?', key: 'clarity' }
      ] : [
        { question: 'Can you read the letters on the screen?', key: 'readability' },
        { question: 'Are the letters clear or blurry?', key: 'clarity' }
      ],
      'hyperopia': isSwahili ? [
        { question: 'Je, maandishi yapi yanaonekana wazi zaidi, yaliyo karibu au yaliyo mbali?', key: 'focus' }
      ] : [
        { question: 'Which text appears clearer, near or far?', key: 'focus' }
      ],
      'astigmatism': isSwahili ? [
        { question: 'Je, mistari yote inaonekana wazi sawa?', key: 'uniformity' }
      ] : [
        { question: 'Do all the lines appear equally clear?', key: 'uniformity' }
      ],
      'color': isSwahili ? [
        { question: 'Je, unaweza kuona nambari kwenye mduara za rangi?', key: 'colorVision' }
      ] : [
        { question: 'Can you see the numbers in the colored circles?', key: 'colorVision' }
      ]
    }
    
    return questionSets[type] || []
  }

  const provideWelcomeGuidance = () => {
    let welcomeText = ''
    const isSwahili = language === 'sw'
    
    if (mode === 'test') {
      welcomeText = getTestWelcome(testType)
      // Ask about language preference after welcome
      setTimeout(() => {
        const langQuestion = isSwahili
          ? 'Kabla ya kuanza, je, ungependa mimi niongee Kiswahili au Kiingereza? Sema "Kiswahili" au "Kiingereza".'
          : 'Before we begin, would you like me to speak in Swahili or English? Just say "Swahili" or "English".'
        speak(langQuestion)
      }, 3000)
    } else if (mode === 'game') {
      welcomeText = isSwahili
        ? 'Hujambo! Mimi ni Daktari AI, na nitakuongoza katika mazoezi haya ya mafunzo ya kuona. Fikiria haya kama mazoezi ya macho yanayofurahisha ambayo yanasaidia kuboresha ujuzi wako wa kuona.'
        : 'Hi there! I\'m Dr. AI, and I\'ll guide you through these vision training exercises. Think of them as fun eye workouts that help improve your visual skills. Ready to start?'
    } else {
      welcomeText = isSwahili
        ? 'Hujambo! Mimi ni Daktari AI, msaidizi wako wa huduma za macho. Nipo hapa kukusaidia kupitia uchunguzi wako kamili wa macho kwa uangalifu na ujuzi sawa na ungepokea ofisini kwangu. Tuanze!'
        : 'Hello! I\'m Dr. AI, your friendly vision care assistant. I\'m here to guide you step by step through your eye examination, just like you\'d experience in a real eye doctor\'s office. Let\'s take this one step at a time - I\'ll be with you every moment!'
    }
    
    speak(welcomeText)
  }

  const getTestWelcome = (type) => {
    const isSwahili = language === 'sw'
    
    const welcomes = {
      'eye-scan': isSwahili 
        ? 'Sawa! Sasa naweza kukuona wazi. Mimi ni Quick Optics AI, na nitaangalia macho yako kwa uangalifu. Tafadhali angalia moja kwa moja kwenye kamera na usisongeshe. Nitakuongoza hatua kwa hatua - hakuna haja ya kuharaka!'
        : 'Perfect! I can see you clearly now. I\'m Dr. AI from Quick Optics, and I\'m going to examine your eyes carefully. Just look straight at the camera and hold still - I\'ll guide you through each step, so don\'t worry about a thing!',
      'myopia': isSwahili
        ? 'Sasa tunajaribu kwa ulemavu wa kuona wa karibu, ambao ni wa kawaida sana. Nitaonyesha herufi za ukubwa tofauti. Zisome tu kwa sauti kubwa zinapoonekana, na usiwe na wasiwasi ikiwa zingine zinaonekana zimefifia - hiyo ndiyo ninayohitaji kujua.'
        : 'Now we\'re testing for nearsightedness, which is very common. I\'ll show you some letters at different sizes. Just read them out loud as they appear, and don\'t worry if some seem blurry - that\'s exactly what I need to know.',
      'hyperopia': isSwahili
        ? 'Inayofuata, ninachunguza ulemavu wa kuona wa mbali. Utaona maandishi ya umbali tofauti. Niambie yapi yanaonekana wazi zaidi kwako. Hakuna majibu mabaya - ninahitaji tu kuelewa jinsi macho yako yanavyozingatia.'
        : 'Next, I\'m checking for farsightedness. You\'ll see some text at different distances. Tell me which one appears clearer to you. There are no wrong answers - I just need to understand how your eyes focus.',
      'astigmatism': isSwahili
        ? 'Mtihani huu huchunguza ikiwa kornea yako ina umbo lisilo la kawaida, ambalo linaweza kusababisha ulemavu wa kuona. Angalia mifumo hii ya mistari na uniambie ipi inaonekana kali zaidi. Chukua muda wako.'
        : 'This test checks if your cornea has an irregular shape, which can cause blurry vision. Look at these line patterns and tell me which ones appear sharpest. Take your time.',
      'color': isSwahili
        ? 'Sasa ninajaribu uwezo wako wa kuona rangi. Utaona nukta za rangi na nambari zilizofichwa ndani. Niambie nambari gani unaweza kuona. Watu wengine huwaona tofauti, na hiyo ni ya kawaida kabisa.'
        : 'Now I\'m testing your color vision. You\'ll see some colored dots with numbers hidden inside. Tell me what numbers you can see. Some people see them differently, and that\'s perfectly normal.',
      'contrast': isSwahili
        ? 'Mtihani huu hupima jinsi unavyoweza kutofautisha kati ya vivuli tofauti. Chagua umbo ambalo lina tofauti bora zaidi. Hii inanisaidia kuelewa uwezo wako wa kuona.'
        : 'This test measures how well you can distinguish between different shades. Choose the shape that has the best contrast. This helps me understand your visual sensitivity.',
      'dry-eye': isSwahili
        ? 'Mwishowe, ningependa kukuuliza maswali kuhusu dalili za jicho kavu. Hii ni ya kawaida sana, haswa kwa matumizi ya skrini. Tafadhali jibu kwa uaminifu - inanisaidia kukupa mapendekezo bora.'
        : 'Finally, I\'d like to ask you some questions about dry eye symptoms. This is very common, especially with screen use. Please answer honestly - it helps me give you better recommendations.'
    }
    return welcomes[type] || (isSwahili 
      ? 'Mimi ni Quick Optics AI, na nitakuwa mwongozaji wako katika tathmini hii ya macho. Fikiria hii kama uchunguzi kamili wa macho, kama vile kumtembelea daktari, lakini kutoka nyumbani kwako.'
      : 'I\'m Quick Optics AI, and I\'ll be your guide through this vision assessment. Think of this as a comprehensive eye exam, just like visiting my office, but from the comfort of your home.')
  }

  // Enhanced natural language understanding - very understanding of different information (Bilingual)
  const understandAnswer = (answer, questionKey) => {
    const lowerAnswer = answer.toLowerCase().trim()
    
    // Remove common filler words and phrases (both languages)
    const cleanedAnswer = lowerAnswer
      .replace(/\b(um|uh|er|ah|like|you know|i mean|well|so|actually|eh|hmm|ahem)\b/g, '')
      .replace(/\b(eeh|haya|sawa|basically|actually)\b/g, '')
      .trim()
    
    // Very comprehensive Yes/No detection - English
    const yesPatterns = [
      'yes', 'yeah', 'yep', 'yup', 'sure', 'correct', 'right', 'okay', 'ok', 'k',
      'affirmative', 'definitely', 'absolutely', 'of course', 'certainly', 'indeed',
      'i do', 'i am', 'i have', 'i wear', 'i use', 'i\'m wearing', 'i\'m using',
      'i got', 'i got them', 'i have them', 'wearing them', 'using them',
      'sometimes', 'occasionally', 'often', 'usually', 'always', 'most of the time',
      'yeah sure', 'yes i do', 'yes i am', 'yes i have', 'yes i wear'
    ]
    const noPatterns = [
      'no', 'nope', 'nah', 'negative', 'not', "don't", "doesn't", "didn't", 
      'never', 'none', 'nothing', 'no one', 'nobody', "i don't", "i didn't",
      'i do not', 'i am not', 'i have not', "i haven't", "i'm not", "i never",
      'rarely', 'seldom', 'hardly ever', 'no i don\'t', 'no i am not'
    ]
    
    // Swahili Yes/No detection
    const swahiliYesPatterns = [
      'ndiyo', 'ndio', 'sawa', 'haya', 'kweli', 'hakika', 'bila shaka',
      'nina', 'nimekuwa', 'nimewahi', 'navaa', 'natumia', 'ninao',
      'mara kwa mara', 'wakati mwingine', 'kila mara', 'mara nyingi',
      'ndiyo nina', 'ndiyo navaa', 'ndiyo natumia', 'sawa kabisa'
    ]
    const swahiliNoPatterns = [
      'hapana', 'la', 'siyo', 'sio', 'hamna', 'hakuna', 'sijawahi',
      'sina', 'sikuwa', 'sijawahi', 'sivai', 'situmii', 'sinao',
      'kamwe', 'hakuna chochote', 'sijawahi kuwa', 'hapana sina',
      'hapana sivai', 'hapana situmii', 'siyo kabisa'
    ]
    
    // Check both English and Swahili patterns
    const isYes = yesPatterns.some(pattern => cleanedAnswer.includes(pattern)) ||
                  swahiliYesPatterns.some(pattern => cleanedAnswer.includes(pattern))
    const isNo = noPatterns.some(pattern => cleanedAnswer.includes(pattern)) ||
                 swahiliNoPatterns.some(pattern => cleanedAnswer.includes(pattern))
    
    // Enhanced detail detection - understands many variations (Bilingual)
    const detailKeywords = [
      // English
      'glasses', 'contacts', 'lenses', 'spectacles', 'eyewear',
      'surgery', 'lasik', 'cataract', 'glaucoma', 'diabetic', 'retinopathy', 
      'macular', 'degeneration', 'condition', 'diagnosed', 'diagnosis',
      'problem', 'issue', 'pain', 'discomfort', 'blurry', 'blur', 'vision',
      'light', 'bright', 'dark', 'room', 'lighting', 'well lit',
      'left', 'right', 'both', 'sometimes', 'when', 'if', 'depends',
      // Swahili
      'miwani', 'lenzi', 'macho', 'jicho', 'machozi', 'kuona',
      'upasuaji', 'daktari', 'hospitali', 'dawa', 'tiba', 'afya',
      'mgonjwa', 'hali', 'tatizo', 'maumivu', 'uchungu', 'fifia',
      'mwanga', 'nyepesi', 'giza', 'chumba', 'angaza', 'wazi',
      'kushoto', 'kulia', 'zote mbili', 'mara kwa mara', 'wakati', 'ikiwa'
    ]
    
    const hasDetails = cleanedAnswer.length > 8 || 
      cleanedAnswer.split(/\s+/).length > 2 ||
      detailKeywords.some(keyword => cleanedAnswer.includes(keyword)) ||
      /\d+/.test(cleanedAnswer) // Contains numbers
    
    // Very lenient - accept almost any meaningful response
    const meaninglessWords = ['the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'that', 'this', 'these', 'those', 'what', 'where', 'when', 'why', 'how',
                             'ya', 'na', 'au', 'lakini', 'kama', 'hiyo', 'hii', 'hizi', 'nini', 'wapi', 'lini', 'kwa nini', 'jinsi']
    const isMeaningful = cleanedAnswer.length >= 2 && 
      !meaninglessWords.some(word => cleanedAnswer === word || cleanedAnswer === word.toLowerCase())
    
    // Confidence score based on multiple factors
    const confidence = (isYes || isNo ? 0.8 : 0) + 
                      (hasDetails ? 0.6 : 0) + 
                      (isMeaningful ? 0.4 : 0) +
                      (cleanedAnswer.length > 5 ? 0.2 : 0)
    
    return {
      isYes,
      isNo,
      hasDetails,
      rawAnswer: answer,
      cleanedAnswer: cleanedAnswer,
      understood: confidence > 0.3, // More lenient threshold
      confidence: Math.min(confidence, 1.0)
    }
  }

  const handleAnswer = (answer) => {
    if (!answer || answer.trim().length < 2) {
      // Too short or empty - continue listening
      return
    }
    
    // Throttle to prevent processing same answer multiple times
    const now = Date.now()
    const answerHash = answer.trim().toLowerCase()
    if (now - lastAnswerProcessedRef.current < answerThrottleMs) {
      // Too soon - likely duplicate recognition result
      return
    }
    lastAnswerProcessedRef.current = now
    
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
    
    if (!understanding.understood || understanding.confidence < 0.3) {
      // Didn't understand - use intelligent clarification from ConversationAI
      conversationAI.addToHistory('user', answer, { unclear: true })
      const context = conversationAI.getContext()
      context.language = language
      response = conversationAI.generateNaturalResponse('clarification', context)
      conversationAI.addToHistory('bot', response)
      
      // Also repeat the question to help user
      const currentQ = getTestQuestions(testType)[questionIndex]
      if (currentQ) {
        response = `${response} ${language === 'sw' ? 'Swali ni:' : 'The question was:'} ${currentQ.question}`
      }
      
      speak(response).then(() => {
        // Restart listening for clarification with longer timeout
        setTimeout(() => {
          setIsListening(true)
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
              // Give more time for clarification
              if (listeningTimeoutRef.current) {
                clearTimeout(listeningTimeoutRef.current)
              }
              listeningTimeoutRef.current = setTimeout(() => {
                if (isListening && isQuestionMode) {
                  const gentlePrompt = language === 'sw'
                    ? 'Bado nasubiri jibu lako. Unaweza kusema "sawa" ikiwa unataka kuruka swali hili.'
                    : 'I\'m still waiting for your answer. You can say "skip" if you\'d like to move on.'
                  speak(gentlePrompt)
                }
              }, 15000) // 15 seconds for clarification
            } catch (error) {
              console.error('Error restarting recognition:', error)
            }
          }
        }, 1000)
      })
      return
    }
    
    // LEARN: Store answer in history for learning
    answerHistoryRef.current.push({
      questionKey: currentQ?.key,
      answer: answer,
      understanding: understanding,
      timestamp: Date.now(),
      testType: testType
    })
    
    // LEARN: Update user profile based on answer
    if (currentQ?.key) {
      if (!userProfileRef.current[currentQ.key]) {
        userProfileRef.current[currentQ.key] = []
      }
      userProfileRef.current[currentQ.key].push({
        answer: answer,
        isYes: understanding.isYes,
        isNo: understanding.isNo,
        hasDetails: understanding.hasDetails,
        details: understanding.hasDetails ? answer : null
      })
    }
    
    // LEARN: Generate adaptive follow-up questions based on answer
    const adaptiveQuestions = generateAdaptiveQuestions(currentQ, understanding, userProfileRef.current)
    if (adaptiveQuestions.length > 0) {
      adaptiveQuestionsRef.current = adaptiveQuestions
    }
    
    // Intelligent, natural confirmations using ConversationAI
    conversationAI.addToHistory('user', answer, { questionKey: currentQ?.key })
    const context = conversationAI.getContext()
    context.language = language
    context.currentPhase = scanPhase
    context.previousAnswers = answerHistoryRef.current.slice(-3)
    
    // Generate natural confirmation
    response = conversationAI.generateConfirmation(answer, currentQ?.key, context)
    
    // Add intelligent follow-up if appropriate
    const followUp = conversationAI.generateFollowUp(answer, currentQ?.key, context)
    if (followUp && (understanding.isYes || understanding.hasDetails)) {
      response += ' ' + followUp
      // Add follow-up to adaptive questions
      adaptiveQuestionsRef.current.push({ question: followUp, key: `${currentQ?.key}_followup` })
    }
    
    conversationAI.addToHistory('bot', response)
    
    // Learn from this interaction
    adaptiveLearning.learnFromInteraction({
      type: 'answer',
      input: answer,
      response: response,
      feedback: 'positive', // Assume positive if user provided answer
      outcome: 'success',
      metadata: {
        questionKey: currentQ?.key,
        language,
        testType
      }
    })
    
    // Check eye movement context if available
    const eyeContext = getEyeMovementContext()
    if (eyeContext && eyeContext.stability < 0.7) {
      const stabilityMsg = language === 'sw'
        ? ' Naona macho yako yanahitaji muda kidogo kujikaza. Chukua muda wako - niko hapa.'
        : ' I notice your eyes might need a moment to focus. Take your time - I\'m here.'
      response += stabilityMsg
    }
    
    // Speak confirmation and move to next question (or adaptive follow-up)
    speak(response).then(() => {
      // Check if we should ask adaptive follow-up question
      if (adaptiveQuestionsRef.current.length > 0 && questionIndex < getTestQuestions(testType).length - 1) {
        const followUp = adaptiveQuestionsRef.current.shift()
        speak(followUp.question).then(() => {
          setTimeout(() => {
            askNextQuestion(questionIndex + 1)
          }, 1000)
        })
      } else {
        const nextIndex = questionIndex + 1
        setTimeout(() => {
          askNextQuestion(nextIndex)
        }, 800) // Slightly longer for natural conversation flow
      }
    })
  }

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()
    
    // Check for wake commands first (these work even in quiet mode)
    const isWakeCommand = lowerCommand.includes('wake up') || lowerCommand.includes('wake') || 
                          lowerCommand.includes('activate') || lowerCommand.includes('come back') || 
                          lowerCommand.includes('resume') || lowerCommand.includes('hello') || 
                          lowerCommand.includes('hi') || lowerCommand.includes('amka') || 
                          lowerCommand.includes('fungua') || lowerCommand.includes('rudia') ||
                          lowerCommand.includes('jambo') || lowerCommand.includes('habari')
    
    // If in quiet mode and not a wake command, ignore it
    if (isQuietMode && !isWakeCommand) {
      console.log('VoiceBot: In quiet mode, ignoring command:', command)
      return
    }
    
    // Detect language from command and update language state
    const detectedLang = detectLanguage(command)
    if (detectedLang !== language) {
      setLanguage(detectedLang)
    }
    
    // Language switching commands - enhanced detection
    if (lowerCommand.includes('swahili') || lowerCommand.includes('kiswahili') || 
        lowerCommand.includes('sw') || lowerCommand.includes('swahili') ||
        lowerCommand.includes('yes') && (lowerCommand.includes('swahili') || lowerCommand.includes('kiswahili')) ||
        lowerCommand.includes('ndiyo') && (lowerCommand.includes('swahili') || lowerCommand.includes('kiswahili'))) {
      setLanguage('sw')
      const confirmMsg = 'Sawa kabisa! Nitaongea Kiswahili sasa. Habari yako? Unaweza kuuliza maswali yoyote kuhusu mtihani wako wa macho.'
      speak(confirmMsg)
      return
    }
    if (lowerCommand.includes('english') || lowerCommand.includes('ingereza') || 
        lowerCommand.includes('en') || lowerCommand.includes('english') ||
        lowerCommand.includes('yes') && (lowerCommand.includes('english') || lowerCommand.includes('ingereza')) ||
        lowerCommand.includes('ndiyo') && (lowerCommand.includes('english') || lowerCommand.includes('ingereza'))) {
      setLanguage('en')
      const confirmMsg = 'Perfect! I\'ll speak English now. How can I help you? Feel free to ask me any questions about your eye test.'
      speak(confirmMsg)
      return
    }
    
    // Auto-advance on dashboard consultation - detect "yes" responses
    if (location.pathname === '/dashboard') {
      const yesPatterns = ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'alright', 'ndiyo', 'ndio', 'sawa', 'haya', 'kweli']
      if (yesPatterns.some(pattern => lowerCommand.includes(pattern))) {
        // Check if user is responding to consultation prompt
        if (lowerCommand.includes('consultation') || lowerCommand.includes('assessment') || 
            lowerCommand.includes('ready') || lowerCommand.includes('start') ||
            lowerCommand.includes('ushauri') || lowerCommand.includes('tayari') || lowerCommand.includes('anza')) {
          speak(language === 'sw'
            ? 'Vizuri sana! Nitaongoza kwa ushauri wa awali, kisha tutaanza na mtihani wako wa macho.'
            : 'Perfect! I\'ll guide you through the pre-test consultation, then we\'ll start your eye examination.')
          setTimeout(() => {
            navigate('/pre-test-consultation')
          }, 2000)
          return
        }
      }
    }
    
    // Wake up from quiet mode with hello/hi
    if ((lowerCommand.includes('hello') || lowerCommand.includes('hi') || 
         lowerCommand.includes('jambo') || lowerCommand.includes('habari')) && isQuietMode) {
      setIsQuietMode(false)
      setIsActive(true)
      
      const wakeMsg = language === 'sw'
        ? 'Jambo! Nimerudi. Ninaweza kukusaidia vipi?'
        : 'Hello! I\'m back. How can I help you?'
      
      conversationAI.addToHistory('user', command)
      conversationAI.addToHistory('bot', wakeMsg)
      speak(wakeMsg)
      
      // Start listening after wake up
      setTimeout(() => {
        if (recognitionRef.current && isActive && !isQuietMode) {
          try {
            recognitionRef.current.start()
            setIsListening(true)
          } catch (error) {
            console.log('Error starting recognition after wake:', error)
          }
        }
      }, 2000)
      
      return
    }
    
    // More conversational responses like ChatGPT - bilingual support with AI
    if (!isQuietMode && (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('jambo') || lowerCommand.includes('habari'))) {
      conversationAI.addToHistory('user', command)
      const context = conversationAI.getContext()
      context.language = language
      const response = conversationAI.generateNaturalResponse('greeting', context)
      conversationAI.addToHistory('bot', response)
      speak(response)
    } else if (lowerCommand.includes('nervous') || lowerCommand.includes('scared') || lowerCommand.includes('worried') ||
               lowerCommand.includes('hofu') || lowerCommand.includes('wasiwasi') || lowerCommand.includes('ogopa')) {
      conversationAI.addToHistory('user', command)
      const context = conversationAI.getContext()
      context.language = language
      context.userMood = 'nervous'
      const response = conversationAI.generateNaturalResponse('empathetic', context)
      const additional = language === 'sw'
        ? ' Uchunguzi huu hauna maumivu na ni salama kabisa. Fikiria kama kuchukua picha ya kujipiga ambayo inaweza kutuambia kuhusu afya ya macho yako. Nitakuwa nawe kila hatua.'
        : ' This test is completely painless and safe. Think of it like taking a smart selfie that can tell us about your eye health. I\'ll be with you every step of the way.'
      conversationAI.addToHistory('bot', response + additional)
      speak(response + additional)
    } else if (lowerCommand.includes('how long') || lowerCommand.includes('duration') || lowerCommand.includes('time') ||
               lowerCommand.includes('muda gani') || lowerCommand.includes('lini') || lowerCommand.includes('wakati')) {
      speak(language === 'sw'
        ? 'Uchunguzi wote unachukua dakika 3 hadi 5 tu. Tutangalia jicho lako la kushoto kwanza, kisha jicho la kulia, na mwishowe tutalinganisha. Kwa kweli ni haraka sana!'
        : 'The entire screening takes just 3 to 5 minutes. We\'ll look at your left eye first, then your right eye, and finally compare them. It\'s actually quite quick!')
    } else if (lowerCommand.includes('what happens') || lowerCommand.includes('explain') || lowerCommand.includes('process') ||
               lowerCommand.includes('nini kitatokea') || lowerCommand.includes('eleza') || lowerCommand.includes('mchakato')) {
      speak(language === 'sw'
        ? 'Hii ndiyo tutakayofanya: Kwanza, nitakusaidia kuweka uso wako ili kamera iweze kuona macho yako wazi. Kisha tutachukua picha za kila jicho tofauti. AI yetu itachambua picha hizi kwa ishara zozote za hali za kawaida za kuona. Nitaeleza kila kitu tunapoendelea.'
        : 'Here\'s exactly what we\'ll do: First, I\'ll help you position your face so the camera can see your eyes clearly. Then we\'ll capture images of each eye separately. Our AI will analyze these images for any signs of common vision conditions. I\'ll explain everything as we go.')
    } else if (lowerCommand.includes('accurate') || lowerCommand.includes('reliable') || lowerCommand.includes('trust') ||
               lowerCommand.includes('sahihi') || lowerCommand.includes('aminifu') || lowerCommand.includes('aminika')) {
      speak(language === 'sw'
        ? 'Swali zuri! AI yetu imefunzwa kwa picha zaidi ya 100,000 za macho na inafikia usahihi wa 95% katika kugundua hali za kawaida kama ulemavu wa kuona wa karibu, glaukoma, na retinopati ya kisukari. Hata hivyo, hii ni zana ya uchunguzi - ikiwa tutapata chochote cha wasiwasi, nitakupendekeza uende kwa mtaalamu wa afya ya macho.'
        : 'Great question! Our AI has been trained on over 100,000 eye images and achieves 95% accuracy in detecting common conditions like myopia, glaucoma, and diabetic retinopathy. However, this is a screening tool - if we find anything concerning, I\'ll recommend you see an eye care professional.')
    } else if (lowerCommand.includes('pain') || lowerCommand.includes('hurt') || lowerCommand.includes('uncomfortable') ||
               lowerCommand.includes('maumivu') || lowerCommand.includes('uumiza') || lowerCommand.includes('sio raha')) {
      speak(language === 'sw'
        ? 'Nashukuru kwa kuuliza! Mtihani huu hauna maumivu kabisa. Tunatumia kamera ya kifaa chako tu - hakuna mwanga mkali, hakuna matone ya macho, hakuna kugusa macho yako. Ni raha kama kuzungumza na rafiki kwa video.'
        : 'I\'m glad you asked! This test is completely painless. We only use your device\'s camera - no bright lights, no eye drops, no touching your eyes. It\'s as comfortable as video chatting with a friend.')
    } else if (lowerCommand.includes('privacy') || lowerCommand.includes('data') || lowerCommand.includes('secure') ||
               lowerCommand.includes('faragha') || lowerCommand.includes('data') || lowerCommand.includes('salama')) {
      speak(language === 'sw'
        ? 'Faragha yako imelindwa kabisa. Uchakataji wote wa picha hufanyika hapa kwenye kifaa chako inapowezekana. Hatujawahi kushiriki taarifa zako za afya bila idhini yako ya wazi, na data zote zimefichwa.'
        : 'Your privacy is absolutely protected. All image processing happens right here on your device when possible. We never share your health information without your explicit permission, and all data is encrypted.')
    } else if (lowerCommand.includes('ready') || lowerCommand.includes('start') || lowerCommand.includes('begin') ||
               lowerCommand.includes('tayari') || lowerCommand.includes('anza') || lowerCommand.includes('anza')) {
      // Auto-navigate if on dashboard
      if (location.pathname === '/dashboard') {
        speak(language === 'sw'
          ? 'Vizuri sana! Nitaongoza kwa ushauri wa awali, kisha tutaanza na mtihani wako wa macho.'
          : 'Perfect! I\'ll guide you through the pre-test consultation, then we\'ll start your eye examination.')
        setTimeout(() => {
          navigate('/pre-test-consultation')
        }, 2000)
      } else {
        speak(language === 'sw'
          ? 'Vizuri sana! Nasikia uko tayari kuanza. Tuanze kwa kuhakikisha kuwa uso wako umewekwa sawa kwenye kamera. Angalia moja kwa moja kwenye skrini yako na nitakuongoza katika kuweka sawa.'
          : 'Wonderful! I can hear you\'re ready to begin. Let\'s start by making sure your face is positioned correctly in the camera. Look directly at your screen and I\'ll guide you through the alignment.')
      }
    } else if (lowerCommand.includes('repeat') || lowerCommand.includes('again') ||
               lowerCommand.includes('rudia') || lowerCommand.includes('tena')) {
      if (currentQuestion) {
        speak(currentQuestion.question)
      } else {
        speak(language === 'sw'
          ? 'Nitarudia hiyo kwako. Unaweza kuwa maalum zaidi kuhusu unachotaka nirudie?'
          : 'I\'ll repeat that for you. Could you be more specific about what you\'d like me to repeat?')
      }
    } else if (lowerCommand.includes('help') || lowerCommand.includes('confused') ||
               lowerCommand.includes('msaada') || lowerCommand.includes('taabu') || lowerCommand.includes('sielewi')) {
      speak(language === 'sw'
        ? 'Bila shaka! Mimi ni Quick Optics AI, na niko hapa kufanya hii iwe rahisi iwezekanavyo. Unaweza kuniuliza chochote kuhusu mtihani, afya ya macho yako, au tu zungumza nami ikiwa una wasiwasi. Ungependa kujua nini?'
        : 'Of course! I\'m Quick Optics AI, and I\'m here to make this as easy as possible. You can ask me anything about the test, your eye health, or just chat with me if you\'re nervous. What would you like to know?')
    } else if (lowerCommand.includes('next') || lowerCommand.includes('continue') ||
               lowerCommand.includes('ijayo') || lowerCommand.includes('endelea') ||
               lowerCommand.includes('next level') || lowerCommand.includes('next phase') ||
               lowerCommand.includes('hatua ijayo') || lowerCommand.includes('kiwango kijacho')) {
      // Check if we're in a test and can proceed
      if (mode === 'test' && testType === 'eye-scan') {
        speak(language === 'sw'
          ? 'Sawa! Nitakuongoza kwa hatua ijayo ya uchunguzi wako wa macho. Tafadhali subiri kidogo nikiandaa mfumo.'
          : 'Perfect! I\'ll guide you to the next phase of your eye examination. Please hold on a moment while I prepare the system.')
      } else {
        speak(language === 'sw'
          ? 'Sawa! Tuendelee na tathmini yako ya macho.'
          : 'Perfect! Let\'s move forward with your vision assessment.')
      }
    } else if (lowerCommand.includes('what phase') || lowerCommand.includes('what level') ||
               lowerCommand.includes('where am i') || lowerCommand.includes('current phase') ||
               lowerCommand.includes('hatua gani') || lowerCommand.includes('kiwango gani') ||
               lowerCommand.includes('uko wapi')) {
      // Provide context about current phase
      const phaseInfo = language === 'sw'
        ? 'Tuko katika uchunguzi wako wa macho. Nitakuongoza hatua kwa hatua - kwanza tutachunguza jicho la kushoto, kisha jicho la kulia, na mwishowe tutalinganisha matokeo. Nitaeleza kila hatua tunapoendelea.'
        : 'We\'re in your eye examination. I\'ll guide you step by step - first we\'ll examine your left eye, then your right eye, and finally we\'ll compare the results. I\'ll explain each step as we go.'
      speak(phaseInfo)
    } else if (lowerCommand.includes('test') && (lowerCommand.includes('what') || lowerCommand.includes('explain') ||
               lowerCommand.includes('mtihani') && (lowerCommand.includes('nini') || lowerCommand.includes('eleza')))) {
      // Explain what the test does
      const testExplanation = language === 'sw'
        ? 'Mtihani huu unatumia kamera ya kifaa chako kuchukua picha za macho yako. AI yetu inachambua picha hizi kwa ishara za hali za kawaida za kuona kama ulemavu wa kuona wa karibu, glaukoma, au matatizo mengine. Ni rahisi, haraka, na hauna maumivu kabisa.'
        : 'This test uses your device\'s camera to take pictures of your eyes. Our AI analyzes these images for signs of common vision conditions like nearsightedness, glaucoma, or other issues. It\'s simple, quick, and completely painless.'
      speak(testExplanation)
    } else if (lowerCommand.includes('thank you') || lowerCommand.includes('thanks') ||
               lowerCommand.includes('asante') || lowerCommand.includes('shukrani')) {
      speak(language === 'sw'
        ? 'Karibu sana! Niko hapa kukusaidia. Kujihudumia macho yako ni muhimu, na ninafurahi kuwa naweza kuwa sehemu ya safari hiyo nawe.'
        : 'You\'re so welcome! I\'m here to help. Taking care of your vision is important, and I\'m glad I can be part of that journey with you.')
    } else if (lowerCommand.includes('stop') || lowerCommand.includes('quiet') || lowerCommand.includes('pause') ||
               lowerCommand.includes('silence') || lowerCommand.includes('shut up') || lowerCommand.includes('be quiet') ||
               lowerCommand.includes('acha') || lowerCommand.includes('nyamaza') || lowerCommand.includes('pumzika') ||
               lowerCommand.includes('acha kuzungumza')) {
      // Enter quiet mode - bot will stay quiet until explicitly activated
      setIsQuietMode(true)
      setIsActive(false)
      setIsQuestionMode(false)
      setIsListening(false)
      
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      // Speak confirmation before going quiet (this will be the last thing it says)
      const quietMsg = language === 'sw'
        ? 'Sawa, nitanyamaza sasa. Sema "hujambo" au "hello" ikiwa unanihitaji tena.'
        : 'Okay, I\'ll be quiet now. Just say "hello" or "wake up" when you need me again.'
      
      // Use direct speech synthesis to ensure message is spoken before going quiet
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(quietMsg)
        window.speechSynthesis.speak(utterance)
      }
      
      return
    } else if ((lowerCommand.includes('wake up') || lowerCommand.includes('wake') || 
                lowerCommand.includes('activate') || lowerCommand.includes('come back') || 
                lowerCommand.includes('resume') || lowerCommand.includes('amka') || 
                lowerCommand.includes('fungua') || lowerCommand.includes('rudia')) && isQuietMode) {
      // Wake up from quiet mode
      setIsQuietMode(false)
      setIsActive(true)
      
      const wakeMsg = language === 'sw'
        ? 'Jambo! Nimerudi. Ninaweza kukusaidia vipi?'
        : 'Hello! I\'m back. How can I help you?'
      
      conversationAI.addToHistory('user', command)
      conversationAI.addToHistory('bot', wakeMsg)
      speak(wakeMsg)
      
      // Start listening after wake up
      setTimeout(() => {
        if (recognitionRef.current && isActive && !isQuietMode) {
          try {
            recognitionRef.current.start()
            setIsListening(true)
          } catch (error) {
            console.log('Error starting recognition after wake:', error)
          }
        }
      }, 2000)
      
      return
    } else {
      // More natural fallback (Bilingual)
      const fallbackMessages = language === 'sw' ? [
        'Nataka kuhakikisha ninaelewa vizuri. Unaweza kusema tena kwa njia tofauti? Niko hapa kukusaidia na chochote kuhusu mtihani wako wa macho - zungumza nami kama ungezungumza na daktari wako.',
        'Samahani, sikuweza kuelewa vizuri. Tafadhali jaribu kusema tena au eleza kwa maneno mengine. Niko hapa kukusaidia.',
        'Ninafikiri sikuweza kukupata vizuri. Unaweza kujaribu kusema tena? Niko hapa kukusaidia na maswali yoyote kuhusu mtihani wako wa macho.'
      ] : [
        'I want to make sure I understand you correctly. Could you rephrase that? I\'m here to help with anything about your vision test - just talk to me like you would talk to your doctor.',
        'I\'m sorry, I didn\'t quite catch that. Could you try saying it again or explain it differently? I\'m here to help.',
        'I think I might have missed that. Could you try saying it again? I\'m here to help with any questions about your vision test.'
      ]
      const fallbackResponse = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
      
      // Learn from unclear interaction
      adaptiveLearning.learnFromInteraction({
        type: 'command',
        input: command,
        response: fallbackResponse,
        feedback: 'neutral',
        outcome: 'partial',
        metadata: {
          language,
          mode,
          wasUnclear: true
        }
      })
      
      speak(fallbackResponse)
    }
  }

  // Generate adaptive questions based on user answers
  const generateAdaptiveQuestions = (currentQuestion, understanding, userProfile) => {
    const adaptiveQuestions = []
    const isSwahili = language === 'sw'
    
    // If user mentions symptoms, ask for more details
    if (currentQuestion?.key === 'symptoms' && (understanding.isYes || understanding.hasDetails)) {
      const answer = understanding.rawAnswer.toLowerCase()
      if (answer.includes('blurry') || answer.includes('fifia')) {
        adaptiveQuestions.push({
          question: isSwahili
            ? 'Unasema kuona kuna fifia. Hii inatokea wakati gani - karibu, mbali, au zote mbili?'
            : 'You mentioned blurry vision. When does this happen - up close, far away, or both?',
          key: 'blurryDetails'
        })
      }
      if (answer.includes('headache') || answer.includes('kichwa')) {
        adaptiveQuestions.push({
          question: isSwahili
            ? 'Unasema maumivu ya kichwa. Hii inatokea mara ngapi - kila siku, mara kwa mara, au mara chache?'
            : 'You mentioned headaches. How often does this happen - daily, occasionally, or rarely?',
          key: 'headacheFrequency'
        })
      }
    }
    
    // If user wears glasses, ask about prescription
    if (currentQuestion?.key === 'correctiveLenses' && understanding.isYes) {
      const answer = understanding.rawAnswer.toLowerCase()
      if (!answer.includes('prescription') && !answer.includes('strength') && !/\d+/.test(answer)) {
        adaptiveQuestions.push({
          question: isSwahili
            ? 'Je, unajua nguvu ya miwani yako? Hii inasaidia kufasiri matokeo kwa usahihi.'
            : 'Do you know the strength of your glasses? This helps interpret results more accurately.',
          key: 'prescriptionStrength'
        })
      }
    }
    
    return adaptiveQuestions
  }
  
  // Get eye movement context from window (set by EyeScan component)
  const getEyeMovementContext = () => {
    if (window.eyeMovementData) {
      const data = window.eyeMovementData
      eyeMovementRef.current = {
        gazePoints: data.gazePoints || [],
        movements: data.movements || [],
        stability: data.stability || 0,
        blinkRate: data.blinkRate || 0
      }
      return eyeMovementRef.current
    }
    return null
  }
  
  // Update eye movement data (called by EyeScan component)
  useEffect(() => {
    const updateEyeData = () => {
      if (window.eyeMovementData) {
        getEyeMovementContext()
      }
    }
    
    // Listen for eye movement updates
    window.addEventListener('eyeMovementUpdate', updateEyeData)
    
    return () => {
      window.removeEventListener('eyeMovementUpdate', updateEyeData)
    }
  }, [])
  
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

  // Register with VoiceBot context for synchronization
  useEffect(() => {
    const instance = {
      speak,
      queueSpeech,
      provideGuidance: (text) => speak(text),
      startQuestions: startTestQuestions,
      analyzeScreen: (content) => screenAnalyzer.analyze(content),
      deactivate: () => {
        setIsActive(false)
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        setIsListening(false)
      }
    }
    
    voiceBotContext.registerInstance(instance)
    voiceBotContext.updateContext(mode, { testType, screenContent })
    
    // Update context when mode or content changes
    if (isActive) {
      voiceBotContext.setIsActive(true)
    }

    return () => {
      voiceBotContext.unregisterInstance(instance)
    }
  }, [mode, testType, screenContent, isActive])

  // Expose functions globally for backward compatibility
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
      <motion.button
        className={`voice-bot-minimal ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}
        onClick={toggleBot}
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: (isSpeaking || isListening) ? Infinity : 0,
          ease: 'easeInOut'
        }}
        title={isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Voice Guide'}
      >
        <span className="voice-icon">
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
      </motion.button>
    </motion.div>
  )
}

export default VoiceBot


