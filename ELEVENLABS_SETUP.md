# ElevenLabs API Setup Guide

## Overview
Quick Optics AI uses ElevenLabs for high-quality text-to-speech with multilingual support (English and Swahili). If the API key is not configured, the app will automatically fall back to the browser's built-in TTS.

## Setting Up ElevenLabs API Key

### 1. Get Your API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Navigate to your profile/settings
4. Copy your API key

### 2. Local Development
Create a `.env` file in the root directory:
```bash
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Production Deployment (Vercel)
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Key**: `VITE_ELEVENLABS_API_KEY`
   - **Value**: Your ElevenLabs API key
4. **Redeploy** your project

### 4. Other Platforms
Set the environment variable `VITE_ELEVENLABS_API_KEY` with your API key value.

## Fallback Behavior
If the API key is not set or invalid:
- The app will automatically use the browser's built-in TTS
- Language detection still works (English/Swahili)
- The app will attempt to use Kenyan/Swahili voices when available
- No functionality is lost, just different voice quality

## Troubleshooting

### 401 Unauthorized Error
- **Cause**: Invalid or expired API key
- **Solution**: 
  1. Verify your API key is correct
  2. Check if your ElevenLabs account is active
  3. Ensure the environment variable is set correctly
  4. Restart your dev server after adding the key

### Rate Limit Exceeded (429)
- **Cause**: Too many requests to ElevenLabs API
- **Solution**: The app automatically falls back to browser TTS when rate limited

### API Key Not Working
- Check that the variable name is exactly `VITE_ELEVENLABS_API_KEY`
- Ensure there are no extra spaces or quotes
- Restart the development server after adding the key
- Clear browser cache if issues persist

## Current Voice Configuration
- **English Voice**: Rachel (21m00Tcm4TlvDq8ikWAM)
- **Swahili Voice**: Same voice with multilingual model
- **Model**: `eleven_multilingual_v2` (supports both languages)

