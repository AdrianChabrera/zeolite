from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.models.event import Event

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("", status_code=201)
def create_event(event: Event, db=Depends(get_db)):
    query = """
    CREATE (e:Event {
        id: $id,
        name: $name,
        description: $description,
        importance: $importance
    })
    RETURN e
    """
    result = db.run(
        query,
        id=str(event.id),
        name=event.name,
        description=event.description,
        importance=event.importance,
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=500, detail="Event could not be created")
    return {"message": "Event created", "data": dict(record["e"])}


@router.get("")
def get_events(db=Depends(get_db)):
    query = "MATCH (e:Event) RETURN e"
    result = db.run(query)
    return [dict(record["e"]) for record in result]


@router.get("/{event_id}")
def get_event(event_id: str, db=Depends(get_db)):
    query = "MATCH (e:Event {id: $id}) RETURN e"
    result = db.run(query, id=event_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Event not found")
    return dict(record["e"])


@router.put("/{event_id}")
def update_event(event_id: str, event: Event, db=Depends(get_db)):
    query = """
    MATCH (e:Event {id: $id})
    SET e.name = $name,
        e.description = $description,
        e.importance = $importance
    RETURN e
    """
    result = db.run(
        query,
        id=event_id,
        name=event.name,
        description=event.description,
        importance=event.importance,
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated", "data": dict(record["e"])}


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: str, db=Depends(get_db)):
    query = "MATCH (e:Event {id: $id}) DELETE e"
    result = db.run(query, id=event_id)
    summary = result.consume()
    if summary.counters.nodes_deleted == 0:
        raise HTTPException(status_code=404, detail="Event not found")