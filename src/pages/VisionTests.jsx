import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import cvie from '../services/CVIE'
import MyopiaTest from '../components/tests/MyopiaTest'
import HyperopiaTest from '../components/tests/HyperopiaTest'
import AstigmatismTest from '../components/tests/AstigmatismTest'
import ColorBlindnessTest from '../components/tests/ColorBlindnessTest'
import ContrastTest from '../components/tests/ContrastTest'
import DryEyeTest from '../components/tests/DryEyeTest'
import VoiceBot from '../components/VoiceBot'
import TestLayout from '../components/TestLayout'
import './VisionTests.css'

const VisionTests = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTest, setCurrentTest] = useState(0)
  const [testResults, setTestResults] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

    useEffect(() => {
    // Load AI analysis from eye scan if available
    if (location.state?.aiAnalysis) {
      setAiAnalysis(location.state.aiAnalysis)
    } else {
      const saved = localStorage.getItem('cvie_analysis')
      if (saved) {
        const data = JSON.parse(saved)
        setAiAnalysis(data.comparison)
      }
    }
    }, [location.state])

  const tests = [
    {
      id: 'myopia',
      name: 'Myopia Test',
      description: 'Test for nearsightedness',
      component: MyopiaTest
    },
    {
      id: 'hyperopia',
      name: 'Hyperopia Test',
      description: 'Test for farsightedness',
      component: HyperopiaTest
    },
    {
      id: 'astigmatism',
      name: 'Astigmatism Test',
      description: 'Test for astigmatism',
      component: AstigmatismTest
    },
    {
      id: 'color',
      name: 'Color Blindness Test',
      description: 'Test for color vision',
      component: ColorBlindnessTest
    },
    {
      id: 'contrast',
      name: 'Contrast Sensitivity Test',
      description: 'Test contrast perception',
      component: ContrastTest
    },
    {
      id: 'dry-eye',
      name: 'Dry Eye Risk Test',
      description: 'Assess dry eye symptoms',
      component: DryEyeTest
    }
  ]

  const handleTestComplete = (testId, result) => {
    setTestResults(prev => ({ ...prev, [testId]: result }))
    
    // Use CVIE to analyze test result
    const testAnalysis = cvie.comparePerformance({
      ...result,
      testType: testId
    }, 30, 'mid-range')
    
    // Save pattern for analysis
    cvie.savePattern({
      testId,
      result,
      analysis: testAnalysis,
      timestamp: new Date().toISOString()
    })
    
    if (currentTest < tests.length - 1) {
      setTimeout(() => setCurrentTest(currentTest + 1), 1000)
    } else {
      // Final CVIE comparison with all test results
      const finalAnalysis = cvie.comparePerformance({
        ...testResults,
        [testId]: result
      }, 30, 'mid-range')
      
      setTimeout(() => {
        setShowResults(true)
        setTimeout(() => navigate('/results', { 
          state: { 
            results: { ...testResults, [testId]: result },
            aiAnalysis: finalAnalysis
          } 
        }), 2000)
      }, 1000)
    }
  }

  const TestComponent = tests[currentTest]?.component

  return (
    <TestLayout
      title={showResults ? 'Tests Complete!' : tests[currentTest]?.name || 'Vision Tests'}
      subtitle={showResults ? 'Analyzing your results...' : tests[currentTest]?.description || 'Comprehensive vision analysis'}
      currentStep={currentTest + 1}
      totalSteps={tests.length}
      onExit={() => navigate('/dashboard')}
      fullscreen={true}
      darkMode={true}
    >
      <div className="vision-tests-page">
        {!showResults && TestComponent && (
          <VoiceBot
            mode="test"
            testType={tests[currentTest]?.id}
            screenContent={{
              title: tests[currentTest]?.name,
              description: tests[currentTest]?.description
            }}
          />
        )}

        {showResults ? (
          <div className="vision-tests">
            <div className="test-complete-screen">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="complete-icon"
              >
                ✓
              </motion.div>
              <h2>All Tests Complete!</h2>
              <p>Analyzing your results...</p>
            </div>
          </div>
        ) : (
          <div className="vision-tests">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTest}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="test-content"
              >
                {TestComponent && (
                  <TestComponent
                    onComplete={(result) => handleTestComplete(tests[currentTest].id, result)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </TestLayout>
  )
}

export default VisionTests

