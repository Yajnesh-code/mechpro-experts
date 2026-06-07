from datetime import timedelta
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from auth.schemas import (
    ApproveUserRequest,
    AuthTokens,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    OtpSendRequest,
    OtpVerifyRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserPublic,
)
from auth.security import create_access_token, create_refresh_token, decode_token, verify_password
from core.config import settings
from core.enums import EmailEvent, UserStatus
from db.store import create_user, get_user, get_user_by_email, list_users, revoke_session, save_session, update_user
from notifications.service import frontend_url, queue_email
from middleware.auth import get_current_user, require_admin
from otp.service import send_otp, verify_otp

router = APIRouter(tags=["Authentication"])


def public_user(user: dict) -> UserPublic:
    return UserPublic(
        id=user["id"],
        company_name=user["company_name"],
        contact_person=user["contact_person"],
        email=user["email"],
        phone=user["phone"],
        role=user["role"],
        status=user["status"],
        city=user["city"],
        number_of_vehicles=user.get("number_of_vehicles"),
        gst_number=user.get("gst_number"),
        email_verified=user.get("email_verified", False),
        mobile_verified=user.get("mobile_verified", False),
        created_at=user["created_at"],
    )


def auth_response(user: dict, request: Request) -> AuthTokens:
    access_token = create_access_token(user["id"], str(user["role"]), str(user["status"]))
    refresh_token = create_refresh_token(user["id"])
    save_session(refresh_token, user["id"], request.headers.get("user-agent"), request.client.host if request.client else None)
    return AuthTokens(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=public_user(user),
    )


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    try:
        user = create_user(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    send_otp(user["email"], "email")
    queue_email(
        event=EmailEvent.REGISTRATION_SUCCESS,
        recipient=user["email"],
        subject="MechPro registration received",
        body="Your business registration has been received. Please verify your email and mobile number. Admin approval is required before dashboard access.",
        action_label="Verify Email",
        action_url=frontend_url("/auth/otp-verification"),
    )
    return public_user(user)


@router.post("/login", response_model=AuthTokens)
def login(payload: LoginRequest, request: Request):
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user["status"] in {UserStatus.REJECTED, UserStatus.SUSPENDED, UserStatus.INACTIVE}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account is {user['status']}")
    return auth_response(user, request)


@router.post("/send-otp", response_model=MessageResponse)
def send_login_otp(payload: OtpSendRequest):
    send_otp(payload.destination, payload.channel)
    return MessageResponse(message="OTP sent successfully")


@router.post("/verify-otp", response_model=MessageResponse)
def verify_login_otp(payload: OtpVerifyRequest):
    if not verify_otp(payload.destination, payload.otp, payload.channel):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    user = get_user_by_email(payload.destination) if payload.channel == "email" else None
    if user and payload.channel == "email":
        update_user(user["id"], email_verified=True, status=UserStatus.PENDING_MOBILE_VERIFICATION)
    return MessageResponse(message="OTP verified successfully")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest):
    user = get_user_by_email(payload.email)
    if user:
        reset_token = create_refresh_token(user["id"])
        queue_email(
            event=EmailEvent.PASSWORD_RESET,
            recipient=payload.email,
            subject="Reset your MechPro password",
            body="Use the secure reset link to create a new password. Ignore this email if you did not request it.",
            action_label="Reset Password",
            action_url=frontend_url(f"/auth/reset-password?token={reset_token}"),
        )
    return MessageResponse(message="If the email exists, reset instructions have been sent")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest):
    try:
        data = decode_token(payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    user = get_user(data["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    from auth.security import hash_password
    update_user(user["id"], password_hash=hash_password(payload.password))
    return MessageResponse(message="Password reset successfully")


@router.post("/refresh-token", response_model=AuthTokens)
def refresh_token(payload: RefreshTokenRequest, request: Request):
    try:
        data = decode_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    if data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user = get_user(data["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return auth_response(user, request)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshTokenRequest):
    revoke_session(payload.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.get("/verify-email", response_model=MessageResponse)
def verify_email(token: str):
    try:
        data = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    user = get_user(data["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    update_user(user["id"], email_verified=True, status=UserStatus.PENDING_MOBILE_VERIFICATION)
    return MessageResponse(message="Email verified successfully")


@router.get("/me", response_model=UserPublic)
def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@router.patch("/approve-user/{user_id}", response_model=UserPublic)
def approve_user(user_id: str, payload: ApproveUserRequest, admin: dict = Depends(require_admin)):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated = update_user(user_id, status=payload.status)
    if payload.send_email:
        queue_email(
            event=EmailEvent.ADMIN_APPROVAL,
            recipient=updated["email"],
            subject=f"MechPro account {payload.status}",
            body=f"Your MechPro Experts account status has been updated to {payload.status}. Admin note: {payload.admin_note or 'No note'}",
            action_label="Open Login",
            action_url=frontend_url("/auth/login"),
        )
    return public_user(updated)


@router.get("/users", response_model=list[UserPublic])
def users(admin: dict = Depends(require_admin)):
    return [public_user(user) for user in list_users()]
