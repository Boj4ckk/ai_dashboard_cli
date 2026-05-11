


import json

from agents.lucy_agent import LucyAgent
from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, StreamingResponse


from .models.dto import PromptRequest
from core.dependencies import AIProviderDep
from agents.db_agent.agent import SQlAgent


router = APIRouter(prefix="/chat", tags=["chat"], redirect_slashes=False)





@router.post("")
async def post_prompt(
    body: PromptRequest,
    ai_provider: AIProviderDep
    ) -> dict:

    sql_agent = SQlAgent(ai_provider)
    result = await sql_agent.generate_response(
        body.prompt
    )
    return result
 
    
@router.post("/db/stream")
async def stream_db_query(request: PromptRequest,ai_provider: AIProviderDep):

    async def event_generator():
        sql_agent = SQlAgent(ai_provider)
        async for chunk in sql_agent.stream_response(request.prompt):
            chunk_type, chunk_data = chunk
            if chunk_type == "custom":
                yield f"data: {json.dumps(chunk_data)}\n\n"
            elif chunk_type == "updates":
                for _, state_delta in chunk_data.items():
                    payload = {k: v for k, v in state_delta.items() if k != "messages"}
                    if payload:
                        yield f"data: {json.dumps(payload)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(), media_type="text/event-stream",headers={"Cache-Control": "no-cache", "X-Accel-Buffering":"no"}
    )
