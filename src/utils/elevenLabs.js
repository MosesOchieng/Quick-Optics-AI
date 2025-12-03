/**
 * ElevenLabs Voice Integration
 * Handles text-to-speech using ElevenLabs API
 */

import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js'

// Get API key from environment variable or use fallback
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
// Dr. AI - Professional Female Voice (Rachel)
// Rachel has a warm, professional tone perfect for medical guidance
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel - Dr. AI's voice
// Swahili voice ID - using same voice with multilingual model
const SWAHILI_VOICE_ID = VOICE_ID // Using same voice for now, can be changed to a Swahili-specific voice

// Only initialize ElevenLabs client if API key is available
let elevenlabs = null
let hasLoggedMissingKey = false // Flag to prevent spam

if (ELEVENLABS_API_KEY) {
  try {
    elevenlabs = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY
    })
  } catch (error) {
    console.warn('Failed to initialize ElevenLabs client:', error)
  }
}

/**
 * Detect if text is in Swahili
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text appears to be Swahili
 */
const detectSwahili = (text) => {
  const swahiliWords = [
    'jambo', 'habari', 'asante', 'karibu', 'pole', 'sawa', 'hapana', 'ndiyo',
    'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao', 'hapa', 'huko', 'hapo',
    'leo', 'kesho', 'jana', 'sasa', 'zamani', 'baadaye', 'kabla', 'baada',
    'na', 'au', 'lakini', 'kwa', 'katika', 'kutoka', 'hadi', 'mpaka',
    'macho', 'jicho', 'machozi', 'kuona', 'angalia', 'tazama', 'ona',
    'afya', 'mgonjwa', 'daktari', 'hospitali', 'dawa', 'tiba', 'chakula',
    'maji', 'moto', 'baridi', 'nzuri', 'baya', 'kubwa', 'ndogo', 'refu', 'fupi'
  ]
  
  const lowerText = text.toLowerCase()
  const swahiliCount = swahiliWords.filter(word => lowerText.includes(word)).length
  const totalWords = text.split(/\s+/).length
  
  // If more than 20% of words are Swahili, consider it Swahili
  return swahiliCount > 0 && (swahiliCount / Math.max(totalWords, 1)) > 0.2
}

/**
 * Convert text to speech and play it
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Optional voice ID (defaults to VOICE_ID)
 * @param {string} language - Optional language ('en' or 'sw')
 * @returns {Promise<void>}
 */
export const speakWithElevenLabs = async (text, voiceId = VOICE_ID, language = null) => {
  // Auto-detect language if not specified
  if (!language) {
    language = detectSwahili(text) ? 'sw' : 'en'
  }
  
  // If ElevenLabs is not configured or client is not initialized, use fallback immediately
  if (!ELEVENLABS_API_KEY || !elevenlabs) {
    // Only log once to prevent console spam
    if (!hasLoggedMissingKey) {
      console.log('ElevenLabs API key not configured, using fallback TTS')
      hasLoggedMissingKey = true
    }
    fallbackTTS(text, language)
    return
  }
  
  try {
    // Use appropriate voice ID based on language
    // Fallback to VOICE_ID if SWAHILI_VOICE_ID is not available (for safety)
    const selectedVoiceId = language === 'sw' 
      ? (typeof SWAHILI_VOICE_ID !== 'undefined' ? SWAHILI_VOICE_ID : VOICE_ID)
      : voiceId
    
    const audio = await elevenlabs.textToSpeech.convert(
      selectedVoiceId,
      {
        text: text,
        modelId: 'eleven_multilingual_v2', // Multilingual model supports Swahili
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }
    )
    
    await play(audio)
  } catch (error) {
    // Handle specific error types
    if (error.status === 401 || error.statusCode === 401) {
      console.warn('ElevenLabs API key is invalid or expired. Using fallback TTS.')
    } else if (error.status === 429 || error.statusCode === 429) {
      console.warn('ElevenLabs rate limit exceeded. Using fallback TTS.')
    } else {
      console.error('ElevenLabs TTS Error:', error)
    }
    // Always fallback to browser TTS on error
    fallbackTTS(text, language)
  }
}

/**
 * Fallback to browser's built-in TTS with Kenyan/Swahili voice preference
 */
const fallbackTTS = (text, language = null) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1 // Natural pitch
    utterance.volume = 1.0
    
    // Auto-detect language if not specified
    if (!language) {
      language = detectSwahili(text) ? 'sw' : 'en'
    }
    
    // Set language
    utterance.lang = language === 'sw' ? 'sw-KE' : 'en-KE' // Kenyan English or Swahili
    
    // Try to select a Kenyan/African voice or Swahili voice
    const voices = window.speechSynthesis.getVoices()
    
    // Priority: Swahili voices, then Kenyan English, then African voices, then any female voice
    let selectedVoice = voices.find(voice => 
      voice.lang.includes('sw') || voice.name.toLowerCase().includes('swahili')
    ) || voices.find(voice => 
      voice.lang.includes('KE') || voice.lang.includes('kenya')
    ) || voices.find(voice => 
      voice.name.toLowerCase().includes('african') || 
      voice.name.toLowerCase().includes('kenya')
    ) || voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('zira')
    )
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }
}

export default { speakWithElevenLabs }


