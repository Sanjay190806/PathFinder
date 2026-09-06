# Security (v1.7.2)

## Secrets Policy

- Real API keys belong in ignored local env files only.
- Tracked `.env.example` files use placeholders.
- Never commit `.env`, tokens, JWT secrets, database passwords, or provider keys.

## Authentication

- Email/password auth is backend-only.
- Passwords are hashed with Node `crypto.scrypt`; plaintext passwords are never stored.
- Auth tokens are HMAC-signed with `JWT_SECRET`.
- Logout clears the local auth token and returns the browser to local-only mode.

## Backup Safety

- Backup exports skip token/password/API-key storage keys.
- Restore rejects suspicious secret-like payloads.
- Cloud backup restore requires UI confirmation.
- Pre-restore local backups are saved before overwrite-style restores.

## Sync Safety

- Legacy manual DB snapshots still exist for compatibility and may use `local-user`.
- Account cloud sync uses authenticated `/api/cloud/*` routes.
- Cloud APIs scope reads and writes from the authenticated token; the frontend `userId` is not trusted.

## PWA Cache Safety

- The service worker bypasses `/api/`, `/api/auth/`, `/api/cloud/`, `/api/sync/`, and requests with `Authorization` headers.
- Static assets and the app shell can be cached.
- Authenticated API responses and auth tokens must not be cached.
