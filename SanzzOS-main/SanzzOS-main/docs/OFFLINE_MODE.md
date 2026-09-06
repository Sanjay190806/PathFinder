# Offline Mode (v1.6.4)

## Behavior

- `/offline` route shows a friendly offline page.
- Service worker caches app shell assets after successful fetch.
- `/api/*` requests are **never** cached by the service worker.
- Navigation requests fall back to `/offline` or cached `index.html`.

## Requirements

1. Production build served over HTTP(S).
2. At least one successful online load to populate cache.
3. PWA enabled (`VITE_ENABLE_PWA` defaults to true).

## Limitations

- AI, backend health, and database snapshot sync require network.
- First visit while offline may not load JS bundles.
- Offline queue holds pending DB snapshot operations until reconnect.

## Verify

1. Build and serve production frontend.
2. Load app online.
3. Disable network.
4. Reload — expect offline page or cached shell.
