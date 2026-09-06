# Database Setup - v1.7.2

Use PostgreSQL only for account login and cloud sync features. Local-only mode does not require a database.

1. Start PostgreSQL from Windows Services.
2. Check port:

```bat
netstat -ano | findstr :5432
```

3. Test login:

```bash
psql -h localhost -p 5432 -U postgres
```

4. Create the database if needed.
5. Put a real `DATABASE_URL` only in `backend/.env`.
6. Validate the schema from `backend/` or via the root script:

```bash
npm run prisma:validate
```

7. Generate Prisma only after stopping the backend:

```bash
npm run prisma:generate
```

8. Check migration status only after credentials are valid:

```bash
npm run db:status
```

Do not force migrations if credentials are invalid. Do not run `prisma migrate reset` for daily use. Do not commit `backend/.env`.
