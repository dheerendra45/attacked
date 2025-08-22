from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    database_url: str = Field(default=os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/attacked"))
    redis_url: str = Field(default=os.getenv("REDIS_URL", "redis://localhost:6379/0"))
    minio_endpoint: str = Field(default=os.getenv("MINIO_ENDPOINT", "localhost:9000"))
    minio_access_key: str = Field(default=os.getenv("MINIO_ACCESS_KEY", "minioadmin"))
    minio_secret_key: str = Field(default=os.getenv("MINIO_SECRET_KEY", "minioadmin"))
    minio_bucket: str = Field(default=os.getenv("MINIO_BUCKET", "attacked-artifacts"))

    seed: int = Field(default=int(os.getenv("SEED", "42")))

    use_vendor_prosody: bool = Field(default=os.getenv("USE_VENDOR_PROSODY", "false").lower() == "true")
    use_vendor_asr: bool = Field(default=os.getenv("USE_VENDOR_ASR", "false").lower() == "true")

    hume_api_key: str | None = Field(default=os.getenv("HUME_API_KEY"))
    deepgram_api_key: str | None = Field(default=os.getenv("DEEPGRAM_API_KEY"))
    assemblyai_api_key: str | None = Field(default=os.getenv("ASSEMBLYAI_API_KEY"))

    config_path: str = Field(default=os.getenv("CONFIG_PATH", "/app/configs/default.yml"))

settings = Settings()
