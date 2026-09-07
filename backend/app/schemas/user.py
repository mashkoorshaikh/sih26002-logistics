from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="Valid corporate or personal email")
    password: str = Field(..., min_length=8, max_length=72, description="Password (8-72 characters)")
    organization: str | None = Field(None, max_length=150, description="Organization name")

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password must not exceed 72 characters (bcrypt limit)")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    organization: str | None
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
