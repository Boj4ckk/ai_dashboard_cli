

from agents.lucy_agent import LucyAgent
from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from .models.dto import PromptRequest
from core.dependencies import AIProviderDep


router = APIRouter(prefix="/chat", tags=["chat"], redirect_slashes=False)

@router.post("")
async def post_prompt(
    body: PromptRequest,
    ai_provider: AIProviderDep
    ) -> dict:

    lucy = LucyAgent(ai_provider)
    result = await lucy.generate_response(
        body.prompt
    )
    return result
 
    
