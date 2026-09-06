# Google Sign-In Setup Guide

This document explains how to configure Google OAuth for Sanju Career OS v1.7.2+.

## Overview

Sanju Career OS supports three authentication modes:
- **Email/Password**: Traditional signup with email and password
- **Google Sign-In**: OAuth 2.0 flow with Google account
- **Local-only**: No authentication, data stored only in browser

## Prerequisites

1. A Google Cloud Project with OAuth 2.0 credentials
2. Backend server running on port 5000
3. Frontend running on port 5173 (or your configured frontend URL)

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Backend Environment Variables

Add the following to `backend/.env`:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
```

**Important:**
- Never commit `.env` files to version control
- Keep `GOOGLE_CLIENT_SECRET` secure
- Update `GOOGLE_CALLBACK_URL` for production deployments

## Step 3: Restart Backend

After updating environment variables, restart the backend:

```bash
# Stop the backend if running
# Then start again
cd backend
npm run dev
```

## Step 4: Test Google Sign-In

1. Navigate to the login page
2. Click "Continue with Google"
3. Complete the Google OAuth flow
4. Verify you are redirected back to the app and logged in

## Graceful Degradation

If Google OAuth is not configured:
- The Google Sign-In button will still appear on login/signup pages
- Clicking it will show a 501 error: "Google Sign-In is not configured"
- Email/password and local-only modes continue to work normally

## Security Notes

- Google OAuth uses Authorization Code Flow (secure, server-side token exchange)
- ID tokens are verified with Google's tokeninfo endpoint
- User email is checked for conflicts with existing email/password accounts
- No secrets are exposed to the frontend

## Troubleshooting

**Error: "Google Sign-In is not configured"**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `backend/.env`
- Restart the backend after adding environment variables

**Error: "redirect_uri_mismatch"**
- Ensure the redirect URI in Google Console matches `GOOGLE_CALLBACK_URL`
- Check for trailing slashes or protocol mismatches (http vs https)

**Error: "Backend unreachable"**
- Ensure backend is running on port 5000
- Check backend health at `http://localhost:5000/api/health`

**Error: "An account with this email already exists"**
- A user with the same email already signed up with email/password
- They should log in with their password instead
