import random
from db.store import save_otp, verify_otp as store_verify_otp
from notifications.service import queue_email
from core.enums import EmailEvent


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def send_otp(destination: str, channel: str = "email") -> str:
    otp = generate_otp()
    save_otp(f"{channel}:{destination}", otp, channel)
    if channel == "email":
        queue_email(
            event=EmailEvent.OTP_VERIFICATION,
            recipient=destination,
            subject="Your MechPro verification OTP",
            body=f"Your verification OTP is {otp}. It expires shortly. If this was not you, contact MechPro support.",
        )
    return otp


def verify_otp(destination: str, otp: str, channel: str = "email") -> bool:
    return store_verify_otp(f"{channel}:{destination}", otp)
