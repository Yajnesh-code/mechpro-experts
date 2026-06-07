from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    CORPORATE = "corporate"
    BROKER = "broker"
    FLEET = "fleet"
    INSURANCE = "insurance"
    WORKSHOP = "workshop"


class UserStatus(str, Enum):
    PENDING_EMAIL_VERIFICATION = "pending_email_verification"
    PENDING_MOBILE_VERIFICATION = "pending_mobile_verification"
    PENDING_ADMIN_APPROVAL = "pending_admin_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class OtpChannel(str, Enum):
    EMAIL = "email"
    MOBILE = "mobile"


class EmailEvent(str, Enum):
    REGISTRATION_SUCCESS = "registration_success"
    EMAIL_VERIFICATION = "email_verification"
    ADMIN_APPROVAL = "admin_approval"
    PASSWORD_RESET = "password_reset"
    OTP_VERIFICATION = "otp_verification"
    SUSPICIOUS_LOGIN = "suspicious_login"
