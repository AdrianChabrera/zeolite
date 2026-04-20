from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.location import Location

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.post("", status_code=201)
def create_location(location: Location, db=Depends(get_db)):
    query = """
    CREATE (l:Location {
        id: $id,
        name: $name,
        description: $description,
        category: $category
    })
    RETURN l    
    """
    result = db.run(
        query,
        id=str(location.id),
        name=location.name,
        description=location.description,
        category=location.category.value,
    )
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
def update_location(location_id: str, location: Location, db=Depends(get_db)):
    query = """
    MATCH (l:Location {id: $id})
    SET l.name = $name,
        l.description = $description,
        l.category = $category
    RETURN l
    """
    result = db.run(
        query,
        id=location_id,
        name=location.name,
        description=location.description,
        category=location.category.value,
    )
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