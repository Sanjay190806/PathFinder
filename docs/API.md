# PathFinder REST API Reference (v1)

Base URL: `http://localhost:8000/api/v1`

All authenticated endpoints require an `Authorization: Bearer <token>` header obtained via `/auth/token` or `/demo/login`.

---

## 1. Authentication & Demo Access

### `POST /auth/register`
- Registers a new user account.
- **Request Body**: `{"email": "user@example.com", "password": "password123", "full_name": "Learner Name"}`
- **Response**: `{"id": "...", "email": "...", "full_name": "..."}`

### `POST /auth/token`
- OAuth2 password grant token endpoint.
- **Request (Form Data)**: `username=user@example.com&password=password123`
- **Response**: `{"access_token": "...", "token_type": "bearer"}`

### `POST /demo/login`
- Instant demo login returning an authorized JWT token for the pre-seeded learner `alex@pathfinder.demo`.
- **Response**: `{"access_token": "...", "token_type": "bearer"}`

---

## 2. Learner Profile & Education Taxonomy

### `GET /profile`
- Retrieves the current learner's profile, including education details, skill confidence map, and preferences.

### `PUT /profile`
- Updates learner education stage, stream, specialization, target role, and weekly hours.

### `GET /education/stages`
- Returns all supported Indian education stages (Classes 1–8, 9–10, 11–12, Polytechnic/ITI, Undergraduate, Postgraduate).

### `GET /education/streams?stage={stage}`
- Returns eligible streams and subject domains for the specified education stage.

### `GET /education/specializations?stage={stage}&stream={stream}`
- Returns specific specializations and subject combinations.

---

## 3. Career Discovery & Pathway Intelligence

### `GET /careers/discover`
- Authenticated discovery endpoint returning all careers scored against the learner's background.
- **Query Params**: `q` (optional domain search query)
- **Response**: List of `CareerFitScore` objects with `overall_score`, `fit_tier`, `reasoning`, and `pathway_summary`.

### `GET /careers/{career_slug}/discovery-fit`
- Returns detailed multi-factor fit breakdown for a single career.

### `GET /careers/{career_slug}/requirements`
- Public endpoint returning mandatory and recommended skills, accepted education levels, and catalog pathways.

### `GET /careers/{career_slug}/pathways`
- Returns all mapped direct and alternative pathways with structured milestones.

### `GET /careers/{career_slug}/fit`
- Evaluates personalized eligibility (`DIRECT_ELIGIBLE`, `BRIDGE_RECOMMENDED`, etc.) and active pathway for the authenticated user.

### `GET /careers/{career_slug}/gaps`
- Returns structured skill gap analysis distinguishing missing mandatory vs recommended competencies.

### `GET /careers/{career_slug}/next-step`
- Computes the highest-priority next actionable skill milestone.

---

## 4. Market Intelligence

### `GET /market/overview`
- Returns aggregate market trends across Indian tech hubs (Bengaluru, Hyderabad, Pune, NCR, Chennai).

### `GET /market/{career_slug}`
- Returns localized salary ranges (P10, P50, P90), demand velocity, hiring companies, and freshness decay timestamps.

---

## 5. Learning Resources & Verification

### `GET /resources/discover`
- Discovers learning resources with faceted filtering:
  - `skill_slug`: Target skill filter
  - `price_filter`: `GENUINELY_FREE`, `FREE_TO_ENROLL`, `PAID`
  - `language`: Resource language (English, Hindi, Tamil, Telugu)
  - `tier`: 1 (Gov/Institutions), 2 (Tech Providers), 3 (EdTech), 4 (YouTube)

### `POST /resources/verify-url`
- Inspects a target URL for SSRF security and reachability.

---

## 6. Adaptive Learning Planner

### `POST /planner/generate`
- Generates or updates an adaptive weekly plan based on the learner's active pathway, weekly hours, and difficulty tolerance.

### `GET /planner/current`
- Retrieves the active weekly schedule and milestone completion status.

### `POST /planner/items/{item_id}/complete`
- Marks a learning task complete and recalculates adaptive progression metrics.

---

## 7. AI Career & Learning Coach

### `POST /ai/chat`
- Interactive conversational AI coach.
- **Request Body**: `{"message": "What should I learn next?", "language": "Hindi"}`
- **Features**: PromptGuard injection defenses, freshness classification, Groq LLM integration with deterministic fallback.

---

## 8. Career Opportunities

### `GET /opportunities/discover`
- Discovers internships, hackathons, and jobs.
- **Query Params**: `type` (INTERNSHIP, HACKATHON, JOB), `location`, `remote` (bool), `limit` (max 100), `offset`.

### `GET /opportunities/{opportunity_id}/match`
- Computes match percentage and eligibility check for the authenticated learner.

---

## 9. Preparation & Interview Intelligence

### `POST /preparation/mock-interview/sessions`
- Initializes a new mock interview session (`BEHAVIORAL` or `TECHNICAL`).

### `GET /preparation/mock-interview/sessions/{session_id}`
- Retrieves session details and questions. Enforces strict IDOR protection (returns 403 on non-owner access).

### `POST /preparation/mock-interview/sessions/{session_id}/turns`
- Submits an answer turn for evaluation.
- Evaluated against 4-part rubric (Technical Correctness, Communication Clarity, Completeness, Depth).
