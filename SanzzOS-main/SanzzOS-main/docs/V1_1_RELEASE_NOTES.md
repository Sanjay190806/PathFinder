# Sanju Career OS v1.1 Release Notes

## Summary

v1.1 focuses on stability, German learning, Shayla AI Mentor integration, and daily-use polish.

## Fixed

- Restored `GERMAN_LESSONS` data for the German page.
- Fixed German lesson opening with a detail drawer.
- Kept completed German lessons reopenable for review.
- Hardened German progression so locked lessons cannot be bypassed.
- Added recursive sync payload key scanning for prototype pollution protection without rejecting normal text values.
- Confirmed Settings health and AI test flows.

## Improved

- Shayla AI Mentor appears in German, Overview, Today, Roadmap, Resume, Projects, Reports, and Settings.
- Shayla chat supports custom questions, streaming, fallback responses, retry/edit flow, persisted chat, and clear chat.
- Groq remains backend-only with status and test endpoints.
- Roadmap filters now use actual roadmap topic labels.
- DSA Tracker and SkillRack labels are clearer for repeated daily use.

## Verification

Run:

```powershell
npm run build --workspace=frontend
npm run build --workspace=backend
cd backend
npx prisma validate
npx prisma generate
```

