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
import FocusFinder from '../components/games/FocusFinder'
import PeripheralVision from '../components/games/PeripheralVision'
import ColorDetector from '../components/games/ColorDetector'
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

  // Load recommended tests from consultation or use default
  const getRecommendedTests = () => {
    const recommended = localStorage.getItem('recommended_tests')
    if (recommended) {
      const tests = JSON.parse(recommended)
      return tests.map(test => {
        switch (test.id) {
          case 'refractive-assessment':
            return [
              {
                id: 'myopia',
                name: 'Vision Clarity Game - Distance',
                description: 'Interactive test for nearsightedness',
                component: MyopiaTest,
                gameMode: true,
                reason: test.reason
              },
              {
                id: 'hyperopia',
                name: 'Vision Clarity Game - Close-up',
                description: 'Interactive test for farsightedness',
                component: HyperopiaTest,
                gameMode: true,
                reason: test.reason
              },
              {
                id: 'astigmatism',
                name: 'Shape Recognition Game',
                description: 'Interactive test for astigmatism',
                component: AstigmatismTest,
                gameMode: true,
                reason: test.reason
              }
            ]
          case 'digital-eye-strain':
            return [
              {
                id: 'contrast',
                name: 'Screen Comfort Test',
                description: 'Assess digital eye strain symptoms',
                component: ContrastTest,
                gameMode: true,
                reason: test.reason
              },
              {
                id: 'dry-eye',
                name: 'Blink Rate Challenge',
                description: 'Interactive dry eye assessment',
                component: DryEyeTest,
                gameMode: true,
                reason: test.reason
              }
            ]
          case 'contrast-sensitivity':
            return [
              {
                id: 'contrast',
                name: 'Night Vision Challenge',
                description: 'Test low-light vision abilities',
                component: ContrastTest,
                gameMode: true,
                nightMode: true,
                reason: test.reason
              }
            ]
          case 'risk-screening':
            return [
              {
                id: 'color',
                name: 'Color Pattern Detection',
                description: 'Advanced color vision screening',
                component: ColorBlindnessTest,
                gameMode: true,
                advancedMode: true,
                reason: test.reason
              }
            ]
          default:
            return []
        }
      }).flat()
    }
    
    // Default tests if no consultation done - includes trainer games
    return [
      {
        id: 'focus-finder',
        name: 'Focus Finder Challenge',
        description: 'Track and tap moving objects to test your focus and reaction time',
        component: FocusFinder,
        gameMode: true,
        trainerGame: true
      },
      {
        id: 'myopia',
        name: 'Vision Clarity Game - Distance',
        description: 'Interactive test for nearsightedness',
        component: MyopiaTest,
        gameMode: true
      },
      {
        id: 'hyperopia',
        name: 'Vision Clarity Game - Close-up',
        description: 'Interactive test for farsightedness',
        component: HyperopiaTest,
        gameMode: true
      },
      {
        id: 'astigmatism',
        name: 'Shape Recognition Game',
        description: 'Interactive test for astigmatism',
        component: AstigmatismTest,
        gameMode: true
      },
      {
        id: 'peripheral',
        name: 'Peripheral Vision Ninja',
        description: 'Tap objects appearing from the sides to test your peripheral awareness',
        component: PeripheralVision,
        gameMode: true,
        trainerGame: true
      },
      {
        id: 'color-detector',
        name: 'Color & Light Detector',
        description: 'Identify colors, contrasts, and brightness to test your color perception',
        component: ColorDetector,
        gameMode: true,
        trainerGame: true
      },
      {
        id: 'color',
        name: 'Color Pattern Detection',
        description: 'Interactive color vision test',
        component: ColorBlindnessTest,
        gameMode: true
      }
    ]
  }

  const tests = getRecommendedTests()

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

