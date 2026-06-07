from datetime import datetime, timezone
from uuid import uuid4
from core.enums import UserRole, UserStatus
from auth.security import hash_password

_users: dict[str, dict] = {}
_sessions: dict[str, dict] = {}
_otps: dict[str, dict] = {}
_email_logs: list[dict] = []


def seed_admin() -> None:
    if any(user["role"] == UserRole.ADMIN for user in _users.values()):
        return
    user_id = str(uuid4())
    _users[user_id] = {
        "id": user_id,
        "company_name": "MechPro Experts HQ",
        "contact_person": "Admin User",
        "email": "admin@mechproexperts.in",
        "phone": "+91 90000 00000",
        "password_hash": hash_password("admin12345"),
        "role": UserRole.ADMIN,
        "status": UserStatus.APPROVED,
        "city": "Mumbai",
        "number_of_vehicles": None,
        "gst_number": None,
        "email_verified": True,
        "mobile_verified": True,
        "created_at": datetime.now(timezone.utc),
    }


def create_user(data: dict) -> dict:
    if get_user_by_email(data["email"]):
        raise ValueError("A user with this email already exists")
    user_id = str(uuid4())
    user = {
        "id": user_id,
        "company_name": data["company_name"],
        "contact_person": data["contact_person"],
        "email": data["email"],
        "phone": data["phone"],
        "password_hash": hash_password(data["password"]),
        "role": data["business_type"],
        "status": UserStatus.PENDING_EMAIL_VERIFICATION,
        "city": data["city"],
        "number_of_vehicles": data.get("number_of_vehicles"),
        "gst_number": data.get("gst_number"),
        "email_verified": False,
        "mobile_verified": False,
        "created_at": datetime.now(timezone.utc),
    }
    _users[user_id] = user
    return user


def get_user(user_id: str) -> dict | None:
    return _users.get(user_id)


def get_user_by_email(email: str) -> dict | None:
    email_lower = email.lower()
    return next((user for user in _users.values() if user["email"].lower() == email_lower), None)


def list_users() -> list[dict]:
    return list(_users.values())


def update_user(user_id: str, **updates) -> dict:
    if user_id not in _users:
        raise ValueError("User not found")
    _users[user_id].update(updates)
    return _users[user_id]


def save_session(token: str, user_id: str, user_agent: str | None = None, ip_address: str | None = None) -> None:
    _sessions[token] = {
        "token": token,
        "user_id": user_id,
        "user_agent": user_agent,
        "ip_address": ip_address,
        "created_at": datetime.now(timezone.utc),
        "revoked": False,
    }


def revoke_session(token: str) -> None:
    if token in _sessions:
        _sessions[token]["revoked"] = True


def save_otp(key: str, otp: str, channel: str) -> None:
    _otps[key] = {"otp": otp, "channel": channel, "created_at": datetime.now(timezone.utc), "attempts": 0}


def verify_otp(key: str, otp: str) -> bool:
    record = _otps.get(key)
    if not record:
        return False
    record["attempts"] += 1
    return record["otp"] == otp


def save_email_log(event: str, recipient: str, subject: str, status: str = "queued") -> None:
    _email_logs.append({"event": event, "recipient": recipient, "subject": subject, "status": status, "created_at": datetime.now(timezone.utc)})
