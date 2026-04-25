from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="allow")

    APP_DB_HOST: str = "localhost"
    APP_DB_PORT: int = 5432
    APP_DB_NAME: str = "study_assistant"
    POSTGRES_NON_ROOT_USER: str
    POSTGRES_NON_ROOT_PASSWORD: str

    BOT_TOKEN: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_SECONDS: int = 60 * 60 * 24 * 30  # 30 days

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_NON_ROOT_USER}:{self.POSTGRES_NON_ROOT_PASSWORD}"
            f"@{self.APP_DB_HOST}:{self.APP_DB_PORT}/{self.APP_DB_NAME}"
        )


settings = Settings()
