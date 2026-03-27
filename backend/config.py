from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "http://localhost:8001/auth/google/callback"
    postgres_url: str
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7   # 7 days
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
