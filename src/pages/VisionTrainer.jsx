import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FocusFinder from '../components/games/FocusFinder'
import PeripheralVision from '../components/games/PeripheralVision'
import ColorDetector from '../components/games/ColorDetector'
import './VisionTrainer.css'

const VisionTrainer = () => {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'focus-finder',
      name: 'Focus Finder Challenge',
      icon: '🎯',
      description: 'Track and tap moving objects to test your focus and reaction time',
      component: FocusFinder
    },
    {
      id: 'peripheral',
      name: 'Peripheral Vision Ninja',
      icon: '👁️',
      description: 'Tap objects appearing from the sides to test your peripheral awareness',
      component: PeripheralVision
    },
    {
      id: 'color-detector',
      name: 'Color & Light Detector',
      icon: '🌈',
      description: 'Identify colors, contrasts, and brightness to test your color perception',
      component: ColorDetector
    }
  ]

  const GameComponent = selectedGame ? games.find(g => g.id === selectedGame)?.component : null

  if (selectedGame && GameComponent) {
    return (
      <div className="vision-trainer">
        <div className="game-container">
          <button className="back-button" onClick={() => setSelectedGame(null)}>
            ← Back to Games
          </button>
          <GameComponent onComplete={() => setSelectedGame(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="vision-trainer">
      <div className="trainer-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="trainer-header"
        >
          <h1 className="trainer-title">Vision Trainer</h1>
          <p className="trainer-subtitle">
            Fun mini-games that help calibrate your vision and improve screening accuracy
          </p>
        </motion.div>

        <div className="games-grid">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="game-card"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className="game-icon">{game.icon}</div>
              <h2 className="game-name">{game.name}</h2>
              <p className="game-description">{game.description}</p>
              <div className="game-badge">Play Now →</div>
            </motion.div>
          ))}
        </div>

        <div className="trainer-info">
          <h3>How Vision Trainer Helps</h3>
          <ul>
            <li>✓ Calibrates baseline reaction time and focus consistency</li>
            <li>✓ Personalizes your eye scan results</li>
            <li>✓ Provides early indicators of visual performance</li>
            <li>✓ All data is anonymous and used for model improvement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default VisionTrainer

