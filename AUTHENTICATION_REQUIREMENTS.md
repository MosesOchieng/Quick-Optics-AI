# Authentication & API Requirements for Quick Optics AI

## Current Authentication Setup

### ✅ Already Implemented

1. **JWT Token Authentication**
   - Backend uses `jsonwebtoken` for JWT generation
   - Tokens stored in `localStorage` on frontend
   - Token expiration: 7 days
   - **Required**: `JWT_SECRET` environment variable

2. **Email Verification (Brevo/Sendinblue)**
   - Email service for verification codes
   - **Required**: `VITE_BREVO_API_KEY` environment variable
   - **Setup**: https://www.brevo.com/
   - **Cost**: Free tier available (300 emails/day)

3. **Password Hashing**
   - Uses `bcryptjs` for secure password storage
   - No external API needed

4. **OTP (One-Time Password) Login**
   - Email-based OTP system
   - Uses Brevo for sending OTP codes

## Required APIs & Services

### 🔴 Critical (Must Have)

#### 1. **Email Service API** ✅ (Currently: Brevo)
- **Service**: Brevo (formerly Sendinblue)
- **Purpose**: Send verification emails, OTP codes, password resets
- **API Key**: `VITE_BREVO_API_KEY`
- **Setup Steps**:
  1. Sign up at https://www.brevo.com/
  2. Verify your sender email address
  3. Get API key from Settings → API Keys
  4. Add to `.env` file: `VITE_BREVO_API_KEY=your_api_key_here`
