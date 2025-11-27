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
 * Convert text to speech and play it
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Optional voice ID (defaults to VOICE_ID)
 * @returns {Promise<void>}
 */
export const speakWithElevenLabs = async (text, voiceId = VOICE_ID) => {
  try {
    const audio = await elevenlabs.textToSpeech.convert(
      voiceId,
      {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128'
      }
    )
    
    await play(audio)
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error)
    // Fallback to browser TTS
    fallbackTTS(text)
  }
}

/**
 * Fallback to browser's built-in TTS with female voice preference
 */
const fallbackTTS = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.2 // Higher pitch for female voice
    utterance.volume = 1.0
    
    // Try to select a female voice
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('zira')
    )
    
    if (femaleVoice) {
      utterance.voice = femaleVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }
}

export default { speakWithElevenLabs }


