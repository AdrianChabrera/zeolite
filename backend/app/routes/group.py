from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.group import Group

router = APIRouter(prefix="/api/groups", tags=["Groups"])

@router.post("", status_code=201)
def create_group(payload: dict, db=Depends(get_db)):
    group_id = payload.get("id")
    if not group_id:
        raise HTTPException(status_code=400, detail="ID is required")

    query = """
    MERGE (g:Group {id: $id})
    ON CREATE SET g += $props
    RETURN g
    """
    result = db.run(query, id=str(group_id), props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=500, detail="Group could not be created")
    return {"message": "Group created", "data": dict(record["g"])}


@router.get("")
def get_groups(db=Depends(get_db)):
    query = "MATCH (g:Group) RETURN g"
    result = db.run(query)
    return [dict(record["g"]) for record in result]


@router.get("/{group_id}")
def get_group(group_id: str, db=Depends(get_db)):
    query = "MATCH (g:Group {id: $id}) RETURN g"
    result = db.run(query, id=group_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Group not found")
    return dict(record["g"])


@router.put("/{group_id}")
def update_group(group_id: str, payload: dict, db=Depends(get_db)):
    query = """
    MATCH (g:Group {id: $id})
    SET g = $props
    RETURN g
    """
    result = db.run(query, id=group_id, props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group updated", "data": dict(record["g"])}


@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str, db=Depends(get_db)):
    query = "MATCH (g:Group {id: $id}) DELETE g"
    result = db.run(query, id=group_id)
    summary = result.consume()
    if summary.counters.nodes_deleted == 0:
        raise HTTPException(status_code=404, detail="Group not found")