- **Alternative Services**:
  - SendGrid (https://sendgrid.com/)
  - Mailgun (https://www.mailgun.com/)
  - AWS SES (https://aws.amazon.com/ses/)
  - Resend (https://resend.com/)

#### 2. **JWT Secret Key** ✅ (Currently: Environment Variable)
- **Purpose**: Sign and verify JWT tokens
- **Required**: `JWT_SECRET` in backend `.env`
- **Security**: Must be a strong, random string (min 32 characters)
- **Generate**: Use `openssl rand -base64 32` or similar
- **⚠️ Important**: Never commit this to version control!

### 🟡 Recommended (Should Have)

#### 3. **Social Authentication (OAuth)**
- **Services Needed**:
  - **Google OAuth 2.0**
    - Setup: https://console.cloud.google.com/
    - Create OAuth 2.0 credentials
    - Add redirect URIs
    - **Required**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  
  - **Facebook Login**
    - Setup: https://developers.facebook.com/
    - Create Facebook App
    - **Required**: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
  
  - **Apple Sign In** (for iOS users)
    - Setup: https://developer.apple.com/sign-in-with-apple/
    - **Required**: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

#### 4. **SMS/Phone Verification** (Alternative to Email)
- **Services**:
  - **Twilio** (https://www.twilio.com/)
    - **Required**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
    - **Cost**: ~$0.0075 per SMS
  
  - **Vonage (Nexmo)** (https://www.vonage.com/)
    - **Required**: `VONAGE_API_KEY`, `VONAGE_API_SECRET`
  
  - **AWS SNS** (https://aws.amazon.com/sns/)
    - **Required**: AWS credentials

#### 5. **Two-Factor Authentication (2FA)**
- **Services**:
  - **Google Authenticator** (TOTP - Time-based One-Time Password)
    - Library: `speakeasy` or `otplib`
    - No external API needed, uses standard TOTP algorithm
  
  - **Authy** (https://www.twilio.com/authy)
    - **Required**: `AUTHY_API_KEY`
  
  - **Duo Security** (https://duo.com/)
    - **Required**: `DUO_INTEGRATION_KEY`, `DUO_SECRET_KEY`, `DUO_API_HOSTNAME`

### 🟢 Optional (Nice to Have)

#### 6. **Biometric Authentication**
- **Web APIs** (No external service needed):
  - WebAuthn API (https://webauthn.guide/)
  - Fingerprint/Face ID on mobile devices
  - Platform authenticators (Windows Hello, Touch ID)

#### 7. **Session Management**
- **Redis** (for distributed sessions)
  - **Service**: Redis Cloud or self-hosted
  - **Required**: `REDIS_URL` or `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - **Purpose**: Store active sessions, rate limiting, token blacklisting

#### 8. **Rate Limiting & Security**
- **Services**:
  - **Cloudflare** (https://www.cloudflare.com/)
    - DDoS protection, rate limiting
    - **Required**: Cloudflare account + DNS setup
  
  - **reCAPTCHA v3** (https://www.google.com/recaptcha/)
    - **Required**: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
    - **Purpose**: Prevent bot signups/attacks

#### 9. **Identity Verification** (For Medical Compliance)
- **Services**:
  - **Jumio** (https://www.jumio.com/)
    - ID verification, face matching
    - **Required**: `JUMIO_API_TOKEN`, `JUMIO_API_SECRET`
  
  - **Onfido** (https://onfido.com/)
    - Document verification, biometric checks
    - **Required**: `ONFIDO_API_TOKEN`
  
  - **Veriff** (https://www.veriff.com/)
    - Identity verification
    - **Required**: `VERIFF_API_KEY`

#### 10. **Audit Logging**
- **Services**:
  - **Sentry** (https://sentry.io/)
    - Error tracking, security events
    - **Required**: `SENTRY_DSN`
  
  - **LogRocket** (https://logrocket.com/)
    - Session replay, error tracking
    - **Required**: `LOGROCKET_APP_ID`

## Environment Variables Checklist

### Backend (.env)
```bash
# Required
JWT_SECRET=your_strong_random_secret_here_min_32_chars
PORT=5000

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key

# Database (if using external)
DATABASE_URL=your_database_url

# Optional - Social Auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Optional - SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Optional - Security
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Optional - Redis
REDIS_URL=your_redis_url
```

### Frontend (.env)
```bash
# API URL
VITE_API_URL=https://your-backend-url.com

# Email Service
VITE_BREVO_API_KEY=your_brevo_api_key

# Optional - Social Auth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# Optional - reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Optional - Sentry
VITE_SENTRY_DSN=your_sentry_dsn
```

## Implementation Priority

### Phase 1: Essential (Current)
- ✅ JWT Authentication
- ✅ Email Verification (Brevo)
- ✅ Password Hashing

### Phase 2: Enhanced Security
1. Add reCAPTCHA v3 to signup/login forms
2. Implement rate limiting (Redis or middleware)
3. Add session management
4. Implement 2FA (TOTP)

### Phase 3: User Experience
1. Add Google OAuth
2. Add Facebook Login
3. Add SMS verification (Twilio)
4. Add "Remember Me" functionality

### Phase 4: Medical Compliance
1. Add identity verification (Jumio/Onfido)
2. Add audit logging (Sentry)
3. Add HIPAA-compliant logging

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Brevo | 300 emails/day | $25/month (20k emails) |
| Twilio | - | $0.0075/SMS |
| Google OAuth | Free | Free |
| Facebook Login | Free | Free |
| reCAPTCHA | Free | Free |
| Redis Cloud | 30MB | $5/month (100MB) |
| Sentry | 5k events/month | $26/month (50k events) |
| Jumio | - | $1-3 per verification |

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.env` files (add to `.gitignore`)
   - Use environment variables in production

2. **Use HTTPS everywhere**
   - Required for OAuth callbacks
   - Required for secure token transmission

3. **Implement rate limiting**
   - Prevent brute force attacks
   - Limit API requests per IP

4. **Token Security**
   - Use short expiration times
   - Implement refresh tokens
   - Store tokens securely (httpOnly cookies for web)

5. **Password Requirements**
   - Minimum 8 characters
   - Require uppercase, lowercase, numbers
   - Consider password strength meter

6. **Email Verification**
   - Require email verification before full access
   - Send welcome emails after verification

## Next Steps

1. **Set up Brevo API key** (if not already done)
   - Sign up: https://www.brevo.com/
   - Get API key
   - Add to environment variables

2. **Generate strong JWT_SECRET**
   ```bash
   openssl rand -base64 32
   ```

3. **Set up OAuth (Optional)**
   - Choose providers (Google, Facebook, Apple)
   - Create developer accounts
   - Configure OAuth apps
   - Add credentials to environment

4. **Add reCAPTCHA** (Recommended)
   - Sign up: https://www.google.com/recaptcha/
   - Get site key and secret
   - Add to signup/login forms

5. **Implement rate limiting**
   - Add middleware to backend
   - Use Redis or in-memory store

## Support & Documentation

- **Brevo API Docs**: https://developers.brevo.com/
- **JWT Best Practices**: https://jwt.io/introduction
- **OAuth 2.0 Guide**: https://oauth.net/2/
- **WebAuthn Guide**: https://webauthn.guide/

