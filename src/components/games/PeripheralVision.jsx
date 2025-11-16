import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import cvie from '../../services/CVIE'
import './GameStyles.css'

const PeripheralVision = ({ onComplete }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(40)
  const [targets, setTargets] = useState([])
  const [reactions, setReactions] = useState([])
  const [gameState, setGameState] = useState('tutorial')
  const gameAreaRef = useRef(null)

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
      }, 2000)

      return () => {
        clearInterval(timer)
        clearInterval(spawnTimer)
      }
    }
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'playing') {
      const moveTimer = setInterval(() => {
        setTargets(prev => prev.map(t => ({
          ...t,
          progress: t.progress + 0.02,
          x: t.startX + (t.endX - t.startX) * t.progress,
          y: t.startY + (t.endY - t.startY) * t.progress
        })).filter(t => t.progress < 1))
      }, 16)

      return () => clearInterval(moveTimer)
    }
  }, [gameState])

  const spawnTarget = () => {
    if (!gameAreaRef.current) return

    const area = gameAreaRef.current.getBoundingClientRect()
    const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
    const angle = Math.random() * Math.PI / 2 - Math.PI / 4 // -45 to 45 degrees

    let startX, startY, endX, endY

    switch (side) {
      case 0: // Top
        startX = Math.random() * area.width
        startY = -50
        endX = area.width / 2
        endY = area.height / 2
        break
      case 1: // Right
        startX = area.width + 50
        startY = Math.random() * area.height
        endX = area.width / 2
        endY = area.height / 2
        break
      case 2: // Bottom
        startX = Math.random() * area.width
        startY = area.height + 50
        endX = area.width / 2
        endY = area.height / 2
        break
      case 3: // Left
        startX = -50
        startY = Math.random() * area.height
        endX = area.width / 2
        endY = area.height / 2
        break
    }

    const target = {
      id: Date.now(),
      startX,
      startY,
      endX,
      endY,
      x: startX,
      y: startY,
      progress: 0,
      side,
      angle: angle * 180 / Math.PI,
      spawnTime: Date.now()
    }

    setTargets(prev => [...prev, target])
  }

  const handleTargetClick = (targetId, side, angle) => {
    const target = targets.find(t => t.id === targetId)
    if (!target) return

    const reactionTime = Date.now() - target.spawnTime
    setReactions(prev => [...prev, { side, angle, reactionTime }])
    setScore(prev => prev + Math.max(50, 300 - reactionTime))
    setTargets(prev => prev.filter(t => t.id !== targetId))
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(40)
    setTargets([])
    setReactions([])
  }

  const endGame = () => {
    setGameState('results')
    setTargets([])

    // Calculate AI insights with CVIE
    const sidePerformance = {
      top: reactions.filter(r => r.side === 0).map(r => r.reactionTime),
      right: reactions.filter(r => r.side === 1).map(r => r.reactionTime),
      bottom: reactions.filter(r => r.side === 2).map(r => r.reactionTime),
      left: reactions.filter(r => r.side === 3).map(r => r.reactionTime)
    }

    const avgBySide = Object.keys(sidePerformance).map(side => ({
      side,
      avg: sidePerformance[side].reduce((a, b) => a + b, 0) / (sidePerformance[side].length || 1)
    }))

    const peripheralScore = Math.round((reactions.length / 20) * 100)
    const avgReaction = reactions.reduce((a, b) => a + b.reactionTime, 0) / reactions.length || 0

    // Use CVIE for spatial sensitivity analysis
    const comparison = cvie.comparePerformance({
      reactionTime: avgReaction,
      peripheralScore,
      spatialSensitivity: avgBySide
    }, 30, 'mid-range')

    // Analyze peripheral patterns
    const patterns = cvie.analyzePatterns({
      movements: reactions.map(r => ({
        speed: r.reactionTime / 100,
        amplitude: r.angle / 90,
        direction: r.side
      })),
      gazePoints: reactions.map(r => ({
        x: r.side === 1 ? 0.8 : r.side === 3 ? 0.2 : 0.5,
        y: r.side === 0 ? 0.2 : r.side === 2 ? 0.8 : 0.5
      }))
    })

    const gameData = {
      game: 'peripheral-vision',
      score,
      sidePerformance: avgBySide,
      peripheralScore,
      totalTargets: reactions.length,
      aiAnalysis: comparison,
      patterns,
      timestamp: new Date().toISOString()
    }

    console.log('Game Data with CVIE Analysis:', gameData)
    localStorage.setItem('peripheral_vision_data', JSON.stringify(gameData))
  }

  const getInsights = () => {
    if (reactions.length === 0) return null

    const sidePerformance = {
      top: reactions.filter(r => r.side === 0).length,
      right: reactions.filter(r => r.side === 1).length,
      bottom: reactions.filter(r => r.side === 2).length,
      left: reactions.filter(r => r.side === 3).length
    }

    const weakestSide = Object.entries(sidePerformance).sort((a, b) => a[1] - b[1])[0]

    return {
      peripheralScore: Math.round((reactions.length / 20) * 100),
      weakestSide: weakestSide[0],
      totalCaught: reactions.length
    }
  }

  const insights = getInsights()

  if (gameState === 'tutorial') {
    return (
      <div className="game-screen">
        <div className="tutorial-content">
          <h2>Peripheral Vision Ninja</h2>
          <div className="tutorial-icon">👁️</div>
          <p className="tutorial-text">
            Tap objects appearing from the sides before they reach the center. Test your peripheral awareness!
          </p>
          <p className="tutorial-details">
            This game measures peripheral awareness, left vs right balance, and attention spread.
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
                <span className="insight-label">Peripheral Score:</span>
                <span className="insight-value">{insights.peripheralScore}/100</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Targets Caught:</span>
                <span className="insight-value">{insights.totalCaught}</span>
              </div>
              {insights.weakestSide && (
                <div className="insight-item highlight">
                  <span className="insight-label">Zone Alert:</span>
                  <span className="insight-value">Slower response on {insights.weakestSide} side</span>
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
          <span className="hud-label">Caught</span>
          <span className="hud-value">{reactions.length}</span>
        </div>
      </div>

      <div className="game-area peripheral-area" ref={gameAreaRef}>
        {targets.map(target => (
          <motion.div
            key={target.id}
            className="peripheral-target"
            style={{
              left: target.x,
              top: target.y,
              position: 'absolute'
            }}
            onClick={() => handleTargetClick(target.id, target.side, target.angle)}
            whileHover={{ scale: 1.2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="target-inner">⚡</div>
          </motion.div>
        ))}
        <div className="center-indicator">👁️</div>
      </div>
    </div>
  )
}

export default PeripheralVision

