# Dynamic Intelligence & Scheduled Updates Architecture

PathFinder maintains freshness across companies, roles, courses, pricing, and videos through a versioned, observable dynamic update engine.

## 1. Centralized Freshness Policy
- **States**: `FRESH`, `RECENT`, `STALE`, `EXPIRED`, `UNKNOWN`.
- **Domain TTLs**:
  - `COMPANY_PROFILE`: 7d fresh, 30d recent, 90d stale.
  - `COMPANY_ROLE_REQUIREMENTS`: 3d fresh, 7d recent, 21d stale.
  - `COURSE_PRICING_AVAILABILITY`: 1d fresh, 3d recent, 7d stale.
  - `YOUTUBE_METADATA`: 7d fresh, 14d recent, 45d stale.
  - `PRACTICE_PROBLEMS`: 14d fresh, 30d recent, 90d stale.
  - `MARKET_SIGNALS`: 7d fresh, 14d recent, 45d stale.

## 2. Invalidation & Data Change Events
- `DataChangeEvent`: Tracks entity mutations (`COMPANY`, `COMPANY_ROLE`, `LEARNING_RESOURCE`), recording `old_value`, `new_value`, `source`, `version`, and status (`DISCOVERED`, `VALIDATING`, `APPLIED`, `VERIFICATION_REQUIRED`).
- `CacheInvalidator`: Implements fine-grained tag eviction (e.g. `resource:{slug}`, `recommendations:global`, `company_role:{comp}:{role}`) when pricing flips or requirements change.

## 3. Scheduler & Observability
- `PathFinderScheduler`: Background thread running configurable intervals (Daily, Weekly, Monthly).
- `DynamicJobRecord`: Persists execution logs with examined, updated, rejected, failures, latency, and status.
- Admin API: `POST /api/v1/dynamic-intelligence/refresh` allows manual trigger with force options.
