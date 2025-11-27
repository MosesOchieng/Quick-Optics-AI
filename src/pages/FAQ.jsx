import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './FAQ.css'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          q: 'How do I get started with Quick Optics AI?',
          a: 'Simply click "Get Started" on the home page, create an account, and follow the guided eye scanning process. Our AI assistant will walk you through each step.'
        },
        {
          q: 'Do I need any special equipment?',
          a: 'No special equipment needed! Just your smartphone or computer with a camera. The app works with any device that has a front-facing camera.'
        },
        {
          q: 'Is the app free to use?',
          a: 'Yes, basic vision testing is free. Premium features and detailed reports are available with a subscription.'
        }
      ]
    },
    {
      title: 'Eye Testing',
      icon: '👁️',
      questions: [
        {
          q: 'How accurate is the AI vision testing?',
          a: 'Our AI has been trained on over 100,000 eye images and achieves 95% accuracy in detecting common conditions. However, this is a screening tool and should not replace professional eye exams.'
        },
        {
          q: 'What conditions can the app detect?',
          a: 'The app can screen for myopia (nearsightedness), hyperopia (farsightedness), astigmatism, color blindness, dry eye, and other common vision conditions.'
        },
        {
          q: 'How long does a test take?',
          a: 'A complete eye screening takes approximately 3-5 minutes. This includes the consultation, eye scanning, and test results.'
        },
        {
          q: 'Can I use the app if I wear glasses or contacts?',
          a: 'Yes! The app works whether you wear corrective lenses or not. Just let our AI assistant know during the consultation.'
        }
      ]
    },
    {
      title: 'Results & Reports',
      icon: '📊',
      questions: [
        {
          q: 'How do I view my test results?',
          a: 'Results are available immediately after testing. You can view them in the Results page, download as PDF, or share with your eye care professional.'
        },
        {
          q: 'Can I share my results with my doctor?',
          a: 'Yes! You can export your results as a PDF or share them via email, social media, or generate a shareable link.'
        },
        {
          q: 'How often should I take a test?',
          a: 'We recommend testing every 3-6 months for regular monitoring. You can set up reminders in the app to help you stay on track.'
        },
        {
          q: 'Are my results stored securely?',
          a: 'Yes, all data is encrypted and stored securely. We follow HIPAA-style privacy standards to protect your health information.'
        }
      ]
    },
    {
      title: 'Technical Support',
      icon: '🔧',
      questions: [
        {
          q: 'The camera is not working. What should I do?',
          a: 'Make sure you\'ve granted camera permissions in your browser settings. Try refreshing the page or using a different browser. Check that no other app is using your camera.'
        },
        {
          q: 'The app is not detecting my face. What can I do?',
          a: 'Ensure you\'re in a well-lit room, position your face directly in front of the camera, and make sure both eyes are visible. The AI assistant will guide you through proper positioning.'
        },
        {
          q: 'Can I use the app offline?',
          a: 'The app works best with an internet connection. Some features like viewing past results may work offline, but testing requires an active connection.'
        },
        {
          q: 'The voice bot is not responding. How do I fix it?',
          a: 'Check your microphone permissions and ensure your browser allows audio input. Try refreshing the page or switching between English and Swahili using the language toggle.'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: '🔒',
      questions: [
        {
          q: 'Is my data private and secure?',
          a: 'Absolutely. We use end-to-end encryption and follow strict privacy standards. Your data is never shared without your explicit permission.'
        },
        {
          q: 'Can I delete my data?',
          a: 'Yes, you can delete your account and all associated data at any time from the Settings page. This action is permanent and cannot be undone.'
        },
        {
          q: 'Do you sell my data?',
          a: 'No, we never sell your personal health information. Your data is used only to provide you with vision health insights and improve our services.'
        }
      ]
    },
    {
      title: 'For Opticians & Clinics',
      icon: '👨‍⚕️',
      questions: [
        {
          q: 'How can my clinic use Quick Optics AI?',
          a: 'Clinics can license our technology to offer AI-powered vision screening to patients. Contact us through the clinic login portal to learn more about licensing options.'
        },
        {
          q: 'What are the licensing options?',
          a: 'We offer flexible licensing plans for optometry clinics. Contact our sales team through the clinic portal for customized pricing and integration options.'
        },
        {
          q: 'Can the app integrate with our existing systems?',
          a: 'Yes, we offer API integration and can work with most EHR systems. Our team will help you integrate Quick Optics AI into your workflow.'
        }
      ]
    }
  ]

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  // Filter FAQ based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqCategories
    }

    const query = searchQuery.toLowerCase()
    return faqCategories
      .map(category => {
        const filteredQuestions = category.questions.filter(
          item => 
            item.q.toLowerCase().includes(query) || 
            item.a.toLowerCase().includes(query)
        )
        return filteredQuestions.length > 0 
          ? { ...category, questions: filteredQuestions }
          : null
      })
      .filter(Boolean)
  }, [searchQuery])

  return (
    <div className="faq-page">
      <div className="faq-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="faq-header"
        >
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Find answers to common questions about Quick Optics AI
          </p>
          
          <div className="faq-search-container">
            <input
              type="text"
              className="faq-search"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="faq-search-icon">🔍</span>
          </div>
          
          {searchQuery && (
            <p className="faq-search-results">
              Found {filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0)} result(s)
            </p>
          )}
        </motion.div>

        <div className="faq-categories">
          {filteredCategories.length === 0 ? (
            <div className="faq-no-results">
              <p>No results found for "{searchQuery}"</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="faq-category"
            >
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <h2 className="category-title">{category.title}</h2>
              </div>

              <div className="questions-list">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`
                  const isOpen = openIndex === key

                  return (
                    <div key={questionIndex} className="faq-item">
                      <button
                        className={`faq-question ${isOpen ? 'open' : ''}`}
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      >
                        <span className="question-text">{item.q}</span>
                        <span className="question-icon">{isOpen ? '−' : '+'}</span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? 'auto' : 0,
                          opacity: isOpen ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="faq-answer-wrapper"
                      >
                        <div className="faq-answer">{item.a}</div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="faq-footer"
        >
          <p className="faq-footer-text">
            Still have questions?{' '}
            <a href="/contact" className="faq-contact-link">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default FAQ


