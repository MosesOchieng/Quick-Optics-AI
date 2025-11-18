# Vercel Deployment Setup Guide

## Environment Variables

To connect your frontend to the Render backend, you need to set the following environment variable in Vercel:

### Required Environment Variable

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variable:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Replace `https://your-render-backend-url.onrender.com` with your actual Render backend URL (without the `/api` suffix).

### Example

If your Render backend URL is `https://quick-optics-backend.onrender.com`, set:

```
VITE_API_URL=https://quick-optics-backend.onrender.com
```

The frontend will automatically append `/api` to this URL when making requests.

## After Setting Environment Variables

1. **Redeploy** your Vercel project for the changes to take effect
2. The frontend will now connect to your Render backend

## Testing the Connection

1. Open your deployed Vercel site
2. Open browser DevTools (F12)
3. Check the Console tab for any API connection errors
4. Try logging in or starting a test to verify the backend connection

## Troubleshooting

### Backend Not Connecting

- Verify the Render backend URL is correct (no trailing slash)
- Check that your Render backend is running and accessible
- Ensure CORS is enabled on your Render backend
- Check browser console for CORS or network errors

### Install Prompt Not Showing

- The install prompt should appear after 5 seconds on desktop browsers
- On iOS, it shows after 3 seconds with custom instructions
- If you've dismissed it before, clear `install_prompt_dismissed` from localStorage

### Tests Requiring Login

- Tests can now be run without authentication
- Results are saved locally if the backend is unavailable
- Login is optional but recommended for syncing results across devices

