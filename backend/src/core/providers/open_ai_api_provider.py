from core.ai_provider import AIProvider
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI


class OpenAIApiProvider(AIProvider):
    def __init__(self, base_url: str, api_key: str, model_name: str):
        self._llm = ChatOpenAI(
            base_url=base_url,
            api_key=api_key,
            model=model_name
        )

    @property
    def llm(self) -> BaseChatModel:
        return self._llm
