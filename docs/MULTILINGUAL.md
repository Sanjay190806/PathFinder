# Multilingual Career Discovery, Localization & Accessibility
**Phase 11 Stage 10 Architecture Specification**

---

## 1. Overview
PathFinder supports multilingual career exploration across 12 canonical Indian and international languages. The design couples relational language overlays with language-neutral canonical career records, preserving algorithmic fidelity while delivering native user experiences.

---

## 2. 12 Canonical Languages Registry
- English (`en`), Hindi (`hi`), Tamil (`ta`), Telugu (`te`), Kannada (`kn`), Malayalam (`ml`), Marathi (`mr`), Bengali (`bn`), Gujarati (`gu`), Punjabi (`pa`), Odia (`or`), Urdu (`ur` — RTL).

---

## 3. Relational Overlay & Technical Term Preservation
- Model: `CareerTranslation` (`career_id`, `language_code`, `title`, `short_description`, `search_keywords`).
- **Latin Technical Terms Preservation**: Core programming languages, tools, frameworks, and regulatory authorities (`Python`, `SQL`, `AWS`, `Docker`, `PyTorch`, `NMC`, `DGCA`) remain strictly preserved in standard Latin script.
- **Decision Trace Grounding**: All multilingual AI explanations are grounded in verified database attributes and accompanied by a `UniversalDecisionTrace`.
