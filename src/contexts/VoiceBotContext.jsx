import { createContext, useContext, useState, useRef, useEffect } from 'react'

const VoiceBotContext = createContext(null)

export const VoiceBotProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentMode, setCurrentMode] = useState('general')
  const [currentContext, setCurrentContext] = useState(null)
  const voiceBotInstanceRef = useRef(null)
  const speechQueueRef = useRef([])
  const isProcessingRef = useRef(false)

  // Register voice bot instance
  const registerInstance = (instance) => {
    // If there's already an active instance, deactivate it
    if (voiceBotInstanceRef.current && voiceBotInstanceRef.current !== instance) {
      voiceBotInstanceRef.current.deactivate?.()
    }
    voiceBotInstanceRef.current = instance
  }

  // Unregister voice bot instance
  const unregisterInstance = (instance) => {
    if (voiceBotInstanceRef.current === instance) {
      voiceBotInstanceRef.current = null
    }
  }

  // Queue speech to prevent overlapping
  const queueSpeech = (text, priority = 'normal') => {
    const speechItem = { text, priority, timestamp: Date.now() }
    
    if (priority === 'high') {
      speechQueueRef.current.unshift(speechItem)
    } else {
      speechQueueRef.current.push(speechItem)
    }

    processSpeechQueue()
  }

  // Process speech queue
  const processSpeechQueue = () => {
    if (isProcessingRef.current || speechQueueRef.current.length === 0) {
      return
    }

    isProcessingRef.current = true
    const item = speechQueueRef.current.shift()

    if (voiceBotInstanceRef.current && voiceBotInstanceRef.current.speak) {
      voiceBotInstanceRef.current.speak(item.text).then(() => {
        isProcessingRef.current = false
        // Process next item
        if (speechQueueRef.current.length > 0) {
          setTimeout(() => processSpeechQueue(), 100)
        }
      }).catch(() => {
        isProcessingRef.current = false
        if (speechQueueRef.current.length > 0) {
          setTimeout(() => processSpeechQueue(), 100)
        }
      })
    } else {
      isProcessingRef.current = false
    }
  }

  // Clear speech queue
  const clearQueue = () => {
    speechQueueRef.current = []
    isProcessingRef.current = false
  }

  // Update context for intelligent responses
  const updateContext = (mode, context) => {
    setCurrentMode(mode)
    setCurrentContext(context)
  }

  const value = {
    isActive,
    setIsActive,
    currentMode,
    currentContext,
    registerInstance,
    unregisterInstance,
    queueSpeech,
    clearQueue,
    updateContext,
    getInstance: () => voiceBotInstanceRef.current
  }

  return (
    <VoiceBotContext.Provider value={value}>
      {children}
    </VoiceBotContext.Provider>
  )
}

export const useVoiceBot = () => {
  const context = useContext(VoiceBotContext)
  if (!context) {
    throw new Error('useVoiceBot must be used within VoiceBotProvider')
  }
  return context
}

