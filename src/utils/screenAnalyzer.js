/**
 * Screen Content Analyzer
 * Silently analyzes screen content without speaking
 */

class ScreenAnalyzer {
  constructor() {
    this.analysisCache = new Map()
  }

  /**
   * Analyze screen content silently (internal processing)
   * @param {Object} content - Screen content to analyze
   * @returns {Object} Analysis summary
   */
  analyze(content) {
    const cacheKey = JSON.stringify(content)
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)
    }

    let analysis = {
      type: 'unknown',
      keyElements: [],
      userAction: null,
      context: null,
      summary: ''
    }

    // Analyze based on content type
    if (typeof content === 'string') {
      analysis = this.analyzeText(content)
    } else if (content.title && content.description) {
      analysis = this.analyzeStructured(content)
    } else if (content.testType) {
      analysis = this.analyzeTest(content)
    }

    // Cache the analysis
    this.analysisCache.set(cacheKey, analysis)
    
    return analysis
  }

  analyzeText(text) {
    const lowerText = text.toLowerCase()
    
    return {
      type: 'text',
      keyElements: this.extractKeywords(text),
      userAction: this.detectAction(text),
      context: this.detectContext(text),
      summary: this.summarize(text)
    }
  }

  analyzeStructured({ title, description }) {
    return {
      type: 'structured',
      keyElements: [
        ...this.extractKeywords(title),
        ...this.extractKeywords(description)
      ],
      userAction: this.detectAction(description),
      context: this.detectContext(title),
      summary: `${title}: ${this.summarize(description)}`
    }
  }

  analyzeTest({ testType, status, progress }) {
    const testContexts = {
      'eye-scan': 'Initial eye scanning and alignment',
      'myopia': 'Testing for nearsightedness',
      'hyperopia': 'Testing for farsightedness',
      'astigmatism': 'Testing for astigmatism',
      'color': 'Color vision testing',
      'contrast': 'Contrast sensitivity testing',
      'dry-eye': 'Dry eye risk assessment'
    }

    return {
      type: 'test',
      keyElements: [testType, status],
      userAction: progress < 100 ? 'in-progress' : 'completed',
      context: testContexts[testType] || 'Vision test',
      summary: `${testContexts[testType] || 'Vision test'} - ${status || 'Active'}`
    }
  }

  extractKeywords(text) {
    const keywords = []
    const importantWords = [
      'test', 'scan', 'eye', 'vision', 'align', 'camera', 'start', 'complete',
      'myopia', 'hyperopia', 'astigmatism', 'color', 'contrast', 'dry',
      'instructions', 'next', 'continue', 'results', 'analysis'
    ]
    
    importantWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        keywords.push(word)
      }
    })
    
    return keywords
  }

  detectAction(text) {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('start') || lowerText.includes('begin')) return 'start'
    if (lowerText.includes('complete') || lowerText.includes('finish')) return 'complete'
    if (lowerText.includes('next') || lowerText.includes('continue')) return 'next'
    if (lowerText.includes('wait') || lowerText.includes('hold')) return 'wait'
    if (lowerText.includes('align') || lowerText.includes('position')) return 'align'
    
    return null
  }

  detectContext(text) {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('test') || lowerText.includes('scan')) return 'testing'
    if (lowerText.includes('result') || lowerText.includes('analysis')) return 'results'
    if (lowerText.includes('onboard') || lowerText.includes('welcome')) return 'onboarding'
    if (lowerText.includes('game') || lowerText.includes('trainer')) return 'training'
    
    return 'general'
  }

  summarize(text) {
    // Simple summarization - extract key phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length === 0) return text
    
    // Return first meaningful sentence or first 100 chars
    const firstSentence = sentences[0].trim()
    return firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence
  }

  /**
   * Get what the user should know about current screen
   * @param {Object} content - Screen content
   * @returns {string} What to communicate to user
   */
  getCommunicationNeeds(content) {
    const analysis = this.analyze(content)
    
    // Determine if user needs guidance
    if (analysis.userAction === 'wait' || analysis.userAction === 'align') {
      return 'guidance'
    }
    
    if (analysis.type === 'test' && analysis.userAction === 'in-progress') {
      return 'instruction'
    }
    
    if (analysis.context === 'onboarding') {
      return 'welcome'
    }
    
    return 'none'
  }
}

export default new ScreenAnalyzer()

