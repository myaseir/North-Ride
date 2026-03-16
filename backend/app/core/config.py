from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from datetime import datetime, timezone

class Settings(BaseSettings):
    # 1. App Metadata
    PROJECT_NAME: str = "Glacia Labs"
    VERSION: str = "1.2.0"
    API_V1_STR: str = "/api" 
    
    # 2. Cloudinary (Drivers Document Storage)
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # 3. Security & JWT
    SECRET_KEY: str = Field(default="your-super-secret-key-change-in-production")
    ADMIN_SECRET_KEY: str = Field(default="your-admin-secret-key") 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 Week

    # 4. Database (MongoDB)
    MONGO_URL: str = Field(default="mongodb://localhost:27017")
    DATABASE_NAME: str = "glacia_go"

    # 5. Redis (Upstash)
    # We use the REST URL and TOKEN for the upstash-redis async client
    UPSTASH_REDIS_REST_URL: str = Field(default="")
    UPSTASH_REDIS_REST_TOKEN: str = Field(default="")
    # Optional: Keep for local fallback if needed
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # 6. Email (Brevo)
    BREVO_API_KEY: str
    SENDER_EMAIL: str
    SENDER_NAME: str = "Glacia Go"
    MAIL_SERVER: str = "smtp-relay.sendinblue.com"
    MAIL_PORT: int = 587

    # 7. Versioning & App Support
    MIN_REQUIRED_MOBILE_VERSION: str = "1.0.0"
    LATEST_MOBILE_VERSION: str = "1.2.0"
    MOBILE_DOWNLOAD_URL: str = "https://glacialabs.com/download"

    # 8. Utility Helpers
    def get_current_time(self):
        """Standardized UTC time for the review queue."""
        return datetime.now(timezone.utc)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()