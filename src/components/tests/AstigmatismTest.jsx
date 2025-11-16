import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const AstigmatismTest = ({ onComplete }) => {
  const [round, setRound] = useState(1)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(0)
  const maxRounds = 6

  useEffect(() => {
    if (round <= maxRounds) {
      setCurrentAngle(Math.random() * 360)
    }
  }, [round])

  const handleAnswer = (allLinesEqual) => {
    const answer = {
      round,
      angle: currentAngle,
      allLinesEqual
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
    const equalLinesCount = answers.filter(a => a.allLinesEqual).length
    const score = Math.round((equalLinesCount / maxRounds) * 100)
    const risk = score < 60 ? 'high' : score < 80 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      type: 'astigmatism'
    })
  }

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>Are all lines equally clear?</h3>
        <p>Look at the lines from different angles</p>
      </div>

      <motion.div
        key={round}
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        className="astigmatism-display"
      >
        <svg width="300" height="300" viewBox="0 0 300 300">
          {[0, 45, 90, 135].map((angle, idx) => (
            <line
              key={idx}
              x1="150"
              y1="150"
              x2={150 + 100 * Math.cos((angle + currentAngle) * Math.PI / 180)}
              y2={150 + 100 * Math.sin((angle + currentAngle) * Math.PI / 180)}
              stroke="#14b8a6"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <circle cx="150" cy="150" r="5" fill="#14b8a6" />
        </svg>
      </motion.div>

      {!showResult && (
        <div className="test-actions">
          <button
            className="btn btn-success btn-large"
            onClick={() => handleAnswer(true)}
          >
            Yes, all lines are equal
          </button>
          <button
            className="btn btn-danger btn-large"
            onClick={() => handleAnswer(false)}
          >
            No, some lines are blurry
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

export default AstigmatismTest

