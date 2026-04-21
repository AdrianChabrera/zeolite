from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import character
from .routes import location
from .routes import group
from .routes import object
from .routes import event
from .routes import relationship

app = FastAPI(title="Zeolite", description="Zeolite backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(character.router)
app.include_router(location.router)
app.include_router(group.router)
app.include_router(object.router)
app.include_router(event.router)
app.include_router(relationship.router)

@app.get("/")
async def root():
    return {"message": "Backend operative"}