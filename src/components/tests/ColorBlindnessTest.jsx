import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const ColorBlindnessTest = ({ onComplete }) => {
  const [round, setRound] = useState(1)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [currentNumber, setCurrentNumber] = useState(null)
  const maxRounds = 6

  const ishiharaTests = [
    { number: 7, colors: ['#14b8a6', '#cbd5e1'] },
    { number: 3, colors: ['#f59e0b', '#cbd5e1'] },
    { number: 8, colors: ['#8b5cf6', '#cbd5e1'] },
    { number: 5, colors: ['#ef4444', '#cbd5e1'] },
    { number: 2, colors: ['#10b981', '#cbd5e1'] },
    { number: 9, colors: ['#06b6d4', '#cbd5e1'] }
  ]

  useEffect(() => {
    if (round <= maxRounds) {
      const test = ishiharaTests[round - 1]
      setCurrentNumber(test.number)
    }
  }, [round])

  const handleAnswer = (selectedNumber) => {
    const test = ishiharaTests[round - 1]
    const isCorrect = selectedNumber === test.number

    const answer = {
      round,
      correct: isCorrect,
      selected: selectedNumber,
      actual: test.number
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
    const risk = score < 70 ? 'high' : score < 90 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      correctAnswers: correctCount,
      type: 'color-blindness'
    })
  }

  const test = ishiharaTests[round - 1]

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>What number do you see?</h3>
        <p>Look at the colored circle and identify the number</p>
      </div>

      {test && (
        <motion.div
          key={round}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ishihara-circle"
        >
          <div className="color-dots-container">
            {Array.from({ length: 200 }).map((_, i) => {
              const isNumberDot = i % 10 === 0
              return (
                <div
                  key={i}
                  className="color-dot"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: isNumberDot ? test.colors[0] : test.colors[1]
                  }}
                />
              )
            })}
            <div className="hidden-number">{test.number}</div>
          </div>
        </motion.div>
      )}

      {!showResult && (
        <div className="number-options">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className="number-btn"
              onClick={() => handleAnswer(num)}
            >
              {num}
            </button>
          ))}
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

export default ColorBlindnessTest

