from typing import Optional

from core.ai_provider import AIProviderResponse

from openai import OpenAI,APIError

class OpenAIApiProvider:
    def __init__(self,base_url:str, api_key: str, model_name: str):
        self.client = OpenAI(
             base_url=base_url,
             api_key=api_key
             )
        self.model_name = model_name
       
    

    def generate_structured(
            self,
            prompt: str,
            system_prompt: Optional[str] = None,
            temperature: float = 0.7,
            max_completion_tokens: Optional[int] = None,
        ) -> AIProviderResponse:
            """Generates structured data based on the provided prompt and response model."""
            messages = []
        
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            try:
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=temperature,
                    max_completion_tokens=max_completion_tokens,
                )
                
                return AIProviderResponse(
                    content=response.choices[0].message.content,
                    model_used=response.model,
                    tokens_used=response.usage.total_tokens if response.usage else None,
                )
            
            except APIError as e:
              
                return AIProviderResponse(
                    content="",
                    model_used=self.model_name,
                    error=f"OpenAI error: {str(e)}"
                )


            

