# Company Intelligence Architecture

PathFinder maintains an authoritative, source-grounded corporate registry initially designed around 250+ enterprise companies covering Indian IT/Services, Global Tech, Semiconductor, Fintech, Healthcare, Aerospace, and Manufacturing.

## 1. Core Models
- **Company**: Stores corporate firmographics, headquarters, operating regions, website, careers URL, industry, company type (`PRODUCT`, `SERVICES`, `CONSULTING`, `STARTUP`, `SEMICONDUCTOR`), verification status, and version.
- **CompanyRole**: Connects a company to canonical careers and tracks specific employment types, experience levels, DSA relevance, and CS fundamentals expectations.

## 2. Provenance & Attribution
Every company record stores:
- `source`: Authoritative registry or employer job feed.
- `source_url`: URL of corporate careers page or official verification portal.
- `retrieved_at`: Initial observation timestamp.
- `last_verified_at`: Most recent verification timestamp.
- `verification_status`: `VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`.
- `version`: Monotonically increasing version counter for change tracking.

## 3. APIs
- `GET /api/v1/companies`: Paginated list of enterprise companies with search, industry, and country filters.
- `GET /api/v1/companies/{slug}`: Full company profile and provenance metadata.
- `GET /api/v1/companies/{slug}/roles`: Approved roles offered by the company.
