import { motion } from 'framer-motion'
import './Privacy.css'

const Privacy = () => {
  return (
    <div className="privacy">
      <div className="privacy-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="privacy-header"
        >
          <h1 className="privacy-title">Privacy & Data Policy</h1>
          <p className="privacy-subtitle">Last updated: January 2024</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="privacy-content"
        >
          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>
              Quick Optics AI collects the following information to provide vision testing services:
            </p>
            <ul>
              <li><strong>Vision Test Data:</strong> Results from your vision tests, including eye measurements and test responses</li>
              <li><strong>Face Measurements:</strong> Face shape and measurements for eyewear recommendations</li>
              <li><strong>Device Information:</strong> Camera access for vision testing (processed locally, not stored)</li>
              <li><strong>Usage Data:</strong> How you interact with the app to improve our services</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide accurate vision testing and analysis</li>
              <li>Recommend personalized eyewear options</li>
              <li>Store your test history for future reference</li>
              <li>Improve our AI algorithms and services</li>
              <li>Send you important updates about your vision health</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Data Storage & Security</h2>
            <p>
              Your data is encrypted end-to-end and stored securely on your device. We follow HIPAA-style privacy standards:
            </p>
            <ul>
              <li>All data is encrypted at rest and in transit</li>
              <li>Camera data is processed locally and never uploaded</li>
              <li>Test results are stored locally on your device</li>
              <li>No third-party sharing without your explicit consent</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your stored data at any time</li>
              <li>Export your test results and measurements</li>
              <li>Delete your account and all associated data</li>
              <li>Opt-out of data collection (with limited functionality)</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Third-Party Services</h2>
            <p>
              We may integrate with partner opticians for appointment scheduling. 
              Your data is only shared with your explicit consent when booking appointments.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Children's Privacy</h2>
            <p>
              Quick Optics AI is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@quickoptics.ai<br />
              <strong>Support:</strong> support@quickoptics.ai
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy

