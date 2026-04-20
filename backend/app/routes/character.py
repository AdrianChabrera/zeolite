from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.models.character import Character

router = APIRouter(prefix="/api/characters", tags=["Characters"])

@router.post("")
def create_character(character: Character, db=Depends(get_db)):
    query = """
    MERGE (c:Character {name: $name})
    ON CREATE SET c.group = $group
    RETURN c.name AS name, c.group AS group
    """
    result = db.run(query, name=character.name, group=character.group)
    register = result.single()
    
    return {"message": "Character created", "data": dict(register)}