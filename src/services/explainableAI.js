/**
 * Explainable AI System
 * Provides detailed reasoning and can determine "not sick" after full evaluation
 * Explains why AI made decisions, not just what it detected
 */

class ExplainableAI {
  constructor() {
    this.evaluationSteps = []
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    }
    this.healthIndicators = new Map()
  }

  /**
   * Full evaluation that can determine "healthy" or "not sick"
   * @param {Object} analysisData - Complete analysis data
   * @param {Object} options - Evaluation options
   */
  async performFullEvaluation(analysisData, options = {}) {
    try {
      console.log('🔍 Performing full explainable AI evaluation...')
      
      this.evaluationSteps = []
      
      const {
        leftEye,
        rightEye,
        computerVisionData,
        userBaseline,
        consultationData,
        imageQuality
      } = analysisData

      // Step 1: Evaluate image quality
      const qualityAssessment = this.evaluateImageQuality(imageQuality || computerVisionData)
      this.addStep('image_quality', qualityAssessment)
      
      // Step 2: Analyze each eye independently
      const leftEyeAnalysis = this.analyzeEye(leftEye, 'left', qualityAssessment)
      const rightEyeAnalysis = this.analyzeEye(rightEye, 'right', qualityAssessment)
      
      // Step 3: Compare eyes for symmetry
      const symmetryAnalysis = this.compareEyes(leftEyeAnalysis, rightEyeAnalysis)
      this.addStep('symmetry', symmetryAnalysis)
      
      // Step 4: Check against baseline (if available)
      let baselineComparison = null
      if (userBaseline) {
        baselineComparison = this.compareToBaseline({
          left: leftEyeAnalysis,
          right: rightEyeAnalysis
        }, userBaseline)
        this.addStep('baseline_comparison', baselineComparison)
      }
      
      // Step 5: Integrate consultation data
      let consultationIntegration = null
      if (consultationData) {
        consultationIntegration = this.integrateConsultationData(
          { left: leftEyeAnalysis, right: rightEyeAnalysis },
          consultationData
        )
        this.addStep('consultation_integration', consultationIntegration)
      }
      
      // Step 6: Final health determination
      const finalDetermination = this.determineHealthStatus({
        leftEye: leftEyeAnalysis,
        rightEye: rightEyeAnalysis,
        symmetry: symmetryAnalysis,
        baseline: baselineComparison,
        consultation: consultationIntegration,
        quality: qualityAssessment
      })
      
      // Step 7: Generate explanation
      const explanation = this.generateExplanation(finalDetermination, this.evaluationSteps)
      
      console.log('✅ Full evaluation complete:', finalDetermination.status)
      
      return {
        status: finalDetermination.status, // 'healthy', 'condition_detected', 'needs_followup', 'inconclusive'
        confidence: finalDetermination.confidence,
        determination: finalDetermination,
        explanation: explanation,
        reasoning: this.evaluationSteps,
        indicators: this.getHealthIndicators(),
        recommendations: finalDetermination.recommendations || []
      }
    } catch (error) {
      console.error('❌ Full evaluation failed:', error)
      return {
        status: 'error',
        error: error.message,
        explanation: 'Evaluation could not be completed due to an error.'
      }
    }
  }

  /**
   * Evaluate image quality
   */
  evaluateImageQuality(qualityData) {
    const quality = {
      overall: qualityData?.qualityScore || qualityData?.sharpness || 0.5,
      sharpness: qualityData?.sharpness || 0.5,
      brightness: qualityData?.brightness || 0.5,
      contrast: qualityData?.contrast || 0.5,
      stability: qualityData?.stability || 0.5,
      sufficient: false,
      issues: []
    }

    // Determine if quality is sufficient
    quality.sufficient = quality.overall >= 0.6 && 
                         quality.sharpness >= 0.5 && 
                         quality.brightness >= 0.4

    if (!quality.sufficient) {
      if (quality.sharpness < 0.5) quality.issues.push('Image may be too blurry for accurate analysis')
      if (quality.brightness < 0.4) quality.issues.push('Image may be too dark for accurate analysis')
      if (quality.overall < 0.6) quality.issues.push('Overall image quality below optimal threshold')
    }

    return quality
  }

  /**
   * Analyze individual eye
   */
  analyzeEye(eyeData, side, qualityAssessment) {
    const analysis = {
      side,
      conditions: {},
      healthMetrics: {},
      confidence: 0,
      reasoning: []
    }

    // Analyze each condition with reasoning
    if (eyeData?.conditions) {
      Object.keys(eyeData.conditions).forEach(condition => {
        const conditionData = eyeData.conditions[condition]
        const detected = conditionData.detected || conditionData.probability > 0.5
        
        analysis.conditions[condition] = {
          detected,
          probability: conditionData.probability || conditionData.confidence || 0,
          confidence: conditionData.confidence || 0,
          severity: conditionData.severity || 'unknown',
          reasoning: this.generateConditionReasoning(condition, conditionData, qualityAssessment)
        }
      })
    }

    // Analyze health metrics
    if (eyeData?.metrics) {
      analysis.healthMetrics = {
        pupilSize: eyeData.metrics.pupilSize,
        pupilReactivity: eyeData.metrics.pupilReactivity,
        eyePressure: eyeData.metrics.eyePressure,
        bloodVesselHealth: eyeData.metrics.bloodVesselHealth,
        maculaHealth: eyeData.metrics.maculaHealth,
        opticNerveHealth: eyeData.metrics.opticNerveHealth
      }

      // Check if metrics indicate health
      analysis.healthMetrics.overallHealth = this.calculateOverallHealth(analysis.healthMetrics)
    }

    // Calculate confidence
    analysis.confidence = this.calculateEyeConfidence(analysis, qualityAssessment)

    return analysis
  }

  /**
   * Generate reasoning for condition detection
   */
  generateConditionReasoning(condition, conditionData, qualityAssessment) {
    const reasoning = []
    
    if (!conditionData.detected && conditionData.probability < 0.3) {
      reasoning.push(`No signs of ${condition} detected in the analysis`)
      reasoning.push(`Probability is ${(conditionData.probability * 100).toFixed(1)}%, which is below detection threshold`)
    } else if (conditionData.detected) {
      reasoning.push(`${condition} indicators were found in the analysis`)
      reasoning.push(`Confidence level: ${(conditionData.confidence * 100).toFixed(1)}%`)
      if (conditionData.severity) {
        reasoning.push(`Severity assessment: ${conditionData.severity}`)
      }
    } else {
      reasoning.push(`Insufficient evidence for ${condition} - probability ${(conditionData.probability * 100).toFixed(1)}%`)
    }

    if (!qualityAssessment.sufficient) {
      reasoning.push('Note: Image quality may affect accuracy of this assessment')
    }

    return reasoning
  }

  /**
   * Calculate overall health from metrics
   */
  calculateOverallHealth(metrics) {
    const healthScores = [
      metrics.pupilReactivity || 0.8,
      metrics.bloodVesselHealth || 0.8,
      metrics.maculaHealth || 0.8,
      metrics.opticNerveHealth || 0.8
    ]

    const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length
    
    // Check eye pressure (normal range: 10-21 mmHg)
    const pressureNormal = metrics.eyePressure >= 10 && metrics.eyePressure <= 21
    
    return {
      score: avgHealth,
      pressureNormal,
      status: avgHealth >= 0.8 && pressureNormal ? 'healthy' : 
              avgHealth >= 0.6 ? 'moderate' : 'needs_attention'
    }
  }

  /**
   * Calculate confidence for eye analysis
   */
  calculateEyeConfidence(analysis, qualityAssessment) {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on quality
    if (qualityAssessment.sufficient) {
      confidence += 0.2
    }

    // Increase confidence if we have health metrics
    if (Object.keys(analysis.healthMetrics).length > 0) {
      confidence += 0.15
    }

    // Adjust based on condition detection confidence
    const conditionConfidences = Object.values(analysis.conditions)
      .map(c => c.confidence || c.probability)
      .filter(c => c > 0)
    
    if (conditionConfidences.length > 0) {
      const avgConditionConf = conditionConfidences.reduce((a, b) => a + b, 0) / conditionConfidences.length
      confidence = (confidence + avgConditionConf) / 2
    }

    return Math.min(1, Math.max(0, confidence))
  }

  /**
   * Compare eyes for symmetry
   */
  compareEyes(leftAnalysis, rightAnalysis) {
    const comparison = {
      symmetry: 0,
      differences: [],
      significant: false,
      reasoning: []
    }

    // Compare health metrics
    if (leftAnalysis.healthMetrics && rightAnalysis.healthMetrics) {
      const leftHealth = leftAnalysis.healthMetrics.overallHealth?.score || 0
      const rightHealth = rightAnalysis.healthMetrics.overallHealth?.score || 0
      
      comparison.symmetry = 1 - Math.abs(leftHealth - rightHealth)
      
      if (Math.abs(leftHealth - rightHealth) > 0.2) {
        comparison.significant = true
        comparison.differences.push('Significant difference in overall health between eyes')
        comparison.reasoning.push('Eyes show notable asymmetry in health metrics')
      } else {
        comparison.reasoning.push('Eyes show good symmetry in health metrics')
      }
    }

    // Compare conditions
    const leftConditions = Object.keys(leftAnalysis.conditions || {})
      .filter(c => leftAnalysis.conditions[c].detected)
    const rightConditions = Object.keys(rightAnalysis.conditions || {})
      .filter(c => rightAnalysis.conditions[c].detected)

    if (leftConditions.length !== rightConditions.length) {
      comparison.differences.push('Different number of conditions detected in each eye')
      comparison.reasoning.push('Condition asymmetry detected between eyes')
    }

    return comparison
  }

  /**
   * Compare to user baseline
   */
  compareToBaseline(currentAnalysis, baseline) {
    const comparison = {
      changed: false,
      changes: [],
      reasoning: []
    }

    // Compare key metrics
    const currentHealth = (currentAnalysis.left.healthMetrics?.overallHealth?.score || 0 + 
                          currentAnalysis.right.healthMetrics?.overallHealth?.score || 0) / 2
    const baselineHealth = baseline.clarityConfidence || 0.8

    if (Math.abs(currentHealth - baselineHealth) > 0.15) {
      comparison.changed = true
      if (currentHealth < baselineHealth) {
        comparison.changes.push('Overall health appears to have declined from baseline')
        comparison.reasoning.push('Current analysis shows lower health scores compared to your baseline')
      } else {
        comparison.changes.push('Overall health appears to have improved from baseline')
        comparison.reasoning.push('Current analysis shows improved health scores compared to your baseline')
      }
    } else {
      comparison.reasoning.push('Current analysis is consistent with your baseline')
    }

    return comparison
  }

  /**
   * Integrate consultation data
   */
  integrateConsultationData(eyeAnalysis, consultationData) {
    const integration = {
      symptomsMatch: false,
      riskFactors: [],
      reasoning: []
    }

    // Check if symptoms match detected conditions
    if (consultationData.symptoms) {
      const symptoms = consultationData.symptoms.map(s => s.type)
      const detectedConditions = [
        ...Object.keys(eyeAnalysis.left.conditions || {}).filter(c => eyeAnalysis.left.conditions[c].detected),
        ...Object.keys(eyeAnalysis.right.conditions || {}).filter(c => eyeAnalysis.right.conditions[c].detected)
      ]

      const matches = symptoms.filter(s => 
        detectedConditions.some(c => c.toLowerCase().includes(s.toLowerCase()))
      )

      if (matches.length > 0) {
        integration.symptomsMatch = true
        integration.reasoning.push(`Reported symptoms align with detected conditions: ${matches.join(', ')}`)
      } else {
        integration.reasoning.push('Reported symptoms do not strongly align with detected conditions')
      }
    }

    // Add risk factors
    if (consultationData.riskFactors) {
      integration.riskFactors = consultationData.riskFactors
      integration.reasoning.push(`Identified ${consultationData.riskFactors.length} risk factors from consultation`)
    }

    return integration
  }

  /**
   * Determine final health status
   * THIS IS WHERE WE CAN SAY "NOT SICK" OR "HEALTHY"
   */
  determineHealthStatus(allData) {
    const determination = {
      status: 'inconclusive',
      confidence: 0,
      reasoning: [],
      recommendations: []
    }

    const { leftEye, rightEye, symmetry, baseline, consultation, quality } = allData

    // Check if quality is sufficient
    if (!quality.sufficient) {
      determination.status = 'inconclusive'
      determination.confidence = 0.3
      determination.reasoning.push('Image quality is insufficient for reliable assessment')
      determination.recommendations.push('Retake scan with better lighting and focus')
      return determination
    }

    // Check for detected conditions
    const leftConditions = Object.values(leftEye.conditions || {})
      .filter(c => c.detected && c.confidence > this.confidenceThresholds.medium)
    const rightConditions = Object.values(rightEye.conditions || {})
      .filter(c => c.detected && c.confidence > this.confidenceThresholds.medium)

    // Check health metrics
    const leftHealth = leftEye.healthMetrics?.overallHealth
    const rightHealth = rightEye.healthMetrics?.overallHealth

    // DETERMINE HEALTH STATUS
    if (leftConditions.length === 0 && rightConditions.length === 0) {
      // No conditions detected - check health metrics
      if (leftHealth?.status === 'healthy' && rightHealth?.status === 'healthy') {
        determination.status = 'healthy'
        determination.confidence = Math.min(
          (leftEye.confidence + rightEye.confidence) / 2,
          0.95
        )
        determination.reasoning.push('No vision conditions detected in either eye')
        determination.reasoning.push('Health metrics indicate normal eye function')
        determination.reasoning.push('Both eyes show healthy characteristics')
        determination.recommendations.push('Continue regular eye care and annual checkups')
      } else if (leftHealth?.status === 'moderate' || rightHealth?.status === 'moderate') {
        determination.status = 'needs_followup'
        determination.confidence = 0.6
        determination.reasoning.push('No major conditions detected, but some metrics are outside optimal range')
        determination.recommendations.push('Consider professional eye exam for detailed assessment')
      } else {
        determination.status = 'needs_followup'
        determination.confidence = 0.5
        determination.reasoning.push('Analysis completed but some health metrics need attention')
        determination.recommendations.push('Schedule professional eye examination')
      }
    } else {
      // Conditions detected
      const allConditions = [...leftConditions, ...rightConditions]
      const highConfidenceConditions = allConditions.filter(
        c => c.confidence > this.confidenceThresholds.high
      )

      if (highConfidenceConditions.length > 0) {
        determination.status = 'condition_detected'
        determination.confidence = Math.max(...highConfidenceConditions.map(c => c.confidence))
        determination.reasoning.push(`Detected ${highConfidenceConditions.length} condition(s) with high confidence`)
        determination.recommendations.push('Schedule professional eye examination for diagnosis and treatment')
      } else {
        determination.status = 'needs_followup'
        determination.confidence = 0.65
        determination.reasoning.push('Some conditions detected but with moderate confidence')
        determination.recommendations.push('Professional eye exam recommended to confirm findings')
      }
    }

    // Factor in symmetry
    if (symmetry.significant) {
      determination.reasoning.push('Notable asymmetry between eyes detected')
      determination.recommendations.push('Asymmetry should be evaluated by eye care professional')
    }

    // Factor in baseline comparison
    if (baseline?.changed) {
      determination.reasoning.push(...baseline.reasoning)
    }

    // Factor in consultation
    if (consultation?.symptomsMatch) {
      determination.reasoning.push('Reported symptoms align with detected conditions')
    }

    return determination
  }

  /**
   * Generate human-readable explanation
   */
  generateExplanation(determination, steps) {
    let explanation = `Based on a comprehensive analysis of your eye scan, `

    if (determination.status === 'healthy') {
      explanation += `I can confidently say that your eyes appear to be healthy. `
      explanation += `No vision conditions were detected, and all health metrics are within normal ranges. `
      explanation += `This assessment is based on ${steps.length} different evaluation steps, including image quality analysis, `
      explanation += `individual eye assessment, symmetry comparison, and health metric evaluation. `
      explanation += `The confidence level for this assessment is ${(determination.confidence * 100).toFixed(0)}%.`
    } else if (determination.status === 'condition_detected') {
      explanation += `I detected some vision conditions that may need attention. `
      explanation += `The analysis found indicators of certain conditions with ${(determination.confidence * 100).toFixed(0)}% confidence. `
      explanation += `However, this is a screening tool and should be confirmed by a professional eye care provider.`
    } else if (determination.status === 'needs_followup') {
      explanation += `the analysis suggests that a professional eye examination would be beneficial. `
      explanation += `While no major conditions were detected with high confidence, some aspects of the analysis `
      explanation += `indicate that further evaluation by an eye care professional would be recommended.`
    } else {
      explanation += `the analysis could not be completed with sufficient confidence. `
      explanation += `This may be due to image quality issues or insufficient data. `
      explanation += `I recommend retaking the scan with better lighting and focus.`
    }

    return explanation
  }

  /**
   * Get health indicators
   */
  getHealthIndicators() {
    return Array.from(this.healthIndicators.entries()).map(([key, value]) => ({
      indicator: key,
      ...value
    }))
  }

  /**
   * Add evaluation step
   */
  addStep(type, data) {
    this.evaluationSteps.push({
      type,
      data,
      timestamp: new Date().toISOString()
    })
  }
}

export default new ExplainableAI()

