from core.config import settings
from db.store import save_email_log


def render_email(title: str, body: str, action_label: str | None = None, action_url: str | None = None) -> str:
    button = ""
    if action_label and action_url:
        button = f'<a href="{action_url}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#EC4899);color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">{action_label}</a>'
    return f"""
    <div style="margin:0;background:#f8f7ff;padding:28px;font-family:Arial,sans-serif;color:#0f0f1a">
      <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e8e4f4;border-radius:22px;padding:28px;box-shadow:0 18px 50px rgba(124,58,237,.12)">
        <div style="font-size:26px;font-weight:900;background:linear-gradient(135deg,#7C3AED,#EC4899);-webkit-background-clip:text;color:#7C3AED">ME</div>
        <p style="margin:4px 0 24px;color:#64748b;font-size:12px;letter-spacing:2px;text-transform:uppercase">MechPro Experts</p>
        <h1 style="font-size:24px;margin:0 0 12px">{title}</h1>
        <p style="font-size:15px;line-height:1.7;color:#475569">{body}</p>
        <div style="margin-top:24px">{button}</div>
        <p style="margin-top:28px;color:#94a3b8;font-size:12px">This is an automated MechPro Experts notification.</p>
      </div>
    </div>
    """


def queue_email(event: str, recipient: str, subject: str, body: str, action_label: str | None = None, action_url: str | None = None) -> dict:
    html = render_email(subject, body, action_label, action_url)
    save_email_log(event=event, recipient=recipient, subject=subject, status="queued")
    # SMTP/Resend integration will be attached here in deployment config.
    return {"recipient": recipient, "subject": subject, "html": html, "status": "queued"}


def frontend_url(path: str) -> str:
    return f"{settings.frontend_url.rstrip('/')}/{path.lstrip('/')}"
