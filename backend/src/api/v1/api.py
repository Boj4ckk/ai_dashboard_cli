
from fastapi import APIRouter
from features.chat.router import router as chat_router

api_router = APIRouter(redirect_slashes=False)

api_router.include_router(chat_router, tags=["chat"])
