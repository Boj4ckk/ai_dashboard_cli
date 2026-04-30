from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from core.ai_provider import AIProvider
from core.provider_factory import providerFactory


@lru_cache
def get_ai_provider() -> AIProvider:
    return providerFactory.create_provider("openai_api")


AIProviderDep = Annotated[AIProvider, Depends(get_ai_provider)]
