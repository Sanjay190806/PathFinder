# Database Configuration & Schema

Sanju Career OS uses PostgreSQL for cloud backups.

## Schema Highlights

### AppSnapshot Table
Stores JSON backup configurations of a user's entire state.
- `userId` (String, Primary Key)
- `data` (Json, Zustand state map)
- `updatedAt` (DateTime)

## Setup Commands
- **Generate Client**: `npm run prisma:generate`
- **Apply migrations**: `npm run prisma:migrate`
- **Open Studio browser**: `npm run prisma:studio`
- **Seed database**: `npm run prisma:seed`
