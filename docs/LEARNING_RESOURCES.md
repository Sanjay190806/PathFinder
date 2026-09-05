# Learning Resources Intelligence Architecture

PathFinder catalogs, normalizes, and verifies multi-format learning resources including structured courses, curated YouTube lecture series, and practical problem sets.

## 1. Resource Categories
- **Genuinely Free Courses**: 100% free learning without paywalls (MIT OpenCourseWare, freeCodeCamp, Microsoft Learn).
- **Free to Enroll (Audit) Courses**: Free learning content with optional paid certifications (NPTEL, Swayam, Coursera Audit).
- **Paid Courses & Bootcamps**: Purchase-required or subscription-based offerings (Coursera Plus, Udemy).
- **Curated YouTube Educational Series**: High-yield lecture series and playlists from verified educators (Striver, Abdul Bari, NeetCode, CS50).
- **Practice Problems**: Curated LeetCode, GeeksforGeeks, and HackerRank problems classified into Easy, Medium, and Hard tiers mapped to DSA concepts.

## 2. Resource APIs
- `GET /api/v1/resources/courses`: Filter courses by carrier, role, difficulty, price type, and verification status.
- `GET /api/v1/resources/pricing-categories`: Summary of pricing breakdown.
- `GET /api/v1/resources/by-dsa/{topic_slug}`: Course resources mapped to a DSA topic.
- `GET /api/v1/resources/youtube/by-topic/{topic_slug}`: Curated YouTube playlists.
- `GET /api/v1/resources/practice/by-topic/{topic_slug}`: Practice problems partitioned across Easy, Medium, and Hard tiers.
