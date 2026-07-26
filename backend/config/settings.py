import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 5000))
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/hostel_gatepass")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "default_dev_jwt_secret_key_change_me")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_dev_flask_secret_key_change_me")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", 7))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def IS_DEV(self) -> bool:
        return self.ENVIRONMENT.lower() in ("development", "dev")

settings = Settings()
