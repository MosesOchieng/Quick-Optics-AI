import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const HyperopiaTest = ({ onComplete }) => {
  const [round, setRound] = useState(1)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const maxRounds = 6

  const handleAnswer = (nearClearer) => {
    const answer = {
      round,
      nearClearer
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
    const nearClearerCount = answers.filter(a => a.nearClearer).length
    const score = Math.round((nearClearerCount / maxRounds) * 100)
    const risk = score > 70 ? 'high' : score > 40 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      type: 'hyperopia'
    })
  }

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>Which text is clearer?</h3>
        <p>Compare the near text and far text</p>
      </div>

      <motion.div
        key={round}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="focus-test-display"
      >
        <div className="text-pair">
          <div className="text-near">
            <p className="text-label">Near (Close)</p>
            <div className="text-content" style={{ fontSize: '2rem' }}>
              ABCDEFG
            </div>
          </div>
          <div className="text-far">
            <p className="text-label">Far (Distance)</p>
            <div className="text-content" style={{ fontSize: '1.5rem' }}>
              ABCDEFG
            </div>
          </div>
        </div>
      </motion.div>

      {!showResult && (
        <div className="test-actions">
          <button
            className="btn btn-success btn-large"
            onClick={() => handleAnswer(true)}
          >
            Near text is clearer
          </button>
          <button
            className="btn btn-danger btn-large"
            onClick={() => handleAnswer(false)}
          >
            Far text is clearer
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

export default HyperopiaTest

