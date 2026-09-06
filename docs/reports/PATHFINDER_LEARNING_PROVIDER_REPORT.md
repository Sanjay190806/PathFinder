# PathFinder Multi-Source Learning Provider Report

## 1. Provider Tier Breakdown & Inventory

PathFinder integrates 12 distinct learning providers across 4 structured authority tiers. Every provider adapter provides normalized metadata, verification rules, and direct enrollment routing.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PathFinder Provider Tiers                         │
├───────────────┬──────────────────────┬─────────────┬───────────────────┤
│ Tier 1 (Govt) │ Tier 2 (Tech)        │ Tier 3 (MOOC│ Tier 4 (Video)    │
├───────────────┼──────────────────────┼─────────────┼───────────────────┤
│ iGOT Karmayogi│ Microsoft Learn      │ Coursera    │ YouTube Curated   │
│ NPTEL (IITs)  │ Google Cloud Boost   │ edX         │ Practice Series   │
│ SWAYAM        │ AWS Skill Builder    │ Udemy       │                   │
│               │ Cisco NetAcad        │             │                   │
│               │ IBM SkillsBuild      │             │                   │
└───────────────┴──────────────────────┴─────────────┴───────────────────┘
```

---

## 2. Provider Specifications & Trust Weights

| Provider ID | Provider Name | Tier | Official Domain(s) | Trust Weight | Primary Curriculum Focus |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `igot_karmayogi` | iGOT Karmayogi | 1 | `igotkarmayogi.gov.in`, `portal.igotkarmayogi.gov.in` | **1.30** | Public Governance, Civil Services, Policy Formulation |
| `nptel` | NPTEL | 1 | `nptel.ac.in`, `archive.nptel.ac.in` | **1.25** | University Engineering, Advanced Computer Science, Mathematics |
| `swayam` | SWAYAM | 1 | `swayam.gov.in` | **1.25** | University UG/PG Curricula, National Higher Education |
| `microsoft_learn` | Microsoft Learn | 2 | `learn.microsoft.com` | **1.20** | Azure Cloud, Azure AI, Developer Fundamentals |
| `google_cloud` | Google Cloud Skills | 2 | `cloudskillsboost.google`, `developers.google.com` | **1.20** | Cloud Architecture, Machine Learning, TensorFlow |
| `aws_skill_builder` | AWS Skill Builder | 2 | `aws.amazon.com`, `skillbuilder.aws` | **1.20** | AWS Cloud Practitioner, Solutions Architect |
| `cisco_networking_academy`| Cisco Networking Academy | 2 | `netacad.com`, `skillsforall.com` | **1.20** | TCP/IP Networking, Cybersecurity, Packet Tracer Labs |
| `ibm_skillsbuild` | IBM SkillsBuild | 2 | `skillsbuild.org`, `ibm.com` | **1.20** | Data Science, Python, AI Ethics, Enterprise IT |
| `coursera` | Coursera | 3 | `coursera.org` | **1.15** | Specializations, Professional Certificates, University MOOCs |
| `edx` | edX | 3 | `edx.org` | **1.15** | MicroMasters, Executive Education, Academic MOOCs |
| `udemy` | Udemy | 3 | `udemy.com` | **1.10** | Practical Coding Bootcamps, Framework Deep Dives |
| `youtube` | YouTube Educational Series | 4 | `youtube.com`, `youtu.be` | **1.05** | Curated Coding Walkthroughs, Algorithm Visualizations |

---

## 3. Operational Integrity & Verification

1. **Adapter Registry**: Managed via `ProviderRegistry` (`backend/app/providers/registry.py`) providing dynamic dispatch, tier querying, and domain enforcement.
2. **REST Endpoints**:
   - `GET /api/v1/resources/providers`: Returns supported providers and tier hierarchy.
   - `GET /api/v1/resources/diagnostics`: Returns system-wide provider distributions, tier breakdowns, and live health telemetry.
