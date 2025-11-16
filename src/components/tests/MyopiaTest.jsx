import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const MyopiaTest = ({ onComplete }) => {
  const [currentLetter, setCurrentLetter] = useState('E')
  const [letterSize, setLetterSize] = useState(120)
  const [answers, setAnswers] = useState([])
  const [round, setRound] = useState(1)
  const [showResult, setShowResult] = useState(false)

  const letters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'P', 'E', 'D']
  const maxRounds = 8

  useEffect(() => {
    if (round <= maxRounds && !showResult) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)]
      setCurrentLetter(randomLetter)
      setLetterSize(120 - (round - 1) * 10)
    }
  }, [round, showResult])

  const handleAnswer = (canSee) => {
    const answer = {
      round,
      letterSize,
      canSee,
      letter: currentLetter
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
    const smallestVisible = answers.filter(a => a.canSee).sort((a, b) => b.letterSize - a.letterSize)[0]
    const score = smallestVisible ? Math.round((smallestVisible.letterSize / 120) * 100) : 0
    const risk = score < 60 ? 'high' : score < 80 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      smallestVisibleSize: smallestVisible?.letterSize || 0,
      type: 'myopia'
    })
  }

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>Can you see this letter clearly?</h3>
        <p>Look at the letter and tell us if you can see it clearly</p>
      </div>

      <motion.div
        key={round}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="letter-display"
        style={{ fontSize: `${letterSize}px` }}
      >
        {currentLetter}
      </motion.div>

      {!showResult && (
        <div className="test-actions">
          <button
            className="btn btn-success btn-large"
            onClick={() => handleAnswer(true)}
          >
            Yes, I can see it
          </button>
          <button
            className="btn btn-danger btn-large"
            onClick={() => handleAnswer(false)}
          >
            No, it's blurry
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

export default MyopiaTest

