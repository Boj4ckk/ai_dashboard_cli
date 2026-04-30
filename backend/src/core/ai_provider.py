

from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, Type, TypeVar




class AIProviderResponse(BaseModel):
    """Base class for AI provider responses."""
    content: str
    model_used: str
    tokens_used: Optional[int] = None
    error: Optional[str] = None



class AIProvider(ABC):
    @abstractmethod
    def generate_structured(
        self,
        prompt:str,
        system_prompt: Optional[str],
        temperature: float = 0.7,
        max_completion_tokens: Optional[int] = None,
    ) -> AIProviderResponse:
        """Generates structured data based on the provided prompt and response model."""
        pass