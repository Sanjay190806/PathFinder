# Phase 12 — Stage 8 Engineering Report: YouTube Learning & Practice Intelligence

## Executive Summary
Stage 8 of Phase 12 expands PathFinder's educational resource catalog with curated, verified YouTube educational series and structured Easy $\rightarrow$ Medium $\rightarrow$ Hard coding practice problem sets.

The system incorporates YouTube as an accessible, high-yield educational media format without treating it as an unvetted free-for-all. It strictly avoids web scraping, relies on official YouTube Data API endpoints where configured, degrades gracefully to verified educational channels (take U forward / Striver, Abdul Bari, NeetCode, freeCodeCamp, Harvard CS50) when API keys are absent, enforces rate limits with TTL caching, and maps algorithmic problem sets to verified coding platforms (LeetCode, GeeksforGeeks).

---

## 1. Architectural Implementation

### A. YouTube & Practice Service
- **File**: [`backend/app/resources/youtube_practice_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/resources/youtube_practice_service.py)
- **Class**: `YouTubePracticeService`
  - **Zero Scraping Policy**: Integrates with the official YouTube Data API v3 when `YOUTUBE_API_KEY` is configured in the environment; otherwise gracefully falls back to curated institutional & expert series.
  - **Curated Series Catalog**: Features verified series (Striver's A2Z DSA Sheet, Abdul Bari's Algorithms, NeetCode 150, William Fiset's Data Structures, and CS50).
  - **Structured Problem Sets**: Maps canonical DSA topics to verified LeetCode/GFG problems with pattern classifications (e.g. "Hash Map Complement", "Sorting + Two Pointers", "Grid BFS", "2D String DP") and video walkthrough links.
  - **Caching**: Employs an in-memory TTL cache to preserve external API quotas and guarantee sub-millisecond response times.

### B. API Endpoints
- **File**: [`backend/app/api/v1/resources.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/api/v1/resources.py)
  - `GET /api/v1/resources/youtube/by-topic/{topic_slug}`: Retrieves YouTube playlists and videos covering a DSA topic.
  - `GET /api/v1/resources/practice/by-topic/{topic_slug}`: Retrieves Easy, Medium, and Hard practice problem sets.

### C. Frontend Components
- **Files**:
  - [`frontend/src/components/resources/YouTubeResourceCard.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/resources/YouTubeResourceCard.tsx): Displays YouTube video courses and playlists with channel branding, difficulty, and direct playback links.
  - [`frontend/src/components/dsa/PracticeProblemList.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/dsa/PracticeProblemList.tsx): Interactive practice problem list filterable by Easy, Medium, Hard with pattern tags and solution links.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage8_youtube_practice.py`
- **Result**: **7 passed out of 7 tests (100%) in 0.09s**.
- **Coverage**:
  - `test_youtube_curated_series_discovery`: Verified DP playlists by Striver and Abdul Bari.
  - `test_youtube_graceful_degradation_without_api_key`: Verified clean operation without API key.
  - `test_practice_problems_easy_medium_hard`: Verified Easy, Medium, Hard coverage for Graphs.
  - `test_practice_problem_difficulty_filter`: Verified filtering by difficulty.
  - `test_practice_synthetic_fallback`: Verified standard practice guidance for unindexed topics.
  - `test_api_youtube_by_topic`: HTTP 200 returning YouTube playlist list.
  - `test_api_practice_by_topic`: HTTP 200 returning Easy problems with Two Sum.
