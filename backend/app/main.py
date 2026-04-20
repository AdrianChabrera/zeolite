from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import character

app = FastAPI(title="Zeolite", description="Zeolite backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(character.router)

@app.get("/")
async def root():
    return {"message": "Backend operative"}