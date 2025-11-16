import { useState } from 'react'
import { motion } from 'framer-motion'
import '../games/GameStyles.css'

const DryEyeTest = ({ onComplete }) => {
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const questions = [
    {
      id: 'burning',
      text: 'Do you experience burning or stinging in your eyes?',
      options: ['Never', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'dryness',
      text: 'Do your eyes feel dry?',
      options: ['Never', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'blurred',
      text: 'Do you experience blurred vision that improves with blinking?',
      options: ['Never', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'sensitivity',
      text: 'Are your eyes sensitive to light?',
      options: ['Never', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'redness',
      text: 'Do your eyes appear red or irritated?',
      options: ['Never', 'Sometimes', 'Often', 'Always']
    }
  ]

  const handleAnswer = (questionId, answer) => {
    const score = ['Never', 'Sometimes', 'Often', 'Always'].indexOf(answer)
    setAnswers(prev => ({ ...prev, [questionId]: score }))

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500)
    } else {
      calculateResult()
    }
  }

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
    const maxScore = questions.length * 3
    const score = Math.round((totalScore / maxScore) * 100)
    const risk = score > 60 ? 'high' : score > 30 ? 'moderate' : 'low'

    onComplete({
      score,
      risk,
      totalScore,
      type: 'dry-eye'
    })
  }

  const question = questions[currentQuestion]

  return (
    <div className="test-container">
      <div className="test-instructions">
        <h3>Dry Eye Risk Assessment</h3>
        <p>Answer based on your recent experience</p>
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="question-display"
      >
        <h4 className="question-text">{question.text}</h4>
      </motion.div>

      <div className="answer-options-vertical">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className="answer-option-btn"
            onClick={() => handleAnswer(question.id, option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="test-progress-info">
        Question {currentQuestion + 1} of {questions.length}
      </div>
    </div>
  )
}

export default DryEyeTest

