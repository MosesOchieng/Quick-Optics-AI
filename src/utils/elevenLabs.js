/**
 * ElevenLabs Voice Integration
 * Handles text-to-speech using ElevenLabs API
 */

import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js'

const ELEVENLABS_API_KEY = 'sk_43c2c79251536d19f4fa1e61a4d595d38617921fa654d5b4'
// Dr. AI - Professional Female Voice (Rachel)
// Rachel has a warm, professional tone perfect for medical guidance
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel - Dr. AI's voice

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
})

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
  try {
    // Auto-detect language if not specified
    if (!language) {
      language = detectSwahili(text) ? 'sw' : 'en'
    }
    
    // Use appropriate voice ID based on language
    const selectedVoiceId = language === 'sw' ? SWAHILI_VOICE_ID : voiceId
    
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
    console.error('ElevenLabs TTS Error:', error)
    // Fallback to browser TTS with language detection
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


