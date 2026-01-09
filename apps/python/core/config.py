import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    [설정 클래스]
    .env 파일에서 환경 변수를 읽어와 클래스 속성으로 매핑합니다.
    """
    # OpenAI 설정
    openai_api_key: str = Field(alias="OPENAI_API_KEY")
    embedding_model: str = "text-embedding-ada-002"
    
    # 모델 설정
    metadata_ai_model: str = Field(alias="METADATA_AI_MODEL", default="gpt-4o-mini")
    chat_ai_model: str = Field(alias="CHAT_AI_MODEL", default="gpt-4o-mini")
    chat_temperature: float = Field(alias="CHAT_TEMPERATURE", default=0.0)
    
    # 벡터 DB 설정
    chroma_url: str = Field(alias="CHROMA_URL", default="http://localhost:8000")
    chroma_collection_name: str = Field(alias="CHROMA_COLLECTION_NAME", default="rag_collection")
    
    # 프롬프트 설정 (외부에서 동적으로 가져오기 위함)
    metadata_system_prompt: str = Field(alias="METADATA_SYSTEM_PROMPT", default="")
    chat_system_prompt: str = Field(alias="CHAT_SYSTEM_PROMPT", default="")
    query_rewrite_system_prompt: str = Field(alias="QUERY_REWRITE_SYSTEM_PROMPT", default="")
    
    # RAG 설정
    max_context_length: int = Field(alias="MAX_CONTEXT_LENGTH", default=3000)

    # 설정 파일 경로 (.env) 위치를 지정합니다 (루트의 .env를 바라보게 설정)
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../../.env"),
        env_file_encoding='utf-8',
        extra='ignore' # .env에 더 많은 변수가 있어도 무시함
    )

# 어디서든 이 settings 객체를 불러와 설정을 사용할 수 있습니다.
settings = Settings()