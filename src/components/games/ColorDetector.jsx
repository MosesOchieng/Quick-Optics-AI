import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import cvie from '../../services/CVIE'
import './GameStyles.css'

const ColorDetector = ({ onComplete }) => {
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [gameState, setGameState] = useState('tutorial')
  const [currentTest, setCurrentTest] = useState(null)
  const [answers, setAnswers] = useState([])
  const [difficulty, setDifficulty] = useState(1)

  const colorTests = [
    {
      type: 'color',
      question: 'What color do you see?',
      options: ['Red', 'Green', 'Blue', 'Yellow'],
      correct: 0,
      color: '#ff6b6b'
    },
    {
      type: 'brightness',
      question: 'Which side is brighter?',
      options: ['Left', 'Right'],
      correct: 0,
      leftBrightness: 0.9,
      rightBrightness: 0.5
    },
    {
      type: 'contrast',
      question: 'Which shape has better contrast?',
      options: ['Top', 'Bottom'],
      correct: 0,
      topContrast: 0.8,
      bottomContrast: 0.3
    },
    {
      type: 'shade',
      question: 'Match the shade',
      options: ['A', 'B', 'C', 'D'],
      correct: 1,
      targetShade: '#8b5cf6',
      shades: ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9']
    }
  ]

  useEffect(() => {
    if (gameState === 'playing' && round <= 10) {
      generateTest()
    } else if (round > 10) {
      endGame()
    }
  }, [gameState, round])

  const generateTest = () => {
    const testType = colorTests[Math.floor(Math.random() * colorTests.length)]
    const adjustedTest = adjustDifficulty(testType)
    setCurrentTest(adjustedTest)
  }

  const adjustDifficulty = (test) => {
    // Use CVIE Adaptive Difficulty AI
    const accuracy = answers.filter(a => a.correct).length / Math.max(answers.length, 1)
    const difficultyResult = cvie.adaptDifficulty('color-detector', {
      correct: accuracy > 0.5,
      accuracy,
      timestamp: Date.now()
    })
    
    setDifficulty(difficultyResult.difficulty)

    const adjusted = { ...test }
    
    if (test.type === 'brightness') {
      adjusted.leftBrightness = Math.max(0.3, test.leftBrightness - (difficulty - 1) * 0.2)
      adjusted.rightBrightness = Math.max(0.1, test.rightBrightness - (difficulty - 1) * 0.1)
    } else if (test.type === 'contrast') {
      adjusted.topContrast = Math.max(0.2, test.topContrast - (difficulty - 1) * 0.15)
      adjusted.bottomContrast = Math.max(0.1, test.bottomContrast - (difficulty - 1) * 0.1)
    }

    return adjusted
  }

  const handleAnswer = (answerIndex) => {
    if (!currentTest) return

    const isCorrect = answerIndex === currentTest.correct
    const answerData = {
      round,
      testType: currentTest.type,
      correct: isCorrect,
      difficulty,
      timestamp: Date.now()
    }

    setAnswers(prev => [...prev, answerData])
    
    if (isCorrect) {
      setScore(prev => prev + Math.round(100 * difficulty))
    }

    setTimeout(() => {
      setRound(prev => prev + 1)
    }, 1000)
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setRound(1)
    setAnswers([])
    setDifficulty(1)
  }

  const endGame = () => {
    setGameState('results')
    setCurrentTest(null)

    // Calculate AI insights with CVIE
    const typePerformance = {
      color: answers.filter(a => a.testType === 'color' && a.correct).length,
      brightness: answers.filter(a => a.testType === 'brightness' && a.correct).length,
      contrast: answers.filter(a => a.testType === 'contrast' && a.correct).length,
      shade: answers.filter(a => a.testType === 'shade' && a.correct).length
    }

    const colorScore = Math.round((answers.filter(a => a.correct).length / answers.length) * 100)

    // Use CVIE for comparison
    const comparison = cvie.comparePerformance({
      colorScore,
      colorResponses: answers,
      lightAdaptation: 0.3
    }, 30, 'mid-range')

    const gameData = {
      game: 'color-detector',
      score,
      colorScore,
      typePerformance,
      avgDifficulty: difficulty,
      totalRounds: answers.length,
      aiAnalysis: comparison,
      timestamp: new Date().toISOString()
    }

    console.log('Game Data with CVIE Analysis:', gameData)
    localStorage.setItem('color_detector_data', JSON.stringify(gameData))
  }

  const getInsights = () => {
    if (answers.length === 0) return null

    const accuracy = (answers.filter(a => a.correct).length / answers.length) * 100
    const weakestType = Object.entries({
      color: answers.filter(a => a.testType === 'color' && a.correct).length,
      brightness: answers.filter(a => a.testType === 'brightness' && a.correct).length,
      contrast: answers.filter(a => a.testType === 'contrast' && a.correct).length,
      shade: answers.filter(a => a.testType === 'shade' && a.correct).length
    }).sort((a, b) => a[1] - b[1])[0]

    return {
      colorScore: Math.round(accuracy),
      weakestType: weakestType[0],
      avgDifficulty: difficulty.toFixed(1)
    }
  }

  const insights = getInsights()

  if (gameState === 'tutorial') {
    return (
      <div className="game-screen">
        <div className="tutorial-content">
          <h2>Color & Light Detector</h2>
          <div className="tutorial-icon">🌈</div>
          <p className="tutorial-text">
            Identify colors, brightness, and contrast. The game adapts to your skill level!
          </p>
          <p className="tutorial-details">
            This game measures color sensitivity, contrast recognition, and light perception.
          </p>
          <button className="btn btn-primary btn-large" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    return (
      <div className="game-screen">
        <div className="results-content">
          <h2>Game Complete!</h2>
          <div className="score-display">
            <div className="score-value">{score}</div>
            <div className="score-label">Total Score</div>
          </div>
          {insights && (
            <div className="insights">
              <h3>Your Performance</h3>
              <div className="insight-item">
                <span className="insight-label">Color Perception Score:</span>
                <span className="insight-value">{insights.colorScore}/100</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Average Difficulty:</span>
                <span className="insight-value">{insights.avgDifficulty}/3.0</span>
              </div>
              {insights.weakestType && (
                <div className="insight-item highlight">
                  <span className="insight-label">Area for Improvement:</span>
                  <span className="insight-value">{insights.weakestType} detection</span>
                </div>
              )}
            </div>
          )}
          <div className="results-actions">
            <button className="btn btn-primary" onClick={startGame}>
              Play Again
            </button>
            <button className="btn btn-secondary" onClick={onComplete}>
              Back to Games
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTest) {
    return <div className="game-screen">Loading test...</div>
  }

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Round</span>
          <span className="hud-value">{round}/10</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Difficulty</span>
          <span className="hud-value">{difficulty.toFixed(1)}</span>
        </div>
      </div>

      <div className="color-test-area">
        <h3 className="test-question">{currentTest.question}</h3>
        
        {currentTest.type === 'color' && (
          <div className="color-display" style={{ backgroundColor: currentTest.color }}>
            <div className="color-preview" />
          </div>
        )}

        {currentTest.type === 'brightness' && (
          <div className="brightness-display">
            <div 
              className="brightness-side left" 
              style={{ opacity: currentTest.leftBrightness }}
            />
            <div 
              className="brightness-side right" 
              style={{ opacity: currentTest.rightBrightness }}
            />
          </div>
        )}

        {currentTest.type === 'contrast' && (
          <div className="contrast-display">
            <div 
              className="contrast-shape top" 
              style={{ opacity: currentTest.topContrast }}
            />
            <div 
              className="contrast-shape bottom" 
              style={{ opacity: currentTest.bottomContrast }}
            />
          </div>
        )}

        {currentTest.type === 'shade' && (
          <div className="shade-display">
            <div className="target-shade" style={{ backgroundColor: currentTest.targetShade }} />
            <div className="shade-options">
              {currentTest.shades.map((shade, idx) => (
                <div
                  key={idx}
                  className="shade-option"
                  style={{ backgroundColor: shade }}
                  onClick={() => handleAnswer(idx)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="answer-options">
          {currentTest.options.map((option, idx) => (
            <button
              key={idx}
              className="answer-btn"
              onClick={() => handleAnswer(idx)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorDetector

