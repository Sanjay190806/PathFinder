from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ApplicationCreate(BaseModel):
    opportunity_id: str
    status: str = Field(default="saved")  # saved, applied, interviewing, offered, rejected, withdrawn
    notes: Optional[str] = Field(default="", max_length=1000)

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    prep_actions: Optional[List[Dict[str, Any]]] = None

class ApplicationOut(BaseModel):
    id: str
    profile_id: str
    opportunity_id: str
    opportunity_title: str
    company_name: str
    status: str
    target_deadline: Optional[datetime] = None
    notes: str
    prep_actions: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
