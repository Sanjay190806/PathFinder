# Quest Achievements Engine

Tracks 15 placement goals badges.

## Unlock Process
1. Stores modifications invoke `runAchievementEngine()`.
2. Evaluates unlocked badges checklist.
3. Appends 200 XP rewards and triggers `useUIStore.setActiveBadge()` notification overlays.
