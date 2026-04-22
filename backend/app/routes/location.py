from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.location import Location

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.post("", status_code=201)
def create_location(payload: dict, db=Depends(get_db)):
    loc_id = payload.get("id")
    if not loc_id:
        raise HTTPException(status_code=400, detail="ID is required")

    query = """
    MERGE (l:Location {id: $id})
    ON CREATE SET l += $props
    RETURN l
    """
    result = db.run(query, id=str(loc_id), props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=500, detail="Location could not be created")
    return {"message": "Location created", "data": dict(record["l"])}


@router.get("")
def get_locations(db=Depends(get_db)):
    query = "MATCH (l:Location) RETURN l"
    result = db.run(query)
    return [dict(record["l"]) for record in result]


@router.get("/{location_id}")
def get_location(location_id: str, db=Depends(get_db)):
    query = "MATCH (l:Location {id: $id}) RETURN l"
    result = db.run(query, id=location_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Location not found")
    return dict(record["l"])


@router.put("/{location_id}")
def update_location(location_id: str, payload: dict, db=Depends(get_db)):
    query = """
    MATCH (l:Location {id: $id})
    SET l = $props
    RETURN l
    """
    result = db.run(query, id=location_id, props=payload)
    record = result.single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location updated", "data": dict(record["l"])}


@router.delete("/{location_id}", status_code=204)
def delete_location(location_id: str, db=Depends(get_db)):
    query = "MATCH (l:Location {id: $id}) DELETE l"
    result = db.run(query, id=location_id)
    summary = result.consume()
    if summary.counters.nodes_deleted == 0:
        raise HTTPException(status_code=404, detail="Location not found")