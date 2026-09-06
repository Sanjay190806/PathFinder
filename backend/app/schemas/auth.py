from pydantic import ConfigDict, BaseModel, EmailStr, field_validator
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not v or len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(v) > 128:
            raise ValueError("Password must not exceed 128 characters.")
        if v.isspace():
            raise ValueError("Password cannot consist solely of whitespace.")
        if v.strip() != v:
            raise ValueError("Password must not contain leading or trailing whitespace.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Full name cannot be empty.")
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    is_demo: bool

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
