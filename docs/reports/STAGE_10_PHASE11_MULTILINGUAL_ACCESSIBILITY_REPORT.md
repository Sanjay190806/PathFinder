# Phase 11 — Stage 10: Multilingual Career Discovery, Localization & Accessibility Report

**Project**: PathFinder Adaptive Career Intelligence Platform  
**Stage**: Phase 11 — Stage 10  
**Status**: COMPLETE  
**Verification Date**: September 2026  

---

## 1. Executive Summary

Phase 11 Stage 10 establishes a foundational multilingual discovery and localization layer across PathFinder's global career intelligence platform. Recognizing India's linguistic diversity and global employment standards, Stage 10 empowers learners to search, discover, and inspect careers, required competencies, education paths, and personalized guidance across 12 canonical Indian and international languages.

Stage 10 enforces a strict separation between **canonical career identity** (invariant alphanumeric slugs and IDs) and **relational multilingual overlays**, guaranteeing zero duplicated records and seamless interoperability with Phase 9 education taxonomy, Phase 11 Stage 7 market signals, and Phase 11 Stage 8 priority recommendations.

---

## 2. Canonical Language Registry

The platform incorporates an authoritative 12-language catalog specifying ISO language codes, scripts, locales, and writing directions:

| Code | English Name | Native Name | Script | Locale | Direction |
|------|-------------|-------------|--------|--------|-----------|
| `en` | English | English | Latin | `en-IN` | LTR |
| `hi` | Hindi | हिंदी | Devanagari | `hi-IN` | LTR |
| `ta` | Tamil | தமிழ் | Tamil | `ta-IN` | LTR |
| `te` | Telugu | తెలుగు | Telugu | `te-IN` | LTR |
| `kn` | Kannada | ಕನ್ನಡ | Kannada | `kn-IN` | LTR |
| `ml` | Malayalam | മലയാളം | Malayalam | `ml-IN` | LTR |
| `mr` | Marathi | मराठी | Devanagari | `mr-IN` | LTR |
| `bn` | Bengali | বাংলা | Bengali | `bn-IN` | LTR |
| `gu` | Gujarati | ગુજરાતી | Gujarati | `gu-IN` | LTR |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi | `pa-IN` | LTR |
| `or` | Odia | ଓଡ଼ିଆ | Odia | `or-IN` | LTR |
| `ur` | Urdu | اردو | Arabic-Nastaliq | `ur-IN` | RTL |

---

## 3. Architecture & Data Model

### 3.1 Relational Overlay (`CareerTranslation`)
- Model: `CareerTranslation` in `backend/app/models/career.py`
- Foreign Key: `career_id -> careers.id` with `ondelete="CASCADE"`
- Unique Constraint: `(career_id, language_code)`
- Fields:
  - `title`, `short_description`, `long_description`
  - `localized_family_name`, `localized_domain_name`
  - `localized_specializations` (JSON array)
  - `search_keywords` (JSON array of native and transliterated queries)
  - `requirement_notes` & `pathway_notes` (JSON payloads)

### 3.2 Canonical Slugs & Foreign Identifiers
- Canonical IDs, database UUIDs, skill names, and ontology nodes remain strictly invariant in English/Latin script.
- Queries searching in native scripts (e.g. `डॉक्टर` for Doctor, `விமானி` for Airline Pilot, `மென்பொருள்` for Software Engineer) resolve to canonical career records.

### 3.3 Preference Persistence & Fallback Chain
- `LearnerProfile` updated with `fallback_language = Column(String(50), default="English")`.
- Dynamic Resolution Hierarchy:
  1. Requested language (if translation exists)
  2. Learner's configured fallback language (if translation exists)
  3. Default English (`en`)

---

## 4. Grounded Multilingual AI Coach Explanations

The `MultilingualCareerService` generates syntheses grounded strictly in canonical taxonomy facts:
1. **Fact Grounding**: Extracts domain, family, regulatory status, entry barrier, and market salary directly from database entities.
2. **Latin Technical Terms Preservation**: High-value technical and regulatory entities (e.g. `Python`, `SQL`, `React`, `AWS`, `Docker`, `PyTorch`, `NMC`, `DGCA`, `NEET-PG`) are strictly preserved in Latin script to protect global employability fidelity.
3. **Universal Decision Trace**: Every generated explanation is attached to an immutable `UniversalDecisionTrace` recording `trace_id`, algorithm `canonical_career_grounded_multilingual_v1`, and grounding source.

---

## 5. UI Localization & WCAG Accessibility

1. **`LanguageSelector.tsx`**:
   - Implemented with ARIA listbox role, keyboard controls (Enter/Escape/Arrow navigation), and explicit labels.
   - Dynamic document direction switching (`dir="rtl"` when Urdu `ur` is selected).
2. **Interactive Career Explorer Integration**:
   - Header Strip Language Selector.
   - Localized career title badge and description in Overview tab.
   - Dedicated "AI Coach (Multilingual)" workspace displaying grounded facts, preserved Latin technical terms, and decision trace.

---

## 6. Verification & Test Results

The Stage 10 test suite (`backend/tests/test_phase11_stage10_multilingual_career.py`) executed 8 comprehensive test cases with 100% pass rate:
- `test_supported_languages_catalog`: PASSED
- `test_canonical_id_preservation_across_languages`: PASSED
- `test_translation_fallback_order`: PASSED
- `test_multilingual_search_native_scripts`: PASSED
- `test_technical_terms_preservation_in_ai_explanation`: PASSED
- `test_ai_explanation_grounding_and_trace`: PASSED
- `test_learner_language_preference_persistence`: PASSED
- `test_career_translation_and_ai_endpoints`: PASSED

---

## 7. Next Steps: Stage 11 Hardening & Stage 12 Release
- **Stage 11**: Global QA, security audit (IDOR, auth, profile protection, prompt injection defense), and performance hardening.
- **Stage 12**: Final multi-phase regression (Phases 1-11), full documentation refresh, and official release packaging.
