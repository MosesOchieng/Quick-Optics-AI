/**
 * Voice Activity Detection (VAD)
 * Detects human voice vs background noise using Web Audio API
 * Only activates when human speech is detected
 */

class VoiceActivityDetector {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.microphone = null
    this.dataArray = null
    this.isAnalyzing = false
    this.voiceThreshold = 0.02 // Threshold for human voice detection
    this.silenceThreshold = 0.005 // Threshold for silence
    this.voiceDetectedCallback = null
    this.silenceDetectedCallback = null
  }

  async initialize() {
    try {
      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.microphone = this.audioContext.createMediaStreamSource(stream)
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
      this.microphone.connect(this.analyser)
      
      // Create data array for frequency analysis
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      
      return true
    } catch (error) {
      console.error('VoiceActivityDetector: Failed to initialize:', error)
      return false
    }
  }

  // Analyze audio to detect human voice characteristics
  analyzeVoice() {
    if (!this.analyser || !this.dataArray) return false

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray)
    
    // Get time domain data for better voice detection
    const timeData = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(timeData)
    
    // Calculate RMS (Root Mean Square) for volume
    let sum = 0
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128
      sum += normalized * normalized
    }
    const rms = Math.sqrt(sum / timeData.length)
    
    // Human voice typically ranges from 85Hz to 3400Hz
    // Focus on fundamental frequency range (85-300Hz) and formants (300-3400Hz)
    const voiceFrequencyRange = {
      fundamental: { start: 0, end: 15 }, // ~85-300Hz
      formants: { start: 15, end: 200 }   // ~300-3400Hz
    }
    
    // Calculate energy in voice frequency ranges
    let fundamentalEnergy = 0
    let formantEnergy = 0
    let totalEnergy = 0
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const energy = this.dataArray[i] / 255
      totalEnergy += energy
      
      if (i >= voiceFrequencyRange.fundamental.start && i <= voiceFrequencyRange.fundamental.end) {
        fundamentalEnergy += energy
      }
      if (i >= voiceFrequencyRange.formants.start && i <= voiceFrequencyRange.formants.end) {
        formantEnergy += energy
      }
    }
    
    // Normalize energies
    const avgFundamental = fundamentalEnergy / (voiceFrequencyRange.fundamental.end - voiceFrequencyRange.fundamental.start + 1)
    const avgFormant = formantEnergy / (voiceFrequencyRange.formants.end - voiceFrequencyRange.formants.start + 1)
    const avgTotal = totalEnergy / this.dataArray.length
    
    // Voice detection criteria:
    // 1. RMS above threshold (indicates sound)
    // 2. Significant energy in fundamental frequency range (human voice fundamental)
    // 3. Significant energy in formant range (voice characteristics)
    // 4. Ratio of voice frequencies to total is high (not just noise)
    const voiceRatio = (avgFundamental + avgFormant) / Math.max(avgTotal, 0.001)
    
    const isHumanVoice = rms > this.voiceThreshold && 
                         avgFundamental > 0.01 && 
                         avgFormant > 0.02 &&
                         voiceRatio > 0.3
    
    return {
      isHumanVoice,
      rms,
      voiceRatio,
      fundamentalEnergy: avgFundamental,
      formantEnergy: avgFormant
    }
  }

  startDetection(onVoiceDetected, onSilenceDetected) {
    if (this.isAnalyzing) return
    
    this.voiceDetectedCallback = onVoiceDetected
    this.silenceDetectedCallback = onSilenceDetected
    this.isAnalyzing = true
    
    const detect = () => {
      if (!this.isAnalyzing) return
      
      const analysis = this.analyzeVoice()
      
      if (analysis.isHumanVoice) {
        if (this.voiceDetectedCallback) {
          this.voiceDetectedCallback(analysis)
        }
      } else if (analysis.rms < this.silenceThreshold) {
        if (this.silenceDetectedCallback) {
          this.silenceDetectedCallback(analysis)
        }
      }
      
      requestAnimationFrame(detect)
    }
    
    detect()
  }

  stopDetection() {
    this.isAnalyzing = false
    this.voiceDetectedCallback = null
    this.silenceDetectedCallback = null
  }

  cleanup() {
    this.stopDetection()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }
    this.analyser = null
    this.dataArray = null
  }
}

// Export singleton instance
const voiceActivityDetector = new VoiceActivityDetector()
export default voiceActivityDetector

