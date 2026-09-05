"""
Phase 11 Stage 10: Multilingual Career Discovery, Localization & Accessibility Service
Manages supported languages, translation overlays, multilingual search,
and grounded AI career explanations preserving technical identifiers.
"""

from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from datetime import datetime, timezone

from backend.app.models.career import Career, CareerTranslation, CareerRequirement, CareerPathwayDefinition, CareerMarketSignal
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.career_multilingual import (
    LanguageMetaItem,
    SupportedLanguagesResponse,
    CareerTranslationResponse,
    CareerAIExplanationResponse,
    UserLanguagePreferenceResponse
)
from backend.app.seed.career_translations_seed import (
    SUPPORTED_LANGUAGES_REGISTRY,
    CAREER_TRANSLATIONS_SEED
)
from backend.app.engine.explainer import UniversalDecisionTrace, DecisionFactor, DecisionEvidence
from backend.app.ai.groq_provider import GroqProvider
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.ai.provider import GroundedContext
from backend.app.core.config import settings


class MultilingualCareerService:
    """
    Central service for multilingual career discovery, translation overlays,
    canonical search resolution, and grounded multilingual explanations.
    """

    TECHNICAL_TERMS_WHITELIST = {
        "Python", "SQL", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "PyTorch", "TensorFlow",
        "Pandas", "Scikit-Learn", "Git", "SystemVerilog", "Verilog", "Figma",
        "Adobe Photoshop", "Adobe Illustrator", "Premiere Pro", "After Effects",
        "Blender", "Maya", "Unreal Engine", "NEET", "NEET-UG", "MBBS", "NMC",
        "DGCA", "CPL", "B.Tech", "M.Tech", "BCA", "MCA", "B.Des", "BFA",
        "ICAI", "CA", "DSA", "MLOps", "LLM", "NLP", "API", "REST", "CI/CD"
    }

    def __init__(self, db: Session):
        self.db = db

    @classmethod
    def normalize_language_code(cls, lang_input: Optional[str]) -> Optional[str]:
        """
        Normalizes any language string/locale/code to canonical ISO code.
        Returns None if unrecognized to allow fallback resolution.
        """
        if not lang_input:
            return None

        cleaned = lang_input.strip().lower().replace("_", "-")
        # Direct code match
        if cleaned in SUPPORTED_LANGUAGES_REGISTRY:
            return cleaned

        # Strip regional suffix: 'ta-in' -> 'ta'
        base = cleaned.split("-")[0]
        if base in SUPPORTED_LANGUAGES_REGISTRY:
            return base

        # Name mapping
        name_map = {
            "english": "en",
            "hindi": "hi",
            "tamil": "ta",
            "telugu": "te",
            "kannada": "kn",
            "malayalam": "ml",
            "marathi": "mr",
            "bengali": "bn",
            "gujarati": "gu",
            "punjabi": "pa",
            "odia": "or",
            "oriya": "or",
            "urdu": "ur"
        }
        return name_map.get(cleaned, None)

    def get_supported_languages(self) -> SupportedLanguagesResponse:
        """Returns the canonical catalog of all 12 supported languages."""
        items = [
            LanguageMetaItem(**meta)
            for meta in SUPPORTED_LANGUAGES_REGISTRY.values()
        ]
        return SupportedLanguagesResponse(
            total_languages=len(items),
            languages=items
        )

    def get_career_translation(
        self,
        career_slug: str,
        language: Optional[str] = None,
        fallback_language: str = "en"
    ) -> CareerTranslationResponse:
        """
        Retrieves localized career content with strict fallback order:
        requested_language -> fallback_language -> canonical English.
        Never returns null/missing; always resolves to a valid representation.
        """
        career = self.db.query(Career).filter(Career.slug == career_slug).first()
        if not career:
            raise ValueError(f"Career '{career_slug}' does not exist.")

        req_code = self.normalize_language_code(language)
        fallback_code = self.normalize_language_code(fallback_language) or "en"

        # Determine target to attempt: if req_code is unsupported/None, immediately try fallback
        target_to_try = req_code if req_code else fallback_code
        is_fallback = (req_code is None or req_code != target_to_try)

        # 1. Attempt requested/target language in DB
        trans = self.db.query(CareerTranslation).filter(
            CareerTranslation.career_id == career.id,
            CareerTranslation.language_code == target_to_try
        ).first()

        resolved_code = target_to_try

        # 2. If not found, attempt fallback language
        if not trans and target_to_try != fallback_code:
            trans = self.db.query(CareerTranslation).filter(
                CareerTranslation.career_id == career.id,
                CareerTranslation.language_code == fallback_code
            ).first()
            if trans:
                resolved_code = fallback_code
                is_fallback = True

        # 3. If still not found, attempt English translation overlay
        if not trans and resolved_code != "en":
            trans = self.db.query(CareerTranslation).filter(
                CareerTranslation.career_id == career.id,
                CareerTranslation.language_code == "en"
            ).first()
            if trans:
                resolved_code = "en"
                is_fallback = True

        # 4. If translation record exists in DB
        if trans:
            direction = SUPPORTED_LANGUAGES_REGISTRY.get(resolved_code, {}).get("direction", "ltr")
            return CareerTranslationResponse(
                career_slug=career.slug,
                requested_language=req_code or "en",
                resolved_language=resolved_code,
                is_fallback=is_fallback,
                direction=direction,
                title=trans.title,
                description=trans.description or career.short_description,
                family_name=trans.family_name or (career.family.name if career.family else None),
                domain_name=trans.domain_name or (career.domain.name if career.domain else None),
                specialization_names=trans.specialization_names or [],
                search_terms=trans.search_terms or [],
                requirement_notes=trans.requirement_notes or {},
                pathway_notes=trans.pathway_notes or {}
            )

        # 5. Check in-memory seed catalog if DB migration hasn't populated yet
        seed_career = CAREER_TRANSLATIONS_SEED.get(career_slug, {})
        seed_data = seed_career.get(target_to_try)
        if not seed_data and target_to_try != fallback_code:
            seed_data = seed_career.get(fallback_code)
            if seed_data:
                resolved_code = fallback_code
                is_fallback = True
        if not seed_data and resolved_code != "en":
            seed_data = seed_career.get("en")
            if seed_data:
                resolved_code = "en"
                is_fallback = True

        if seed_data:
            direction = SUPPORTED_LANGUAGES_REGISTRY.get(resolved_code, {}).get("direction", "ltr")
            return CareerTranslationResponse(
                career_slug=career.slug,
                requested_language=req_code or "en",
                resolved_language=resolved_code,
                is_fallback=is_fallback,
                direction=direction,
                title=seed_data.get("title", career.display_name),
                description=seed_data.get("description", career.short_description),
                family_name=seed_data.get("family_name", career.family.name if career.family else None),
                domain_name=seed_data.get("domain_name", career.domain.name if career.domain else None),
                specialization_names=[s.name for s in career.specializations],
                search_terms=seed_data.get("search_terms", []),
                requirement_notes=seed_data.get("requirement_notes", {}),
                pathway_notes=seed_data.get("pathway_notes", {})
            )

        # 6. Complete safe fallback to canonical English record
        direction = "rtl" if resolved_code == "ur" else "ltr"
        return CareerTranslationResponse(
            career_slug=career.slug,
            requested_language=req_code or "en",
            resolved_language="en",
            is_fallback=True,
            direction=direction,
            title=career.display_name,
            description=career.short_description,
            family_name=career.family.name if career.family else None,
            domain_name=career.domain.name if career.domain else None,
            specialization_names=[s.name for s in career.specializations],
            search_terms=[],
            requirement_notes={},
            pathway_notes={}
        )

    def search_careers_multilingual(
        self,
        query: str,
        language: Optional[str] = None,
        limit: int = 20
    ) -> List[Career]:
        """
        Multilingual career search: matches queries in native scripts
        (Tamil, Hindi, Telugu, Urdu, Bengali, etc.) and aliases,
        mapping back strictly to canonical Career entities.
        """
        if not query or not query.strip():
            return []

        q = query.strip()
        q_lower = q.lower()
        lang_code = self.normalize_language_code(language) if language else None

        # 1. Search in CareerTranslation title and search_terms (robust in-memory match)
        matched_career_ids = set()
        all_translations = self.db.query(CareerTranslation).all()
        for t in all_translations:
            if lang_code and t.language_code != lang_code:
                continue
            if t.title and (q_lower in t.title.lower() or t.title.lower() in q_lower):
                matched_career_ids.add(t.career_id)
            elif t.search_terms:
                for term in t.search_terms:
                    term_str = str(term).lower()
                    if q_lower in term_str or term_str in q_lower:
                        matched_career_ids.add(t.career_id)
                        break

        # Also check in-memory seed catalog if needed
        for slug, seed_dict in CAREER_TRANSLATIONS_SEED.items():
            for l_code, s_data in seed_dict.items():
                if lang_code and l_code != lang_code:
                    continue
                if q_lower in s_data.get("title", "").lower():
                    c_obj = self.db.query(Career).filter(Career.slug == slug).first()
                    if c_obj:
                        matched_career_ids.add(c_obj.id)
                elif any(q_lower in str(st).lower() for st in s_data.get("search_terms", [])):
                    c_obj = self.db.query(Career).filter(Career.slug == slug).first()
                    if c_obj:
                        matched_career_ids.add(c_obj.id)

        # 2. Search in canonical Career table (name, slug)
        canonical_matches = self.db.query(Career).filter(
            or_(
                Career.display_name.ilike(f"%{q}%"),
                Career.slug.ilike(f"%{q}%"),
                Career.canonical_name.ilike(f"%{q}%")
            )
        ).limit(limit).all()

        combined_careers: Dict[str, Career] = {}
        for c in canonical_matches:
            combined_careers[c.id] = c

        if matched_career_ids:
            trans_careers = self.db.query(Career).filter(Career.id.in_(list(matched_career_ids))).all()
            for tc in trans_careers:
                if tc.id not in combined_careers:
                    combined_careers[tc.id] = tc

        return list(combined_careers.values())[:limit]

    def generate_ai_career_explanation(
        self,
        career_slug: str,
        language: Optional[str] = None,
        profile_id: Optional[str] = None
    ) -> CareerAIExplanationResponse:
        """
        Generates an authoritative, grounded multilingual career explanation.
        Adheres to strict non-hallucination rules:
        - Rooted in structured database facts (requirements, salary, pathways).
        - Technical identifiers (Python, SQL, React, etc.) strictly preserved in Latin script.
        - Produces UniversalDecisionTrace for explainability.
        """
        career = self.db.query(Career).filter(Career.slug == career_slug).first()
        if not career:
            raise ValueError(f"Career '{career_slug}' not found.")

        target_lang = self.normalize_language_code(language) or "en"
        lang_meta = SUPPORTED_LANGUAGES_REGISTRY.get(target_lang, SUPPORTED_LANGUAGES_REGISTRY["en"])
        direction = lang_meta.get("direction", "ltr")
        lang_name = lang_meta.get("name", "English")

        # Retrieve translation overlay
        translation = self.get_career_translation(career_slug, language=target_lang)

        # Retrieve structured facts from DB
        reqs = self.db.query(CareerRequirement).filter(CareerRequirement.career_id == career.id).all()
        mandatory_skills = [r.requirement_name for r in reqs if r.requirement_type == "SKILL" and r.mandatory]
        recommended_skills = [r.requirement_name for r in reqs if r.requirement_type == "SKILL" and not r.mandatory]
        education_reqs = [r.requirement_name for r in reqs if r.requirement_type == "EDUCATION"]

        statutory_blocks = []
        for r in reqs:
            if r.category == "REGULATORY" or (r.source and any(body in r.source for body in ["NMC", "DGCA", "ICAI", "BCI"])):
                statutory_blocks.append(f"{r.source or 'Statutory Authority'}: {r.requirement_name}")

        if not statutory_blocks and career.is_regulated:
            if career.regulatory_requirement:
                statutory_blocks.append(career.regulatory_requirement)
            else:
                statutory_blocks.append("Statutory Licensure and Examination Authority")

        if career.slug == "commercial-airline-pilot" and not any("CPL" in b for b in statutory_blocks):
            statutory_blocks.append("Directorate General of Civil Aviation (DGCA): Class 1 Medical & Commercial Pilot License (CPL)")
        elif career.slug == "doctor" and not any("NEET" in b for b in statutory_blocks):
            statutory_blocks.append("National Medical Commission (NMC): MBBS Degree & NEET-UG")

        # Salary signal from Stage 7
        salary_signal = self.db.query(CareerMarketSignal).filter(
            CareerMarketSignal.career_id == career.id,
            CareerMarketSignal.signal_type == "SALARY_RANGE",
            CareerMarketSignal.experience_level == "MID"
        ).first()

        salary_text = f"₹{salary_signal.min_value/100000:.1f}L - ₹{salary_signal.max_value/100000:.1f}L INR per annum" if salary_signal and salary_signal.min_value else "Market salary based on verified industry benchmarks"

        # Grounded facts list
        grounded_facts = [
            f"Role: {career.display_name}",
            f"Domain: {career.domain.name if career.domain else 'General'}",
            f"Essential skills: {', '.join(mandatory_skills[:4]) if mandatory_skills else 'Core skills'}",
            f"Mid-level benchmark: {salary_text}"
        ]
        if statutory_blocks:
            grounded_facts.append(f"Regulatory Authority: {statutory_blocks[0]}")

        # Detect preserved technical terms
        preserved_terms: List[str] = []
        for word in list(mandatory_skills) + list(recommended_skills) + list(career.tools or []):
            if word in self.TECHNICAL_TERMS_WHITELIST or any(t.lower() == word.lower() for t in self.TECHNICAL_TERMS_WHITELIST):
                if word not in preserved_terms:
                    preserved_terms.append(word)

        # Localized explanation synthesis
        explanation = self._synthesize_localized_text(
            career=career,
            translation=translation,
            target_lang=target_lang,
            lang_name=lang_name,
            mandatory_skills=mandatory_skills,
            recommended_skills=recommended_skills,
            salary_text=salary_text,
            statutory_blocks=statutory_blocks
        )

        # Decision trace
        trace = UniversalDecisionTrace(
            decision_type="multilingual_career_explanation",
            profile_id=profile_id or "anonymous",
            target_role=career.slug,
            final_score=1.0,
            decision="EXPLAINED",
            rationale=f"Generated grounded career explanation in {lang_name} ({target_lang}) preserving technical terminology.",
            factors=[
                DecisionFactor(name="translation_availability", weight=0.3, raw_score=1.0 if not translation.is_fallback else 0.7, contribution=0.3, reason=f"Resolved via {translation.resolved_language}"),
                DecisionFactor(name="fact_grounding", weight=0.4, raw_score=1.0, contribution=0.4, reason=f"Anchored in {len(grounded_facts)} authoritative database facts"),
                DecisionFactor(name="technical_term_preservation", weight=0.3, raw_score=1.0, contribution=0.3, reason=f"Preserved {len(preserved_terms)} technical tokens in Latin script")
            ],
            evidence=[
                DecisionEvidence(evidence_type="GROUNDED_DATA", description=f, source="Canonical Career Knowledge Graph", timestamp=datetime.now(timezone.utc).isoformat())
                for f in grounded_facts[:3]
            ],
            affected_skills=mandatory_skills[:4],
            recommended_action=f"Explore localized pathways and requirements for {translation.title}"
        )

        return CareerAIExplanationResponse(
            career_slug=career.slug,
            career_title=career.display_name,
            language_code=target_lang,
            language_name=lang_name,
            direction=direction,
            explanation=explanation,
            grounded_facts=grounded_facts,
            preserved_technical_terms=preserved_terms,
            is_fallback=translation.is_fallback,
            decision_trace=trace.model_dump()
        )

    def _synthesize_localized_text(
        self,
        career: Career,
        translation: CareerTranslationResponse,
        target_lang: str,
        lang_name: str,
        mandatory_skills: List[str],
        recommended_skills: List[str],
        salary_text: str,
        statutory_blocks: List[str]
    ) -> str:
        """
        Synthesizes high-fidelity localized explanation text.
        Guarantees that technical keywords remain in English Latin script.
        """
        req_str = ", ".join(mandatory_skills[:3]) if mandatory_skills else "Core Domain Competencies"
        all_recs = list(career.tools or []) + list(recommended_skills or [])
        rec_str = ", ".join(all_recs[:3]) if all_recs else "Industry Tools"

        reg_info = "; ".join(statutory_blocks) if statutory_blocks else (career.regulatory_requirement or "")
        reg_clause_en = f" Entry is strictly regulated under {reg_info}." if reg_info else ""

        if target_lang == "ta":
            reg_clause = f" இந்த தொழிற்துறை {reg_info} மூலம் முறைப்படுத்தப்பட்டுள்ளது." if reg_info else ""
            return (
                f"**{translation.title}** என்பது {translation.domain_name} துறையில் உள்ள ஒரு முக்கிய தொழில் வாய்ப்பாகும். "
                f"{translation.description} "
                f"இதற்குத் தேவையான முதன்மைக் கருவிகள் மற்றும் திறன்கள்: **{req_str}** மற்றும் பரிந்துரைக்கப்படும் **{rec_str}**. "
                f"இத்துறைக்கான சந்தை வருமான வரம்பு: **{salary_text}**.{reg_clause} "
                f"PathFinder பாடத்திட்டம் வழியாக நீங்கள் படிப்படியாக தேவையான சான்றிதழ்களையும் நேரடித் திட்ட அனுபவங்களையும் பெறலாம்."
            )
        elif target_lang == "hi":
            reg_clause = f" यह पेशा {reg_info} द्वारा विनियमित है।" if reg_info else ""
            return (
                f"**{translation.title}** {translation.domain_name} के क्षेत्र में एक महत्वपूर्ण और मांग वाला करियर है। "
                f"{translation.description} "
                f"इसके लिए आवश्यक अनिवार्य तकनीकी कौशल: **{req_str}** तथा अनुशंसित कौशल: **{rec_str}** हैं। "
                f"वर्तमान बाजार में मध्यम स्तर का वेतनमान: **{salary_text}** है।{reg_clause} "
                f"PathFinder के अनुकूलित मार्ग से आप आवश्यक दक्षताओं को समयबद्ध तरीके से सीख सकते हैं।"
            )
        elif target_lang == "te":
            reg_clause = f" ఈ వృత్తి {reg_info} ద్వారా నియంత్రించబడుతుంది." if reg_info else ""
            return (
                f"**{translation.title}** అనేది {translation.domain_name} విభాగంలో అత్యుత్తమ కెరీర్ అవకాశం. "
                f"{translation.description} "
                f"దీనికి అవసరమైన ముఖ్య నైపుణ్యాలు: **{req_str}** మరియు **{rec_str}**. "
                f"మార్కెట్ వేతన శ్రేణి: **{salary_text}**.{reg_clause} "
                f"PathFinder ద్వారా మీరు తగిన నైపుణ్యాలను ప్రాక్టీస్ చేయవచ్చు."
            )
        elif target_lang == "kn":
            return (
                f"**{translation.title}** {translation.domain_name} ವಲಯದಲ್ಲಿ ಉತ್ತಮ ವೃತ್ತಿಜೀವನದ ಅವಕಾಶವಾಗಿದೆ. "
                f"{translation.description} "
                f"ಅಗತ್ಯವಿರುವ ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳು: **{req_str}** ಮತ್ತು **{rec_str}**. "
                f"ಮಾರುಕಟ್ಟೆ ವೇತನ: **{salary_text}**."
            )
        elif target_lang == "ml":
            return (
                f"**{translation.title}** {translation.domain_name} മേഖലയിലെ മികച്ചൊരു കരിയർ പാതയാണ്. "
                f"{translation.description} "
                f"ആവശ്യമായ സാങ്കേതിക കഴിവുകൾ: **{req_str}**, **{rec_str}**. "
                f"വിപണിയിലെ ശമ്പള സൂചിക: **{salary_text}**."
            )
        elif target_lang == "mr":
            return (
                f"**{translation.title}** हे {translation.domain_name} क्षेत्रातील एक प्रगतिशील करिअर आहे. "
                f"{translation.description} "
                f"यासाठी आवश्यक तांत्रिक कौशल्ये: **{req_str}** आणि **{rec_str}**. "
                f"सरासरी वेतनमान: **{salary_text}**."
            )
        elif target_lang == "bn":
            return (
                f"**{translation.title}** হল {translation.domain_name} ক্ষেত্রের একটি প্রতিশ্রুতিশীল পেশা। "
                f"{translation.description} "
                f"প্রয়োজনীয় কারিগরি দক্ষতা: **{req_str}** এবং **{rec_str}**। "
                f"বর্তমান বাজার বেতন: **{salary_text}**।"
            )
        elif target_lang == "gu":
            return (
                f"**{translation.title}** એ {translation.domain_name} ક્ષેત્રમાં ઉત્કૃષ્ટ કારકિર્દી છે. "
                f"{translation.description} "
                f"જરૂરી ટેકનિકલ કૌશલ્યો: **{req_str}** અને **{rec_str}**. "
                f"બજાર વેતન શ્રેણી: **{salary_text}**."
            )
        elif target_lang == "pa":
            return (
                f"**{translation.title}** {translation.domain_name} ਖੇਤਰ ਵਿੱਚ ਇੱਕ ਪ੍ਰਮੁੱਖ ਕੈਰੀਅਰ ਹੈ। "
                f"{translation.description} "
                f"ਲੋੜੀਂਦੇ ਤਕਨੀਕੀ ਹੁਨਰ: **{req_str}** ਅਤੇ **{rec_str}**। "
                f"ਮਾਰਕੀਟ ਤਨਖਾਹ: **{salary_text}**।"
            )
        elif target_lang == "or":
            return (
                f"**{translation.title}** ହେଉଛି {translation.domain_name} କ୍ଷେତ୍ରର ଏକ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ କ୍ୟାରିଅର୍। "
                f"{translation.description} "
                f"ଆବଶ୍ୟକ କୌଶଳ: **{req_str}** ଏବଂ **{rec_str}**। "
                f"ବଜାର ବେତନ: **{salary_text}**।"
            )
        elif target_lang == "ur":
            reg_clause = f" یہ شعبہ {reg_info} کے تحت باضابطہ ہے۔" if reg_info else ""
            return (
                f"**{translation.title}** {translation.domain_name} کے شعبے میں ایک شاندار کیریئر ہے۔ "
                f"{translation.description} "
                f"اس کے لیے درکار بنیادی مہارتیں: **{req_str}** اور **{rec_str}**۔ "
                f"مارکیٹ تنخواہ کا تخمینہ: **{salary_text}**۔{reg_clause} "
                f"PathFinder کے ذریعے آپ ان مہارتوں کو منظم طریقے سے حاصل کر سکتے ہیں۔"
            )
        else:
            # English default
            return (
                f"**{translation.title}** is a core role within {translation.domain_name}. "
                f"{translation.description} "
                f"Essential technical competencies include **{req_str}**, supported by **{rec_str}**. "
                f"Verified market benchmark compensation is **{salary_text}**.{reg_clause_en} "
                f"PathFinder equips you with step-by-step verified learning pathways and assessments to build validated portfolio evidence."
            )

    def update_learner_language_preference(
        self,
        profile: LearnerProfile,
        preferred_language: str,
        fallback_language: Optional[str] = "English"
    ) -> UserLanguagePreferenceResponse:
        """
        Updates user's language preferences securely without disrupting
        learner progress, assessments, or saved goals.
        """
        pref_code = self.normalize_language_code(preferred_language)
        fall_code = self.normalize_language_code(fallback_language or "English")

        profile.preferred_language = pref_code
        if hasattr(profile, "fallback_language"):
            profile.fallback_language = fall_code

        self.db.commit()
        self.db.refresh(profile)

        lang_meta = SUPPORTED_LANGUAGES_REGISTRY.get(pref_code, SUPPORTED_LANGUAGES_REGISTRY["en"])

        return UserLanguagePreferenceResponse(
            preferred_language=pref_code,
            fallback_language=fall_code,
            direction=lang_meta.get("direction", "ltr"),
            status="SUCCESS",
            message=f"Language preference successfully updated to {lang_meta.get('name', 'English')}."
        )
