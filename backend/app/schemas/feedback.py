from pydantic import ConfigDict, BaseModel
from typing import Optional

class FeedbackCreate(BaseModel):
    resource_id: str
    feedback_type: str # helpful, too_difficult, too_easy, not_relevant, outdated
    rating: int = 5 # 1-5
    comment: Optional[str] = None
    idempotency_key: Optional[str] = None

class FeedbackOut(BaseModel):
    id: str
    profile_id: str
    resource_id: str
    feedback_type: str
    rating: int
    comment: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)
