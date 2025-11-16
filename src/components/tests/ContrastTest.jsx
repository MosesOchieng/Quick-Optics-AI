import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const ContrastTest = ({ onComplete }) => {
  const [round, setRound] = useState(1)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const maxRounds = 6

  const contrastTests = [
    { clearer: 'top', topContrast: 0.9, bottomContrast: 0.3 },
    { clearer: 'bottom', topContrast: 0.2, bottomContrast: 0.8 },
    { clearer: 'top', topContrast: 0.8, bottomContrast: 0.4 },
    { clearer: 'bottom', topContrast: 0.3, bottomContrast: 0.7 },
    { clearer: 'top', topContrast: 0.7, bottomContrast: 0.3 },
    { clearer: 'bottom', topContrast: 0.4, bottomContrast: 0.9 }
  ]

  const handleAnswer = (selected) => {
    const test = contrastTests[round - 1]
    const isCorrect = selected === test.clearer

    const answer = {
      round,
      correct: isCorrect,
      selected,
      actual: test.clearer
    }

    setAnswers(prev => [...prev, answer])
    setShowResult(true)

    setTimeout(() => {
      if (round < maxRounds) {
        setRound(round + 1)
        setShowResult(false)
      } else {
        calculateResult()
      }
    }, 1500)
  }

  const calculateResult = () => {
    const correctCount = answers.filter(a => a.correct).length
    const score = Math.round((correctCount / maxRounds) * 100)
    const risk = score < 60 ? 'high' : score < 80 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      correctAnswers: correctCount,
      type: 'contrast'
    })
  }

  const test = contrastTests[round - 1]

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>Which shape has better contrast?</h3>
        <p>Compare the top and bottom shapes</p>
      </div>

      {test && (
        <motion.div
          key={round}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="contrast-display-test"
        >
          <div
            className="contrast-shape-test top"
            style={{ opacity: test.topContrast }}
            onClick={() => handleAnswer('top')}
          >
            <div className="shape-circle" />
          </div>
          <div
            className="contrast-shape-test bottom"
            style={{ opacity: test.bottomContrast }}
            onClick={() => handleAnswer('bottom')}
          >
            <div className="shape-circle" />
          </div>
        </motion.div>
      )}

      {!showResult && (
        <div className="test-actions">
          <button
            className="btn btn-success btn-large"
            onClick={() => handleAnswer('top')}
          >
            Top shape is clearer
          </button>
          <button
            className="btn btn-danger btn-large"
            onClick={() => handleAnswer('bottom')}
          >
            Bottom shape is clearer
          </button>
        </div>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="test-feedback"
        >
          <p>Recording your response...</p>
        </motion.div>
      )}

      <div className="test-progress-info">
        Round {round} of {maxRounds}
      </div>
    </div>
  )
}

export default ContrastTest

