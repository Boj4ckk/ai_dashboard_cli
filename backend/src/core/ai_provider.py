from abc import ABC, abstractmethod
from langchain_core.language_models import BaseChatModel


class AIProvider(ABC):
    @property
    @abstractmethod
    def llm(self) -> BaseChatModel:
        pass
