
from typing import Literal

from config.settings import settings
from core.ai_provider import AIProvider
from core.providers.open_ai_api_provider import OpenAIApiProvider


class providerFactory:
    @staticmethod
    def create_provider(provider_type: Literal["openai_api","openai_self_hosted"]) -> AIProvider:
        if provider_type == "openai_api":
            return OpenAIApiProvider(
                base_url=settings.openai_base_url,
                api_key=settings.openai_api_key.get_secret_value(),
                model_name="gpt-5.4"
                
            )

