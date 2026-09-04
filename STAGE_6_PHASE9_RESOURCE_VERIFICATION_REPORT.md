# 🛡️ Phase 9 Stage 6: Free/Paid Classification + Link Verification Engine Report

**Module**: Free / Paid Classification & Resource Trust Verification Service (Phase 9 - Stage 6)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 6 established the **Free / Paid Classification & Link Verification Engine**, delivering a dedicated Trust Layer that protects learners from misleading claims regarding course accessibility, paywalls, and dead links.

- **Defensive SSRF & URL Architecture**: Validates URL structure and scheme (`http`/`https` only) while strictly blocking local and private IP destinations (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `localhost`, `::1`).
- **Safe Bounded Redirect Handling**: Follows HTTP 3xx redirects up to a hard limit of 5 hops, verifying the safety of every intermediate destination before following.
- **Strict Pricing Taxonomy**: Operates a clear distinction between `GENUINELY_FREE` (no mandatory subscription, no hidden fees), `FREE_TO_ENROLL_PAID_CERTIFICATE` (audit/learning free, proctored exam optional and paid), `YOUTUBE_FREE_CONTENT`, `PAID`, and `SUBSCRIPTION_REQUIRED`.
- **Freshness & Stale Invalidation**: Tracks `last_verified_at` timestamps, marking records older than 48 hours as `STALE` to ensure verification status does not persist indefinitely.
- **On-Demand & Interactive Frontend Verification**: Learners and administrators can trigger live, authoritative re-verification directly from course cards in the `/resources` UI via `POST /api/v1/resources/{id}/verify`.

---

## 2. Architecture & Components

### 2.1 Verification Service
- **File**: `backend/app/resources/resource_verifier.py`
- Core Methods:
  - `is_safe_destination(url)`: Validates schemes and blocks loopback, link-local, private, and reserved subnets.
  - `verify_url(url)`: Bounded redirect inspection (max 5 hops) returning status codes, final canonical URLs, and descriptive errors.
  - `classify_price(text_or_metadata)`: Extracts price taxonomy (`price_type`, `learning_cost`, `certificate_cost`).
  - `verify_resource(resource_data)`: Runs complete audit and produces structured `ResourceVerificationResponse`.
  - `is_stale(last_verified)`: Verifies timestamp against configured TTL (default 48 hours).

### 2.2 Canonical Verification States
- `VERIFIED`: Reachable, verified hostname, confirmed pricing taxonomy.
- `PARTIALLY_VERIFIED`: Reachable link, but certificate pricing or exact cohort details pending.
- `UNAVAILABLE`: Returned HTTP 404, DNS failure, connection refused, or expired.
- `STALE`: Verification timestamp exceeds 48-hour cache window.

### 2.3 API Integration
- **File**: `backend/app/api/v1/resources.py`
- Endpoints:
  - `POST /api/v1/resources/{resource_id}/verify`: Authenticated, server-side authoritative verification updating SQLite database and returning audit evidence.

### 2.4 Frontend Trust & Discovery Dashboard
- **File**: `frontend/src/app/resources/page.tsx`
- Features:
  - Trust Badges: Visual `VERIFIED` (green), `PARTIALLY_VERIFIED` (amber), and `UNAVAILABLE` (red) indicators.
  - Price Badges: Explicitly displays `100% Genuinely Free`, `Learning Free • Cert Optional`, `Free on YouTube`, or `Subscription Required`.
  - Interactive "Verify" Button: Allows instantaneous live link checking with feedback message.
  - Indian Language selector: Quickly filters for Tamil, Hindi, Telugu, and English learning playlists.

---

## 3. Verification & Test Results

- **Targeted Test Suite**: `backend/tests/test_phase9_stage6_resource_verification.py`
  - `test_stage6_ssrf_and_protocol_protections`: Verified rejection of `localhost`, `127.0.0.1`, private IP ranges, `ftp://`, and `javascript:`.
  - `test_stage6_price_classification_integrity`: Verified accurate classification across Genuinely Free, NPTEL optional certificates, and subscriptions.
  - `test_stage6_stale_verification_expiry`: Verified stale calculation for timestamps > 48 hours.
  - `test_stage6_full_resource_audit`: Verified end-to-end audit for public vs. malicious targets.
  - `test_stage6_on_demand_verification_api`: Verified 200 response for verified resources, 404 for invalid IDs, and 401 for unauthenticated requests.
  - **Result**: **5 passed / 5 tests** (100%).

---

## 4. Limitations & Scope Boundary
- Verification respects external site terms and avoids aggressive scraping of dynamic single-page apps.
- On-demand verification runs synchronously within a strict 10-second timeout to prevent resource exhaustion.
