# PostgreSQL Troubleshooting

Common checks:

- `missing_database_url`: add `DATABASE_URL` to `backend/.env`.
- `invalid_credentials`: PostgreSQL rejected the username or password.
- `connection_refused`: PostgreSQL is stopped or the host/port is wrong.
- `database_not_found`: create the configured database or fix the database name.

Run:

```bash
npm run db:doctor
npm run db:status
```

The doctor script prints safe host, port, user, and database only. It does not print the password.
