# Authentication System

Sanju Career OS v1.7.2 supports multiple authentication modes for different use cases.

## Authentication Modes

### Email/Password
- Traditional signup with email and password
- Passwords are hashed using `crypto.scrypt` (secure, slow hash)
- JWT-like tokens signed with HMAC using `JWT_SECRET`
- Tokens stored in `localStorage` with key `sanzz_os_auth_token_v1`

### Google Sign-In
- OAuth 2.0 Authorization Code Flow
- Secure server-side token exchange
- ID token verification with Google's tokeninfo endpoint
- See [GOOGLE_AUTH.md](./GOOGLE_AUTH.md) for setup instructions

### Local-Only Mode
- No authentication required
- All data stored in browser localStorage
- No cloud sync or backup capabilities
- Default mode for users who don't sign in

## API Endpoints

### Signup
```
POST /api/auth/signup
Body: { name, email, password, timezone? }
Response: { success, user, token }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { success, user, token }
```

### Google Sign-In
```
GET /api/auth/google
Redirects to Google OAuth consent screen
```

### Google Callback
```
GET /api/auth/google/callback?code=<authorization_code>
Redirects to frontend with token: /auth/callback?token=<jwt>&isNew=<boolean>
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { success, user }
```

### Update Profile
```
PATCH /api/auth/me
Headers: Authorization: Bearer <token>
Body: { name?, timezone?, preferredMode?, onboardingCompleted? }
Response: { success, user }
```

### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success, message }
```

## Security Notes

- Passwords are never stored in plaintext
- `crypto.scrypt` is used for password hashing (memory-hard, resistant to GPU attacks)
- JWT_SECRET must be set in backend/.env (use a strong random string in production)
- Tokens are stateless and can be revoked by changing JWT_SECRET
- All protected routes require valid Authorization header
- Google OAuth secrets are never exposed to the frontend
- Service worker bypasses caching for auth/cloud/sync API routes

## Environment Variables

Required in `backend/.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secure-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"  # Optional, for Google Sign-In
GOOGLE_CLIENT_SECRET="your-google-client-secret"  # Optional, for Google Sign-In
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"  # Optional
```

## Frontend Integration

The auth state is managed by `useAuthStore` (Zustand):
- `status`: Current auth status
- `user`: Current user object (if authenticated)
- `isAuthenticated`: Boolean helper
- `login()`, `signup()`, `logout()`, `continueLocalOnly()`: Actions
- `user.provider`: Authentication provider ('email' or 'google')

## User Model

The User model includes:
- `provider`: Authentication provider ('email' or 'google')
- `providerId`: Google user ID (for Google accounts)
- `email`: User email (unique)
- `passwordHash`: Hashed password (null for Google users)
- `name`: Display name
- `avatarUrl`: Profile picture URL
- `lastLoginAt`: Timestamp of last login
