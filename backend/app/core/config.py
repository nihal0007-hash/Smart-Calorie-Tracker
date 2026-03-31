from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",  # Assumes running from the directory where .env is (usually backend root)
        env_file_encoding="utf-8",
        extra="ignore"
    )
    MONGODB_URI: str = "mongodb://localhost:27017/calorie_tracker"
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    GOOGLE_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
