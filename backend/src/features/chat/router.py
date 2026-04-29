

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from .models.dto import PromptRequest



router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
async def post_prompt(body: PromptRequest) -> dict:
 
    return {
        "response_code": 200,
        "response_message": f"Received prompt: {body.prompt}"
    }

@router.get("/test")
async def get_test() -> HTMLResponse:
    with open("data/preview.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)


