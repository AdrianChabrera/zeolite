from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.character import Character

router = APIRouter(prefix="/api/characters", tags=["Characters"])

@router.post("", status_code=201)
def create_character(character: Character, db=Depends(get_db)):
    query = """
    MERGE (c:Character {id: $id})
    ON CREATE SET 
        c.name = $name,
        c.race = $race,
        c.age = $age,
        c.status = $status,
        c.biography = $biography,
        c.personality = $personality,
        c.appearance = $appearance
    RETURN c
    """
    result = db.run(
        query,
        id=str(character.id),
        name=character.name,
        race=character.race,
        age=character.age,
        status=character.status.value,
        biography=character.biography,
        personality=character.personality,
        appearance=character.appearance
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=500, detail="Character could not be created")
    
    return {"message": "Character created", "data": dict(record["l"] if "l" in record else record["c"])}


@router.get("")
def get_characters(db=Depends(get_db)):
    query = "MATCH (c:Character) RETURN c"
    result = db.run(query)
    return [dict(record["c"]) for record in result]


@router.get("/{character_id}")
def get_character(character_id: str, db=Depends(get_db)):
    query = "MATCH (c:Character {id: $id}) RETURN c"
    result = db.run(query, id=character_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Character not found")
    return dict(record["c"])


@router.put("/{character_id}")
def update_character(character_id: str, character: Character, db=Depends(get_db)):
    query = """
    MATCH (c:Character {id: $id})
    SET c.name = $name,
        c.race = $race,
        c.age = $age,
        c.status = $status,
        c.biography = $biography,
        c.personality = $personality,
        c.appearance = $appearance
    RETURN c
    """
    result = db.run(
        query,
        id=character_id,
        name=character.name,
        race=character.race,
        age=character.age,
        status=character.status.value,
        biography=character.biography,
        personality=character.personality,
        appearance=character.appearance
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"message": "Character updated", "data": dict(record["c"])}


@router.delete("/{character_id}", status_code=204)
def delete_character(character_id: str, db=Depends(get_db)):
    query = "MATCH (c:Character {id: $id}) DETACH DELETE c"
    result = db.run(query, id=character_id)
    summary = result.consume()
    if summary.counters.nodes_deleted == 0:
        raise HTTPException(status_code=404, detail="Character not found")