from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MechPro Experts API"
    environment: str = "development"
    frontend_url: str = "http://127.0.0.1:5173"
    jwt_secret_key: str = "change-this-secret-before-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14
    database_url: str = "postgresql://postgres:postgres@localhost:5432/mechpro_experts"
    smtp_host: str = "smtp.example.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    email_from: str = "no-reply@mechproexperts.in"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
