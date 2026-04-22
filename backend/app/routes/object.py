from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.object import Object

router = APIRouter(prefix="/api/objects", tags=["Objects"])

@router.post("", status_code=201)
def create_object(payload: dict, db=Depends(get_db)):
    obj_id = payload.get("id")
    if not obj_id:
        raise HTTPException(status_code=400, detail="ID is required")

    query = """
    MERGE (o:Object {id: $id})
    ON CREATE SET o += $props
    RETURN o
    """
    result = db.run(query, id=str(obj_id), props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=500, detail="Object could not be created")
    return {"message": "Object created", "data": dict(record["o"])}


@router.get("")
def get_objects(db=Depends(get_db)):
    query = "MATCH (o:Object) RETURN o"
    result = db.run(query)
    return [dict(record["o"]) for record in result]


@router.get("/{object_id}")
def get_object(object_id: str, db=Depends(get_db)):
    query = "MATCH (o:Object {id: $id}) RETURN o"
    result = db.run(query, id=object_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Object not found")
    return dict(record["o"])


@router.put("/{object_id}")
def update_object(object_id: str, payload: dict, db=Depends(get_db)):
    query = """
    MATCH (o:Object {id: $id})
    SET o = $props
    RETURN o
    """
    result = db.run(query, id=object_id, props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Object not found")
    return {"message": "Object updated", "data": dict(record["o"])}


@router.delete("/{object_id}", status_code=204)
def delete_object(object_id: str, db=Depends(get_db)):
    query = "MATCH (o:Object {id: $id}) DELETE o"
    result = db.run(query, id=object_id)
    summary = result.consume()
    if summary.counters.nodes_deleted == 0:
        raise HTTPException(status_code=404, detail="Object not found")