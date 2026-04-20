from fastapi import FastAPI, Depends
from pydantic import BaseModel
from database import get_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Zeolite",
    description="Zeolite backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend operative"}

app = FastAPI()

class CreateCharacter(BaseModel):
    name: str
    group: str

@app.post("/api/characters")
def create_character(character: CreateCharacter, db=Depends(get_db)):
    query = """
    MERGE (c:Character {name: $name})
    ON CREATE SET c.group = $group
    RETURN c.name AS name, c.group AS group
    """

    result = db.run(query, 
                       name=character.name, 
                       group=character.group, 
                       )
    
    register = result.single()
    
    return {"message": "Character created", "data": dict(register)}