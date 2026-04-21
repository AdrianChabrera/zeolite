from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db
from app.enums.entity_type import EntityType
from app.models.relationship import Relationship

router = APIRouter(prefix="/api/relationships", tags=["Relationships"])

VALID_LABELS = {e.value for e in EntityType}

def _validate_label(label: str) -> str:
    """Raise 400 if label is not a known entity type (prevents Cypher injection)."""
    if label not in VALID_LABELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid entity type '{label}'. Must be one of: {sorted(VALID_LABELS)}",
        )
    return label

@router.post("", status_code=201)
def create_relationship(rel: Relationship, db=Depends(get_db)):
    from_label = _validate_label(rel.from_type.value)
    to_label = _validate_label(rel.to_type.value)
    rel_type = rel.relationship_type.value

    query = f"""
    MATCH (a:{from_label} {{id: $from_id}})
    MATCH (b:{to_label} {{id: $to_id}})
    CREATE (a)-[r:{rel_type} {{
        id: $rel_id,
        description: $description
    }}]->(b)
    RETURN
        a.id   AS from_id,
        '{from_label}' AS from_type,
        a.name AS from_name,
        b.id   AS to_id,
        '{to_label}'   AS to_type,
        b.name AS to_name,
        type(r) AS relationship_type,
        r.id    AS rel_id,
        r.description AS description
    """

    result = db.run(
        query,
        from_id=rel.from_id,
        to_id=rel.to_id,
        rel_id=str(rel.id),
        description=rel.description,
    )
    record = result.single()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="One or both entities were not found. Verify the IDs and types.",
        )

    return {"message": "Relationship created", "data": dict(record)}

@router.get("")
def get_all_relationships(db=Depends(get_db)):
    """Return every relationship stored in the graph."""
    query = """
    MATCH (a)-[r]->(b)
    WHERE r.id IS NOT NULL
    RETURN
        a.id   AS from_id,
        labels(a)[0] AS from_type,
        a.name AS from_name,
        b.id   AS to_id,
        labels(b)[0] AS to_type,
        b.name AS to_name,
        type(r) AS relationship_type,
        r.id    AS id,
        r.description AS description
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/entity/{entity_type}/{entity_id}")
def get_relationships_for_entity(entity_type: str, entity_id: str, db=Depends(get_db)):
    """
    Return all relationships (incoming and outgoing) for a specific entity.

    entity_type must be one of: Character, Location, Group, Object, Event.
    """
    label = _validate_label(entity_type)

    query = f"""
    MATCH (a:{label} {{id: $entity_id}})-[r]->(b)
    RETURN
        a.id   AS from_id,
        '{label}' AS from_type,
        a.name AS from_name,
        b.id   AS to_id,
        labels(b)[0] AS to_type,
        b.name AS to_name,
        type(r) AS relationship_type,
        r.id    AS id,
        r.description AS description
    UNION
    MATCH (a)-[r]->(b:{label} {{id: $entity_id}})
    RETURN
        a.id   AS from_id,
        labels(a)[0] AS from_type,
        a.name AS from_name,
        b.id   AS to_id,
        '{label}'   AS to_type,
        b.name AS to_name,
        type(r) AS relationship_type,
        r.id    AS id,
        r.description AS description
    """

    result = db.run(query, entity_id=entity_id)
    return [dict(record) for record in result]

@router.get("/types")
def get_relationship_types():
    """Return the full list of allowed relationship types."""
    from app.enums.relationship_type import RelationshipType
    return [rt.value for rt in RelationshipType]

@router.get("/entity-types")
def get_entity_types():
    """Return the full list of allowed entity types."""
    return [et.value for et in EntityType]

@router.delete("/{relationship_id}", status_code=204)
def delete_relationship(relationship_id: str, db=Depends(get_db)):
    """Delete a relationship by its ID."""
    query = """
    MATCH ()-[r {id: $rel_id}]->()
    DELETE r
    """
    result = db.run(query, rel_id=relationship_id)
    summary = result.consume()
    if summary.counters.relationships_deleted == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")