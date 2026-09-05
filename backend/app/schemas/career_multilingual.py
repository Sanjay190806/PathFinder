"""
Phase 11 Stage 10: Multilingual Career Discovery & Accessibility Schemas
Provides validated models for supported languages, canonical translation overlays,
multilingual search representations, and grounded AI career explanations.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class LanguageMetaItem(BaseModel):
    code: str = Field(..., description="Canonical ISO 639-1 / BCP 47 code (e.g. en, hi, ta)")
    name: str = Field(..., description="English name of the language (e.g. Tamil)")
    native_name: str = Field(..., description="Endonym in native script (e.g. தமிழ்)")
    locale: str = Field(..., description="Standard regional locale identifier (e.g. ta-IN)")
    direction: str = Field("ltr", description="Text layout direction ('ltr' or 'rtl')")


class SupportedLanguagesResponse(BaseModel):
    total_languages: int
    languages: List[LanguageMetaItem]


class CareerTranslationResponse(BaseModel):
    career_slug: str
    requested_language: str
    resolved_language: str
    is_fallback: bool = False
    direction: str = "ltr"
    title: str
    description: Optional[str] = None
    family_name: Optional[str] = None
    domain_name: Optional[str] = None
    specialization_names: List[str] = Field(default_factory=list)
    search_terms: List[str] = Field(default_factory=list)
    requirement_notes: Dict[str, Any] = Field(default_factory=dict)
    pathway_notes: Dict[str, Any] = Field(default_factory=dict)


class CareerAIExplanationRequest(BaseModel):
    career_slug: str
    language: Optional[str] = None
    include_market_facts: bool = True


class CareerAIExplanationResponse(BaseModel):
    career_slug: str
    career_title: str
    language_code: str
    language_name: str
    direction: str = "ltr"
    explanation: str
    grounded_facts: List[str] = Field(default_factory=list)
    preserved_technical_terms: List[str] = Field(default_factory=list)
    is_fallback: bool = False
    decision_trace: Dict[str, Any] = Field(default_factory=dict)


class UserLanguagePreferenceRequest(BaseModel):
    preferred_language: str = Field(..., description="Primary preferred language code or name")
    fallback_language: Optional[str] = Field("English", description="Fallback language if translation is missing")


class UserLanguagePreferenceResponse(BaseModel):
    preferred_language: str
    fallback_language: str
    direction: str = "ltr"
    status: str = "SUCCESS"
    message: str = "Language preference saved successfully."
