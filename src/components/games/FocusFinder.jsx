import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import cvie from '../../services/CVIE'
import AIBot from '../AIBot'
import './GameStyles.css'

const FocusFinder = ({ onComplete }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(40)
  const [target, setTarget] = useState(null)
  const [reactionTimes, setReactionTimes] = useState([])
  const [gameState, setGameState] = useState('tutorial') // tutorial, playing, results
  const gameAreaRef = useRef(null)
  const targetRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const spawnTimer = setInterval(() => {
        spawnTarget()
      }, 1500)

      return () => {
        clearInterval(timer)
        clearInterval(spawnTimer)
      }
    }
  }, [gameState, timeLeft])

  const spawnTarget = () => {
    if (!gameAreaRef.current) return

    const area = gameAreaRef.current.getBoundingClientRect()
    const size = 60 + Math.random() * 40
    const x = Math.random() * (area.width - size)
    const y = Math.random() * (area.height - size)

    setTarget({
      x,
      y,
      size,
      id: Date.now(),
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      }
    })

    startTimeRef.current = Date.now()
  }

  const handleTargetClick = () => {
    if (!target || !startTimeRef.current) return

    const reactionTime = Date.now() - startTimeRef.current
    setReactionTimes(prev => [...prev, reactionTime])
    setScore(prev => prev + Math.max(100, 500 - reactionTime))
    
    // Use CVIE adaptive difficulty
    const difficulty = cvie.adaptDifficulty('focus-finder', {
      correct: true,
      reactionTime,
      timestamp: Date.now()
    })
    
    setTarget(null)
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(40)
    setReactionTimes([])
    spawnTarget()
  }

  const endGame = () => {
    setGameState('results')
    setTarget(null)

    // Calculate AI insights using CVIE
    const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length || 0
    const focusScore = Math.round((1 - Math.min(avgReaction / 1000, 1)) * 100)

    // Use CVIE to compare performance
    const comparison = cvie.comparePerformance({
      reactionTime: avgReaction,
      focusScore,
      stability: 85,
      focusSpeed: 0.6
    }, 30, 'mid-range')

    // Save to storage with AI analysis
    const gameData = {
      game: 'focus-finder',
      score,
      avgReactionTime: avgReaction,
      focusScore,
      totalTargets: reactionTimes.length,
      aiAnalysis: comparison,
      timestamp: new Date().toISOString()
    }

    console.log('Game Data with CVIE Analysis:', gameData)
    localStorage.setItem('focus_finder_data', JSON.stringify(gameData))
  }

  const getInsights = () => {
    if (reactionTimes.length === 0) return null

    const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    
    // Use CVIE for accurate percentile calculation
    const comparison = cvie.comparePerformance({
      reactionTime: avgReaction,
      focusScore: Math.round((1 - Math.min(avgReaction / 1000, 1)) * 100)
    }, 30, 'mid-range')

    const percentile = comparison.comparisons.population?.reactionTimePercentile || 50

    return {
      avgReaction: Math.round(avgReaction),
      percentile: Math.round(percentile),
      focusScore: Math.round((1 - Math.min(avgReaction / 1000, 1)) * 100),
      aiInsights: comparison.insights
    }
  }

  const insights = getInsights()

  if (gameState === 'tutorial') {
    return (
      <div className="game-screen">
        <div className="tutorial-content">
          <h2>Focus Finder Challenge</h2>
          <div className="tutorial-icon">🎯</div>
          <p className="tutorial-text">
            Tap the moving target when it's in focus. The faster you react, the higher your score!
          </p>
          <p className="tutorial-details">
            This game measures your reaction time, focus consistency, and tracking ability.
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
                <span className="insight-label">Average Reaction Time:</span>
                <span className="insight-value">{insights.avgReaction}ms</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Focus Score:</span>
                <span className="insight-value">{insights.focusScore}/100</span>
              </div>
              <div className="insight-item highlight">
                <span className="insight-label">You react faster than:</span>
                <span className="insight-value">{insights.percentile}% of people your age</span>
              </div>
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

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time</span>
          <span className="hud-value">{timeLeft}s</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Targets</span>
          <span className="hud-value">{reactionTimes.length}</span>
        </div>
      </div>

      <div className="game-area" ref={gameAreaRef} onClick={handleTargetClick}>
        {target && (
          <motion.div
            ref={targetRef}
            className="target"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              x: target.x,
              y: target.y,
              scale: 1,
              opacity: 1
            }}
            style={{
              width: target.size,
              height: target.size,
              position: 'absolute',
              left: target.x,
              top: target.y
            }}
            whileHover={{ scale: 1.1 }}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              y: { type: 'spring', stiffness: 300, damping: 30 }
            }}
          >
            <div className="target-inner">🎯</div>
          </motion.div>
        )}
        {!target && (
          <div className="waiting-message">Get ready for the next target...</div>
        )}
      </div>
    </div>
  )
}

export default FocusFinder

