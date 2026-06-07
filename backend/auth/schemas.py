from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from core.enums import UserRole, UserStatus


class RegisterRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=180)
    contact_person: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    business_type: UserRole
    city: str
    number_of_vehicles: Optional[str] = None
    gst_number: Optional[str] = None

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value: str, info):
        if "password" in info.data and value != info.data["password"]:
            raise ValueError("Passwords do not match")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class OtpSendRequest(BaseModel):
    destination: str
    channel: str = "email"


class OtpVerifyRequest(BaseModel):
    destination: str
    otp: str = Field(min_length=4, max_length=8)
    channel: str = "email"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("confirm_password")
    @classmethod
    def reset_passwords_match(cls, value: str, info):
        if "password" in info.data and value != info.data["password"]:
            raise ValueError("Passwords do not match")
        return value


class ApproveUserRequest(BaseModel):
    status: UserStatus
    admin_note: Optional[str] = None
    send_email: bool = True


class UserPublic(BaseModel):
    id: str
    company_name: str
    contact_person: str
    email: EmailStr
    phone: str
    role: UserRole
    status: UserStatus
    city: str
    number_of_vehicles: Optional[str] = None
    gst_number: Optional[str] = None
    email_verified: bool = False
    mobile_verified: bool = False
    created_at: datetime


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


class MessageResponse(BaseModel):
    message: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
