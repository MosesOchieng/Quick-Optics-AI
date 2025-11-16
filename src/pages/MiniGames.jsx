import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './MiniGames.css'

const MiniGames = () => {
  const navigate = useNavigate()
  const [currentTest, setCurrentTest] = useState(0)
  const [testResults, setTestResults] = useState({})
  const [testComplete, setTestComplete] = useState(false)

  const tests = [
    {
      id: 'myopia',
      name: 'Myopia Test',
      description: 'Read the letters as they shrink',
      type: 'snellen',
      instructions: 'Read aloud the letters you see'
    },
    {
      id: 'hyperopia',
      name: 'Hyperopia Test',
      description: 'Focus on near vs far objects',
      type: 'focus',
      instructions: 'Tell us which text is clearer'
    },
    {
      id: 'astigmatism',
      name: 'Astigmatism Test',
      description: 'Check line clarity',
      type: 'lines',
      instructions: 'Choose the clearest line pattern'
    },
    {
      id: 'color',
      name: 'Color Blindness Test',
      description: 'Ishihara-style dot patterns',
      type: 'color',
      instructions: 'Tap the number you see'
    },
    {
      id: 'contrast',
      name: 'Contrast Sensitivity',
      description: 'Choose the clearest shape',
      type: 'contrast',
      instructions: 'Select the shape with best contrast'
    },
    {
      id: 'depth',
      name: 'Depth Accuracy',
      description: 'Which shape is closer?',
      type: 'depth',
      instructions: 'Tap the shape that appears closer'
    }
  ]

  const handleTestComplete = (testId, result) => {
    setTestResults(prev => ({ ...prev, [testId]: result }))
    if (currentTest < tests.length - 1) {
      setTimeout(() => setCurrentTest(currentTest + 1), 1000)
    } else {
      setTestComplete(true)
      setTimeout(() => navigate('/results', { state: { results: { ...testResults, [testId]: result } } }), 2000)
    }
  }

  const renderTest = (test) => {
    switch (test.type) {
      case 'snellen':
        return <SnellenTest test={test} onComplete={handleTestComplete} />
      case 'focus':
        return <FocusTest test={test} onComplete={handleTestComplete} />
      case 'lines':
        return <LinesTest test={test} onComplete={handleTestComplete} />
      case 'color':
        return <ColorTest test={test} onComplete={handleTestComplete} />
      case 'contrast':
        return <ContrastTest test={test} onComplete={handleTestComplete} />
      case 'depth':
        return <DepthTest test={test} onComplete={handleTestComplete} />
      default:
        return null
    }
  }

  return (
    <div className="mini-games">
      <div className="games-container">
        <div className="test-header">
          <div className="test-progress">
            <div className="progress-dots">
              {tests.map((_, index) => (
                <div
                  key={index}
                  className={`progress-dot ${index <= currentTest ? 'active' : ''} ${index < currentTest ? 'completed' : ''}`}
                />
              ))}
            </div>
            <p className="test-counter">
              Test {currentTest + 1} of {tests.length}
            </p>
          </div>
          <h2 className="test-name">{tests[currentTest].name}</h2>
          <p className="test-description">{tests[currentTest].description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTest}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="test-content"
          >
            <div className="test-instructions">
              <p>{tests[currentTest].instructions}</p>
            </div>
            {renderTest(tests[currentTest])}
          </motion.div>
        </AnimatePresence>

        {testComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="test-complete"
          >
            <div className="complete-icon">✓</div>
            <p>All tests completed! Analyzing results...</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Snellen Test Component
const SnellenTest = ({ test, onComplete }) => {
  const [letterSize, setLetterSize] = useState(100)
  const [currentLetter, setCurrentLetter] = useState('E')
  const letters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'P', 'E', 'D']

  const handleAnswer = (answer) => {
    const result = { correct: answer === currentLetter, size: letterSize }
    onComplete(test.id, result)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (letterSize > 20) {
        setLetterSize(prev => prev - 5)
        setCurrentLetter(letters[Math.floor(Math.random() * letters.length)])
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="snellen-test">
      <div className="letter-display" style={{ fontSize: `${letterSize}px` }}>
        {currentLetter}
      </div>
      <div className="answer-options">
        {letters.slice(0, 6).map(letter => (
          <button
            key={letter}
            className="answer-btn"
            onClick={() => handleAnswer(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  )
}

// Focus Test Component
const FocusTest = ({ test, onComplete }) => {
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    setTimeout(() => {
      onComplete(test.id, { selected: option })
    }, 500)
  }

  return (
    <div className="focus-test">
      <div className="focus-options">
        <button
          className={`focus-option ${selected === 'near' ? 'selected' : ''}`}
          onClick={() => handleSelect('near')}
        >
          <div className="focus-text near-text">Near Text</div>
          <p>This text is closer</p>
        </button>
        <button
          className={`focus-option ${selected === 'far' ? 'selected' : ''}`}
          onClick={() => handleSelect('far')}
        >
          <div className="focus-text far-text">Far Text</div>
          <p>This text is farther</p>
        </button>
      </div>
    </div>
  )
}

// Lines Test Component
const LinesTest = ({ test, onComplete }) => {
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    setTimeout(() => {
      onComplete(test.id, { selected: option })
    }, 500)
  }

  return (
    <div className="lines-test">
      <div className="line-patterns">
        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            className={`line-pattern ${selected === num ? 'selected' : ''}`}
            onClick={() => handleSelect(num)}
          >
            <svg width="200" height="200">
              {Array.from({ length: 10 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 20}
                  x2="200"
                  y2={i * 20}
                  stroke={num === 1 ? '#14b8a6' : '#94a3b8'}
                  strokeWidth="2"
                />
              ))}
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// Color Test Component
const ColorTest = ({ test, onComplete }) => {
  const [selected, setSelected] = useState(null)
  const correctAnswer = 7

  const handleSelect = (num) => {
    setSelected(num)
    setTimeout(() => {
      onComplete(test.id, { selected: num, correct: num === correctAnswer })
    }, 500)
  }

  return (
    <div className="color-test">
      <div className="ishihara-circle">
        <div className="color-dots">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="color-dot"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 3 === 0 ? '#14b8a6' : '#cbd5e1'
              }}
            />
          ))}
          <div className="hidden-number">7</div>
        </div>
      </div>
      <div className="number-options">
        {[3, 5, 7, 8, 9].map(num => (
          <button
            key={num}
            className={`number-btn ${selected === num ? 'selected' : ''}`}
            onClick={() => handleSelect(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

// Contrast Test Component
const ContrastTest = ({ test, onComplete }) => {
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    setTimeout(() => {
      onComplete(test.id, { selected: option })
    }, 500)
  }

  return (
    <div className="contrast-test">
      <div className="contrast-shapes">
        {['circle', 'square', 'triangle'].map(shape => (
          <button
            key={shape}
            className={`contrast-shape ${selected === shape ? 'selected' : ''}`}
            onClick={() => handleSelect(shape)}
          >
            <div className={`shape ${shape}`} style={{ opacity: shape === 'circle' ? 1 : 0.3 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// Depth Test Component
const DepthTest = ({ test, onComplete }) => {
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    setTimeout(() => {
      onComplete(test.id, { selected: option })
    }, 500)
  }

  return (
    <div className="depth-test">
      <div className="depth-shapes">
        <button
          className={`depth-shape ${selected === 'left' ? 'selected' : ''}`}
          onClick={() => handleSelect('left')}
        >
          <div className="shape circle" style={{ transform: 'translateZ(20px)' }} />
        </button>
        <button
          className={`depth-shape ${selected === 'right' ? 'selected' : ''}`}
          onClick={() => handleSelect('right')}
        >
          <div className="shape circle" style={{ transform: 'translateZ(-20px)' }} />
        </button>
      </div>
    </div>
  )
}

export default MiniGames

