import { motion } from 'framer-motion'
import './Terms.css'

const Terms = () => {
  return (
    <div className="terms">
      <div className="terms-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="terms-header"
        >
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-subtitle">Last updated: January 2024</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="terms-content"
        >
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Quick Optics AI, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Medical Disclaimer</h2>
            <p>
              <strong>Important:</strong> Quick Optics AI provides vision screening tools for informational 
              purposes only. Our service is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <ul>
              <li>Results are estimates and should not replace comprehensive eye exams</li>
              <li>Always consult with a licensed optometrist or ophthalmologist for accurate diagnosis</li>
              <li>Do not use this app for emergency eye care situations</li>
              <li>Prescription recommendations are suggestions only and require professional verification</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Use of Service</h2>
            <p>You agree to use Quick Optics AI only for lawful purposes and in accordance with these Terms:</p>
            <ul>
              <li>You must be at least 13 years old to use this service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to misuse or attempt to hack the service</li>
              <li>You will not use the service to violate any laws or regulations</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Accuracy of Information</h2>
            <p>
              While we strive to provide accurate vision testing results, we cannot guarantee 100% accuracy. 
              Factors such as lighting conditions, device quality, and user positioning may affect results.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of Quick Optics AI, including but not limited to 
              text, graphics, logos, and software, are the property of Quick Optics AI and are protected 
              by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              Quick Optics AI shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use or inability to use the service, including but 
              not limited to:
            </p>
            <ul>
              <li>Inaccurate test results</li>
              <li>Loss of data or information</li>
              <li>Device malfunctions</li>
              <li>Any decisions made based on test results</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>7. Service Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the service at any time 
              with or without notice. We are not liable for any loss or damage resulting from such changes.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites or services. We are not responsible 
              for the content, privacy policies, or practices of any third-party sites.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your access to the service immediately, without prior notice, 
              for any breach of these Terms of Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@quickoptics.ai<br />
              <strong>Support:</strong> support@quickoptics.ai
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms

