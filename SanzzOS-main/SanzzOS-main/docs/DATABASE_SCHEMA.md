# Database Schema Documentation

This document describes the Prisma schema model definitions configured inside the PostgreSQL database.

## 1. Relational Framework Models

- **User**: Represents developer accounts (id, name, email, college, goal).
- **UserSettings**: Collapsed preferences and theme choices.
- **DailyLog**: Solved lists checklists parameters, mood ratings, and notes.
- **ActivityLog**: Tracks incremental counters totals.
- **ProblemLog**: Tracks individual problem notes, mistake logs, and revisit flags.
- **Project**: Represents CareSync AI / SmartEdu AI progress metrics.
- **ResumeProfile**: ATS section weights scores checklist.
- **CareerApplication**: Job recruitment pipelines CRM records.
- **Achievement**: Earned XP levels and badges arrays.
- **AIMessage**: Relational chat threads records database backup.
- **FocusSession**: Completed focus Pomodoro sprints duration parameters.

---

## 2. Sync Backups Layer

### Model `AppSnapshot`
Stores the entire serialized Zustand store state object. This acts as a robust sync backend layer for offline first clients, ensuring data durability before relational database layers mature in production.

```prisma
model AppSnapshot {
  id        String   @id @default(uuid())
  userId    String   @unique
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
- **userId**: Maps to authenticated profiles.
- **data**: Houses raw JSON payloads representing the user's workspace progress, options, and settings state.
