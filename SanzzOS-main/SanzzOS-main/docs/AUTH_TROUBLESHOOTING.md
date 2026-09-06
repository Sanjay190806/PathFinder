# Auth Troubleshooting

Account mode requires the backend and PostgreSQL.

- Backend unreachable: start the backend and confirm `VITE_API_BASE_URL`.
- Database unavailable: run `npm run db:doctor`.
- Invalid DB credentials: fix `backend/.env` `DATABASE_URL`.
- Email already exists: log in instead of signing up.
- Google not configured: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`, or use email/password.

Local-only mode remains available when account services are unavailable.
