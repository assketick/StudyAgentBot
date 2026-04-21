import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_DB_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    APP_DB_PORT: int | None = None
    APP_DB_NAME: str = "study_assistant"
    POSTGRES_NON_ROOT_USER: str
    POSTGRES_NON_ROOT_PASSWORD: str

    @property
    def resolved_app_db_port(self) -> int:
        return self.APP_DB_PORT if self.APP_DB_PORT is not None else self.POSTGRES_PORT

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.POSTGRES_NON_ROOT_USER}:{self.POSTGRES_NON_ROOT_PASSWORD}"
            f"@{self.APP_DB_HOST}:{self.resolved_app_db_port}/{self.APP_DB_NAME}"
        )


settings = Settings()
