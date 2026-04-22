from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.character import Character

router = APIRouter(prefix="/api/characters", tags=["Characters"])

@router.post("", status_code=201)
def create_character(payload: dict, db=Depends(get_db)):
    char_id = payload.get("id")
    if not char_id:
        raise HTTPException(status_code=400, detail="ID is required")

    query = """
    MERGE (c:Character {id: $id})
    ON CREATE SET c = $props
    RETURN c
    """
    
    result = db.run(query, id=str(char_id), props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=500, detail="Character could not be created")
    
    return {
        "message": "Character created", 
        "data": dict(record["c"])
    }


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
def update_character(character_id: str, payload: dict, db=Depends(get_db)):
    query = """
    MATCH (c:Character {id: $id})
    SET c = $props
    RETURN c
    """
    result = db.run(query, id=character_id, props=payload)
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