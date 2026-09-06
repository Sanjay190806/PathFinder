# PWA

The service worker caches static assets and app shell files only.

It bypasses:

- `/api/`
- `/api/auth/`
- `/api/cloud/`
- `/api/sync/`
- Any request with an `Authorization` header.

This prevents authenticated API responses and tokens from being stored in Cache Storage.
