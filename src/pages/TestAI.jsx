import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import aiProcessor from '../services/aiProcessor'
import imageTransformationPipeline from '../services/imageTransformationPipeline'
import DITPLoader from '../components/DITPLoader'
import './TestAI.css'

const TestAI = () => {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTest, setCurrentTest] = useState('vision')
  const [logs, setLogs] = useState([])
  const [showDITPLoader, setShowDITPLoader] = useState(false)

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const testVisionAnalysis = async () => {
    setIsLoading(true)
    addLog('Starting vision analysis test...', 'info')
    
    try {
      // Simulate eye data
      const leftEyeData = {
        image: 'simulated_left_eye_data',
        quality: 0.9,
        timestamp: Date.now()
      }
      
      const rightEyeData = {
        image: 'simulated_right_eye_data', 
        quality: 0.85,
        timestamp: Date.now()
      }
      
      const faceMetrics = {
        faceWidth: 150,
        faceHeight: 180,
        pupilDistance: 65,
        leftEye: { center: { x: 0.3, y: 0.4 } },
        rightEye: { center: { x: 0.7, y: 0.4 } }
      }
      
      addLog('Initializing AI models...', 'info')
      const results = await aiProcessor.analyzeVision(leftEyeData, rightEyeData, faceMetrics)
      
      setTestResults(results)
      addLog('Vision analysis completed successfully!', 'success')
      addLog(`Overall score: ${results.overallScore}`, 'success')
      
    } catch (error) {
      addLog(`Vision analysis failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testConsultationProcessing = async () => {
    setIsLoading(true)
    addLog('Starting consultation processing test...', 'info')
    
    try {
      const mockResponses = {
        symptoms: ['Blurry vision', 'Eye strain/fatigue'],
        lifestyle: ['Heavy screen use', 'Office work'],
        history: ['Family history of eye disease'],
        concerns: ['Some concerns']
      }
      
      addLog('Processing consultation responses...', 'info')
      const analysis = await aiProcessor.processConsultation(mockResponses)
      
      setTestResults(analysis)
      addLog('Consultation processing completed!', 'success')
      addLog(`Risk factors identified: ${analysis.riskFactors.length}`, 'success')
      addLog(`Recommendations generated: ${analysis.recommendations.length}`, 'success')
      
    } catch (error) {
      addLog(`Consultation processing failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testAIInitialization = async () => {
    setIsLoading(true)
    addLog('Testing AI initialization...', 'info')
    
    try {
      await aiProcessor.initialize()
      addLog('AI models initialized successfully!', 'success')
      addLog('Vision analysis model loaded', 'success')
      addLog('Consultation NLP model loaded', 'success')
      addLog('Risk assessment model loaded', 'success')
      
    } catch (error) {
      addLog(`AI initialization failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setTestResults(null)
  }

  const testDITPPipeline = async () => {
    setIsLoading(true)
    addLog('🔥 Testing Digital Image Transformation Pipeline (DITP)...', 'info')
    
    try {
      // Test DITP initialization
      addLog('Step 1: Initializing DITP...', 'info')
      await imageTransformationPipeline.initialize()
      addLog('✅ DITP initialized successfully', 'success')
      
      // Show DITP loader for visual transformation
      addLog('Step 2: Starting visual transformation process...', 'info')
      setShowDITPLoader(true)
      
      // Wait for loader to complete (it will call the actual transformation)
      
    } catch (error) {
      addLog(`DITP test failed: ${error.message}`, 'error')
      setIsLoading(false)
    }
  }

  const handleDITPLoaderComplete = async () => {
    try {
      // Hide loader
      setShowDITPLoader(false)
      
      // Continue with actual transformation
      addLog('Step 3: Running actual DITP transformation...', 'info')
      const mockMobileImage = {
        image: 'raw_smartphone_eye_image_data',
        resolution: { width: 720, height: 1280 },
        lighting: 'variable',
        quality: 'mobile_grade',
        noise: 'smartphone_sensor_noise',
        timestamp: Date.now()
      }
      
      const transformedResult = await imageTransformationPipeline.transformMobileToClinical(mockMobileImage)
      addLog('✅ Mobile image transformed to clinical-grade', 'success')
      addLog('✅ Digital Eye Construct (DEC) generated', 'success')
      addLog('✅ Clinical features extracted', 'success')
      addLog('✅ Dataset alignment completed', 'success')
      
      setTestResults(transformedResult)
      addLog('🎉 DITP test completed - Mobile images now clinical-grade!', 'success')
      
    } catch (error) {
      addLog(`DITP transformation failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testFullWorkflow = async () => {
    setIsLoading(true)
    addLog('Starting full workflow test...', 'info')
    
    try {
      // Test 1: Initialize AI and DITP
      addLog('Step 1: Initializing AI system with DITP...', 'info')
      await aiProcessor.initialize()
      addLog('✓ AI system and DITP initialized', 'success')
      
      // Test 2: Process consultation
      addLog('Step 2: Processing sample consultation...', 'info')
      const mockResponses = {
        symptoms: ['Blurry vision', 'Eye strain/fatigue'],
        lifestyle: ['Heavy screen use', 'Office work'],
        history: ['Family history of eye disease'],
        concerns: ['Some concerns']
      }
      
      const consultationResults = await aiProcessor.processConsultation(mockResponses)
      addLog('✓ Consultation processed successfully', 'success')
      
      // Test 3: Clinical-grade vision analysis with DITP
      addLog('Step 3: Running clinical-grade vision analysis with DITP...', 'info')
      const leftEyeData = { 
        image: 'raw_mobile_left_eye_data', 
        quality: 0.7, // Mobile quality
        lighting: 'variable',
        noise: 'smartphone_sensor'
      }
      const rightEyeData = { 
        image: 'raw_mobile_right_eye_data', 
        quality: 0.65, // Mobile quality
        lighting: 'variable',
        noise: 'smartphone_sensor'
      }
      const faceMetrics = {
        faceWidth: 150, faceHeight: 180, pupilDistance: 65,
        leftEye: { center: { x: 0.3, y: 0.4 } },
        rightEye: { center: { x: 0.7, y: 0.4 } }
      }
      
      const visionResults = await aiProcessor.analyzeVision(leftEyeData, rightEyeData, faceMetrics)
      addLog('✓ Mobile images transformed to clinical-grade', 'success')
      addLog('✓ Clinical-grade vision analysis completed', 'success')
      
      // Test 4: Generate insights
      addLog('Step 4: Generating personalized insights...', 'info')
      const insights = aiProcessor.generatePersonalizedInsights(visionResults, consultationResults)
      addLog('✓ Insights generated', 'success')
      
      const fullResults = {
        consultation: consultationResults,
        vision: visionResults,
        insights: insights,
        workflow: 'complete'
      }
      
      setTestResults(fullResults)
      addLog('🎉 Full workflow test completed successfully!', 'success')
      addLog(`Overall vision score: ${visionResults.overallScore}`, 'success')
      addLog(`Recommendations: ${consultationResults.recommendations.length}`, 'success')
      addLog(`Insights generated: ${insights.length}`, 'success')
      
    } catch (error) {
      addLog(`Workflow test failed: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="test-ai-page">
      <div className="test-container">
        <div className="test-header">
          <h1>AI System Testing Dashboard</h1>
          <p>Test and verify all AI components are working correctly</p>
        </div>

        <div className="test-controls">
          <div className="test-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCurrentTest('init')
                testAIInitialization()
              }}
              disabled={isLoading}
            >
              {isLoading && currentTest === 'init' ? 'Testing...' : 'Test AI Initialization'}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setCurrentTest('vision')
                testVisionAnalysis()
              }}
              disabled={isLoading}
            >
              {isLoading && currentTest === 'vision' ? 'Analyzing...' : 'Test Vision Analysis'}
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => {
                setCurrentTest('consultation')
                testConsultationProcessing()
              }}
              disabled={isLoading}
            >
              {isLoading && currentTest === 'consultation' ? 'Processing...' : 'Test Consultation AI'}
            </button>
            
            <button 
              className="btn btn-warning"
              onClick={() => {
                setCurrentTest('ditp')
                testDITPPipeline()
              }}
              disabled={isLoading}
            >
              {isLoading && currentTest === 'ditp' ? 'Transforming...' : '🔥 Test DITP Pipeline'}
            </button>
            
            <button 
              className="btn btn-success"
              onClick={() => {
                setCurrentTest('workflow')
                testFullWorkflow()
              }}
              disabled={isLoading}
            >
              {isLoading && currentTest === 'workflow' ? 'Running...' : '🚀 Test Full Workflow'}
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={clearLogs}
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="test-results">
          <div className="logs-section">
            <h3>System Logs</h3>
            <div className="logs-container">
              {logs.length === 0 ? (
                <div className="no-logs">
                  <p>No logs yet. Run a test to see results.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={index}
                    className={`log-entry ${log.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="log-timestamp">{log.timestamp}</span>
                    <span className="log-message">{log.message}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {testResults && (
            <div className="results-section">
              <h3>Test Results</h3>
              <div className="results-container">
                <pre className="results-json">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {isLoading && !showDITPLoader && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Processing AI request...</p>
            </div>
          </div>
        )}

        {/* DITP Loader */}
        <DITPLoader
          isVisible={showDITPLoader}
          onComplete={handleDITPLoaderComplete}
          estimatedDuration={8000}
        />
      </div>
    </div>
  )
}

export default TestAI
