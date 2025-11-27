/**
 * Enhanced Speech Synthesis for Mobile Devices
 * Handles cross-platform TTS with mobile-specific optimizations
 */

class MobileSpeechSynthesis {
  constructor() {
    this.isSupported = 'speechSynthesis' in window
    this.voices = []
    this.currentUtterance = null
    this.isInitialized = false
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    this.isAndroid = /Android/.test(navigator.userAgent)
    
    this.init()
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported')
      return
    }

    // Load voices with retry mechanism for mobile
    await this.loadVoices()
    
    // Mobile-specific initialization
    if (this.isMobile) {
      this.initMobileOptimizations()
    }
    
    this.isInitialized = true
  }

  async loadVoices() {
    return new Promise((resolve) => {
      const loadVoicesAttempt = () => {
        this.voices = window.speechSynthesis.getVoices()
        
        if (this.voices.length > 0) {
          console.log('Voices loaded:', this.voices.length)
          resolve()
        } else {
          // Retry after a delay (common on mobile)
          setTimeout(loadVoicesAttempt, 100)
        }
      }

      // Handle voice loading events
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.voices = window.speechSynthesis.getVoices()
          if (this.voices.length > 0) {
            resolve()
          }
        }
      }

      loadVoicesAttempt()
    })
  }

  initMobileOptimizations() {
    // iOS requires user interaction to enable speech
    if (this.isIOS) {
      document.addEventListener('touchstart', this.enableIOSSpeech.bind(this), { once: true })
      document.addEventListener('click', this.enableIOSSpeech.bind(this), { once: true })
      document.addEventListener('touchend', this.enableIOSSpeech.bind(this), { once: true })
      
      // Also try to enable on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.enableIOSSpeech()
        }
      }, { once: true })
    }

    // Android optimizations
    if (this.isAndroid) {
      // Ensure speech synthesis is ready
      window.speechSynthesis.cancel()
      
      // Android-specific user interaction handlers
      document.addEventListener('touchstart', () => {
        // Prime the speech synthesis
        const utterance = new SpeechSynthesisUtterance('')
        utterance.volume = 0
        window.speechSynthesis.speak(utterance)
      }, { once: true })
    }

    // General mobile optimizations
    if (this.isMobile) {
      // Handle page focus/blur to manage speech state
      window.addEventListener('focus', () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }
      })
      
      window.addEventListener('blur', () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause()
        }
      })
    }
  }

  enableIOSSpeech() {
    try {
      // Initialize speech synthesis with a silent utterance on iOS
      const silentUtterance = new SpeechSynthesisUtterance('')
      silentUtterance.volume = 0
      silentUtterance.rate = 1
      silentUtterance.pitch = 1
      
      // Set a voice if available
      if (this.voices.length > 0) {
        silentUtterance.voice = this.voices[0]
      }
      
      window.speechSynthesis.speak(silentUtterance)
      console.log('iOS speech synthesis enabled')
      
      // Mark as enabled
      this.iosEnabled = true
    } catch (error) {
      console.error('Failed to enable iOS speech:', error)
    }
  }

  getBestVoice(preferFemale = true) {
    if (this.voices.length === 0) {
      return null
    }

    // Platform-specific voice preferences
    let preferredVoices = []
    
    if (this.isIOS) {
      preferredVoices = preferFemale 
        ? ['Samantha', 'Victoria', 'Allison', 'Ava', 'Susan']
        : ['Alex', 'Daniel', 'Fred']
    } else if (this.isAndroid) {
      preferredVoices = preferFemale
        ? ['Google UK English Female', 'Google US English Female', 'Female']
        : ['Google UK English Male', 'Google US English Male', 'Male']
    } else {
      // Desktop preferences
      preferredVoices = preferFemale
        ? ['Microsoft Zira', 'Google UK English Female', 'Samantha', 'Victoria']
        : ['Microsoft David', 'Google UK English Male', 'Alex']
    }

    // Try to find preferred voice
    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.includes(voiceName) || 
        v.name.toLowerCase().includes(voiceName.toLowerCase())
      )
      if (voice) {
        return voice
      }
    }

    // Fallback to any English voice
    const englishVoice = this.voices.find(v => 
      v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')
    )
    
    return englishVoice || this.voices[0]
  }

  async speak(text, options = {}) {
    if (!this.isSupported || !text.trim()) {
      console.warn('Cannot speak: not supported or empty text')
      return Promise.resolve()
    }

    // Wait for initialization
    if (!this.isInitialized) {
      await this.init()
    }

    // For iOS, ensure speech is enabled first
    if (this.isIOS && !this.iosEnabled) {
      this.enableIOSSpeech()
      // Wait a bit for iOS to be ready
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        
        // Mobile-optimized settings
        utterance.rate = this.isMobile ? 0.7 : (options.rate || 0.9)
        utterance.pitch = options.pitch || 1.0
        utterance.volume = options.volume || 1.0
        utterance.lang = options.lang || 'en-US'

        // Set voice
        const voice = this.getBestVoice(options.preferFemale !== false)
        if (voice) {
          utterance.voice = voice
          console.log('Using voice:', voice.name, 'on', this.isMobile ? 'mobile' : 'desktop')
        }

        // Event handlers
        utterance.onstart = () => {
          console.log('Speech started:', text.substring(0, 50))
        }

        utterance.onend = () => {
          console.log('Speech ended')
          this.currentUtterance = null
          resolve()
        }

        utterance.onerror = (event) => {
          console.error('Speech error:', event.error, 'on', navigator.userAgent)
          this.currentUtterance = null
          
          // Enhanced retry logic for mobile
          if (this.isMobile && ['network', 'synthesis-failed', 'audio-busy'].includes(event.error)) {
            console.log('Retrying speech on mobile...')
            setTimeout(() => {
              // Try again with basic settings
              const retryUtterance = new SpeechSynthesisUtterance(text)
              retryUtterance.rate = 0.8
              retryUtterance.pitch = 1.0
              retryUtterance.volume = 1.0
              retryUtterance.onend = () => resolve()
              retryUtterance.onerror = () => resolve() // Don't fail on retry
              window.speechSynthesis.speak(retryUtterance)
            }, 500)
          } else {
            // Don't reject on mobile - just resolve to prevent blocking
            if (this.isMobile) {
              console.warn('Speech failed on mobile, continuing...')
              resolve()
            } else {
              reject(new Error(`Speech synthesis error: ${event.error}`))
            }
          }
        }

        // Store current utterance
        this.currentUtterance = utterance

        // Enhanced mobile-specific speaking logic
        if (this.isMobile) {
          // Ensure speech synthesis is ready
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
          }
          
          // Clear any pending utterances
          window.speechSynthesis.cancel()
          
          // Add delay for mobile compatibility
          setTimeout(() => {
            try {
              window.speechSynthesis.speak(utterance)
            } catch (mobileError) {
              console.error('Mobile speech error:', mobileError)
              resolve() // Don't block on mobile errors
            }
          }, this.isIOS ? 200 : 100)
        } else {
          window.speechSynthesis.speak(utterance)
        }

      } catch (error) {
        console.error('Speech synthesis setup error:', error)
        if (this.isMobile) {
          resolve() // Don't block on mobile
        } else {
          reject(error)
        }
      }
    })
  }

  cancel() {
    if (this.isSupported) {
      window.speechSynthesis.cancel()
      this.currentUtterance = null
    }
  }

  pause() {
    if (this.isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }

  resume() {
    if (this.isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }

  isSpeaking() {
    return this.isSupported && window.speechSynthesis.speaking
  }

  isPaused() {
    return this.isSupported && window.speechSynthesis.paused
  }

  // Test speech functionality
  async test() {
    try {
      await this.speak('Voice synthesis test successful', { preferFemale: true })
      return true
    } catch (error) {
      console.error('Speech test failed:', error)
      return false
    }
  }
}

// Create singleton instance
const mobileSpeech = new MobileSpeechSynthesis()

// Export both the class and instance
export { MobileSpeechSynthesis }
export default mobileSpeech
