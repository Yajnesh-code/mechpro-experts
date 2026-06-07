from fastapi import Depends, Header, HTTPException, status
from auth.security import decode_token
from db.store import get_user
from core.enums import UserRole, UserStatus


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.replace("Bearer ", "", 1)
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user = get_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_approved_user(user: dict = Depends(get_current_user)) -> dict:
    if user["status"] != UserStatus.APPROVED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not approved")
    return user


def require_admin(user: dict = Depends(require_approved_user)) -> dict:
    if user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
