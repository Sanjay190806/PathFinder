# Codex Rules

This repository is maintained with a few guardrails so agent work stays safe, reversible, and easy to review.

## Working Rules

- Prefer small, targeted changes over broad rewrites.
- Check the current file before editing it, especially if prior work already touched the same area.
- Use `apply_patch` for file edits.
- Do not overwrite user changes unless the user explicitly asks.
- Keep frontend secrets out of the browser bundle.
- Verify builds after substantial changes.
- If a change touches routing, storage, sync, or AI, test the happy path and the error path.

## Safety Rules

- Groq API keys must stay in `backend/.env`.
- The frontend should only consume backend status flags and friendly error messages.
- Database reset actions should require explicit user confirmation.
- When adding new navigation, keep browser history and deep links working.

## Review Expectations

- Prefer readable code over clever code.
- Keep UI state and persisted state in sync.
- Add short comments only when the behavior is not obvious.
- Include validation or runtime checks when data crosses a trust boundary.
