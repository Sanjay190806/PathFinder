from pydantic import ConfigDict, BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ResourceOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    provider: str
    url: str
    resource_type: str
    difficulty: str
    estimated_hours: float
    quality_score: float
    career_relevance: List[str] = []
    format: str
    skills: List[str] = []

    # Phase 9 Stage 5 & 6 Extended Discovery & Verification Fields
    language: str = "English"
    price_type: str = "GENUINELY_FREE"
    learning_cost: float = 0.0
    certificate_cost: str = "free"
    subscription_required: bool = False
    free_learning: bool = True
    free_certificate: bool = False
    verification_status: str = "VERIFIED"
    verification_method: str = "curated_catalog"
    last_verified_at: Optional[datetime] = None
    canonical_url: Optional[str] = None
    source: str = "curated_catalog"
    source_tier: int = 1
    external_id: Optional[str] = None

    # Multi-Source Learning Intelligence Fields
    provider_id: str = "generic_provider"
    source_platform: str = "GENERIC"
    competencies: List[str] = []
    topics: List[str] = []
    retrieved_at: Optional[datetime] = None
    freshness: str = "FRESH"

    model_config = ConfigDict(from_attributes=True)

class ResourceDetailOut(ResourceOut):
    prerequisites: List[str] = []
    learner_status: Optional[str] = None
    time_spent_minutes: int = 0
    feedback_history: List[Any] = []

class ResourceDiscoveryOut(ResourceOut):
    match_score: float = 0.85
    recommendation_reasons: List[str] = []
    is_preferred_language: bool = False
    is_exact_gap_match: bool = False

class ResourceVerificationResponse(BaseModel):
    resource_id: str
    url: str
    verification_status: str  # VERIFIED, PARTIALLY_VERIFIED, UNAVAILABLE, EXPIRED
    price_classification: str
    learning_cost: float
    certificate_cost: str
    is_active: bool
    verified_at: datetime
    evidence_notes: str
