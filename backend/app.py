

from fastapi import FastAPI
from src.api.v1.api import api_router
from src.middleware.cors import add_cors_middleware

app = FastAPI(title="Mon API Scalable", version="1.0.0")

add_cors_middleware(app)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)