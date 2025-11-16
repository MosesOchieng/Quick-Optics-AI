import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './EyewearRecommendation.css'

const EyewearRecommendation = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('professional')
  const [detectedFaceShape] = useState('oval') // In real app, this would come from face detection

  const faceShapes = {
    oval: { name: 'Oval', description: 'Well-balanced proportions' },
    round: { name: 'Round', description: 'Soft, curved features' },
    square: { name: 'Square', description: 'Strong, angular jawline' },
    heart: { name: 'Heart', description: 'Wider forehead, narrow chin' },
    triangle: { name: 'Triangle', description: 'Narrow forehead, wider jaw' }
  }

  const categories = [
    {
      id: 'professional',
      name: 'Professional Frames',
      description: 'Elegant and sophisticated styles for the workplace',
      frames: [
        { id: 1, name: 'Classic Black', price: '$129', image: '🖤' },
        { id: 2, name: 'Tortoise Shell', price: '$149', image: '🤎' },
        { id: 3, name: 'Silver Metal', price: '$159', image: '⚪' }
      ]
    },
    {
      id: 'sport',
      name: 'Sport Frames',
      description: 'Durable and lightweight for active lifestyles',
      frames: [
        { id: 4, name: 'Athletic Black', price: '$179', image: '⚫' },
        { id: 5, name: 'Racing Red', price: '$189', image: '🔴' },
        { id: 6, name: 'Blue Performance', price: '$199', image: '🔵' }
      ]
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle Frames',
      description: 'Trendy and versatile for everyday wear',
      frames: [
        { id: 7, name: 'Vintage Brown', price: '$139', image: '🟤' },
        { id: 8, name: 'Modern Clear', price: '$149', image: '🔲' },
        { id: 9, name: 'Bold Gold', price: '$169', image: '🟡' }
      ]
    }
  ]

  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  const handleTryOn = (frameId) => {
    navigate('/ar-try-on', { state: { frameId, category: selectedCategory } })
  }

  return (
    <div className="eyewear-recommendation">
      <div className="eyewear-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <h1 className="page-title">Find Your Perfect Frames</h1>
          <p className="page-subtitle">
            Based on your face shape and preferences
          </p>
        </motion.div>

        <div className="face-shape-section">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="face-shape-card"
          >
            <div className="face-shape-icon">👤</div>
            <div className="face-shape-info">
              <h3 className="face-shape-title">Detected Face Shape</h3>
              <p className="face-shape-name">{faceShapes[detectedFaceShape].name}</p>
              <p className="face-shape-description">{faceShapes[detectedFaceShape].description}</p>
            </div>
            <div className="face-shape-badge">
              <span className="badge-text">Recommended</span>
            </div>
          </motion.div>
        </div>

        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="category-content"
        >
          <div className="category-header">
            <h2 className="category-title">{currentCategory.name}</h2>
            <p className="category-description">{currentCategory.description}</p>
          </div>

          <div className="frames-grid">
            {currentCategory.frames.map((frame, index) => (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="frame-card"
              >
                <div className="frame-image">
                  <div className="frame-display">{frame.image}</div>
                  <div className="recommended-badge">
                    Recommended for your face shape
                  </div>
                </div>
                <div className="frame-info">
                  <h3 className="frame-name">{frame.name}</h3>
                  <p className="frame-price">{frame.price}</p>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleTryOn(frame.id)}
                  >
                    Try On with AR
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="eyewear-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/results')}
          >
            Back to Results
          </button>
        </div>
      </div>
    </div>
  )
}

export default EyewearRecommendation

