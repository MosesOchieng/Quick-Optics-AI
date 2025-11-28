/**
 * Brevo (formerly Sendinblue) Email Service Integration
 * Used for sending verification emails
 */

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Check if Brevo is configured
export const isBrevoConfigured = () => {
  return !!BREVO_API_KEY && BREVO_API_KEY.length > 0
}

/**
 * Send verification email via Brevo
 * @param {string} to - Recipient email address
 * @param {string} code - Verification code
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} - Response from Brevo API
 */
export const sendVerificationEmail = async (to, code, name = 'User') => {
  if (!isBrevoConfigured()) {
    console.warn('Brevo API key not configured. Email will not be sent.')
    // In development, log the code instead
    if (import.meta.env.DEV) {
      console.log(`[DEV] Verification code for ${to}: ${code}`)
      return { success: true, dev: true, code }
    }
    throw new Error('Email service not configured')
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Quick Optics AI',
          email: 'noreply@quickoptics.ai' // Update with your verified sender email
        },
        to: [
          {
            email: to,
            name: name
          }
        ],
        subject: 'Verify Your Quick Optics AI Account',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://quickoptics.ai/Logo.jpeg" alt="Quick Optics AI" style="max-width: 150px; height: auto;">
              <h1 style="color: #667eea; margin-top: 20px;">Quick Optics AI</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1a202c; margin-top: 0;">Verify Your Email Address</h2>
              <p>Hello ${name},</p>
              <p>Thank you for signing up for Quick Optics AI! To complete your registration, please verify your email address using the code below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="margin-bottom: 0;">Enter this code in the verification page to activate your account.</p>
              <p style="color: #718096; font-size: 14px; margin-top: 10px;">This code will expire in 10 minutes.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #718096; font-size: 12px; margin: 0;">
                If you didn't create an account with Quick Optics AI, please ignore this email.
              </p>
              <p style="color: #718096; font-size: 12px; margin-top: 10px;">
                © 2024 Quick Optics AI. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Quick Optics AI - Verify Your Account
          
          Hello ${name},
          
          Thank you for signing up for Quick Optics AI! To complete your registration, please verify your email address using the code below:
          
          Verification Code: ${code}
          
          Enter this code in the verification page to activate your account.
          This code will expire in 10 minutes.
          
          If you didn't create an account with Quick Optics AI, please ignore this email.
          
          © 2024 Quick Optics AI. All rights reserved.
        `
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Brevo API error:', errorData)
      throw new Error(errorData.message || 'Failed to send verification email')
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('Error sending verification email via Brevo:', error)
    throw error
  }
}

/**
 * Send clinic registration confirmation email
 * @param {string} to - Recipient email address
 * @param {string} clinicName - Clinic name
 * @param {string} code - Verification code
 * @returns {Promise<Object>} - Response from Brevo API
 */
export const sendClinicVerificationEmail = async (to, clinicName, code) => {
  if (!isBrevoConfigured()) {
    console.warn('Brevo API key not configured. Email will not be sent.')
    if (import.meta.env.DEV) {
      console.log(`[DEV] Clinic verification code for ${to} (${clinicName}): ${code}`)
      return { success: true, dev: true, code }
    }
    throw new Error('Email service not configured')
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Quick Optics AI',
          email: 'noreply@quickoptics.ai'
        },
        to: [
          {
            email: to,
            name: clinicName
          }
        ],
        subject: 'Verify Your Quick Optics AI Clinic Account',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Clinic Account</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://quickoptics.ai/Logo.jpeg" alt="Quick Optics AI" style="max-width: 150px; height: auto;">
              <h1 style="color: #667eea; margin-top: 20px;">Quick Optics AI</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1a202c; margin-top: 0;">Verify Your Clinic Account</h2>
              <p>Hello ${clinicName},</p>
              <p>Thank you for registering your clinic with Quick Optics AI! To complete your registration and access the clinic dashboard, please verify your email address using the code below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="margin-bottom: 0;">Enter this code in the verification page to activate your clinic account.</p>
              <p style="color: #718096; font-size: 14px; margin-top: 10px;">This code will expire in 10 minutes.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #718096; font-size: 12px; margin: 0;">
                If you didn't register a clinic account with Quick Optics AI, please ignore this email.
              </p>
              <p style="color: #718096; font-size: 12px; margin-top: 10px;">
                © 2024 Quick Optics AI. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || 'Failed to send verification email')
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('Error sending clinic verification email via Brevo:', error)
    throw error
  }
}

export default {
  sendVerificationEmail,
  sendClinicVerificationEmail,
  isBrevoConfigured
}

