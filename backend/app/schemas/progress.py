from pydantic import ConfigDict, BaseModel
from typing import Optional

class ProgressUpdate(BaseModel):
    resource_id: str
    status: str # not_started, in_progress, completed, skipped
    time_spent_minutes: Optional[int] = None
    completion_percentage: Optional[float] = None

class ProgressOut(BaseModel):
    id: str
    profile_id: str
    resource_id: str
    status: str
    time_spent_minutes: int
    completion_percentage: float

    model_config = ConfigDict(from_attributes=True)
