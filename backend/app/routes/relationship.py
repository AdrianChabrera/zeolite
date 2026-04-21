from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db
from app.enums.entity_type import EntityType
from app.models.relationship import Relationship

router = APIRouter(prefix="/api/relationships", tags=["Relationships"])

VALID_LABELS = {e.value for e in EntityType}

def _validate_label(label: str) -> str:
    if label not in VALID_LABELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid entity type '{label}'. Must be one of: {sorted(VALID_LABELS)}",
        )
    return label

@router.post("", status_code=201)
def create_relationship(rel: Relationship, db=Depends(get_db)):
    from app.enums.relationship_type import VALID_RELATIONSHIPS
    from_label = _validate_label(rel.from_type.value)
    to_label = _validate_label(rel.to_type.value)
    rel_type = rel.relationship_type.value

    key = frozenset({rel.from_type.value, rel.to_type.value})
    valid = VALID_RELATIONSHIPS.get(key, [])
    if rel.relationship_type not in valid:
        raise HTTPException(
            status_code=400,
            detail=f"'{rel_type}' no es válido entre {from_label} y {to_label}"
        )
    
    dup_query = f"""
    MATCH (a:{from_label} {{id: $from_id}})-[r:{rel_type}]->(b:{to_label} {{id: $to_id}})
    RETURN count(r) AS cnt
    """
    dup_result = db.run(dup_query, from_id=rel.from_id, to_id=rel.to_id)
    if dup_result.single()["cnt"] > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe una relación '{rel_type}' entre estas dos entidades.",
        )

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
            detail="One or both entities were not found.",
        )
    return {"message": "Relationship created", "data": dict(record)}

@router.get("")
def get_all_relationships(db=Depends(get_db)):
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
    from app.enums.relationship_type import RelationshipType
    return [rt.value for rt in RelationshipType]

@router.get("/entity-types")
def get_entity_types():
    return [et.value for et in EntityType]

@router.delete("/{relationship_id}", status_code=204)
def delete_relationship(relationship_id: str, db=Depends(get_db)):
    query = """
    MATCH ()-[r {id: $rel_id}]->()
    DELETE r
    """
    result = db.run(query, rel_id=relationship_id)
    summary = result.consume()
    if summary.counters.relationships_deleted == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")
    
@router.put("/{relationship_id}")
def update_relationship(relationship_id: str, rel_update: dict, db=Depends(get_db)):
    from app.enums.relationship_type import RelationshipType, VALID_RELATIONSHIPS

    new_type = rel_update.get("relationship_type")
    new_desc = rel_update.get("description")

    if new_type and new_type not in [rt.value for rt in RelationshipType]:
        raise HTTPException(status_code=400, detail=f"Invalid relationship type '{new_type}'")

    fetch_query = """
    MATCH (a)-[r {id: $rel_id}]->(b)
    RETURN a.id AS from_id, labels(a)[0] AS from_type,
           b.id AS to_id,   labels(b)[0] AS to_type,
           type(r) AS rel_type, r.description AS description
    """
    result = db.run(fetch_query, rel_id=relationship_id)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Relationship not found")

    from_id   = record["from_id"]
    to_id     = record["to_id"]
    from_type = record["from_type"]
    to_type   = record["to_type"]
    final_type = new_type or record["rel_type"]
    final_desc = new_desc if new_desc is not None else record["description"]

    key = frozenset({from_type, to_type})
    valid = VALID_RELATIONSHIPS.get(key, [])
    if final_type not in [v.value for v in valid]:
        raise HTTPException(
            status_code=400,
            detail=f"'{final_type}' no es válido entre {from_type} y {to_type}"
        )

    delete_query = "MATCH ()-[r {id: $rel_id}]->() DELETE r"
    db.run(delete_query, rel_id=relationship_id)

    create_query = f"""
    MATCH (a:{from_type} {{id: $from_id}})
    MATCH (b:{to_type}   {{id: $to_id}})
    CREATE (a)-[r:{final_type} {{id: $rel_id, description: $description}}]->(b)
    RETURN type(r) AS relationship_type, r.id AS id, r.description AS description
    """
    result = db.run(
        create_query,
        from_id=from_id, to_id=to_id,
        rel_id=relationship_id, description=final_desc
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=500, detail="Could not recreate relationship")

    return {"message": "Relationship updated", "data": dict(record)}
    
@router.get("/valid-types")
def get_valid_relationship_types(from_type: str, to_type: str):
    from app.enums.relationship_type import VALID_RELATIONSHIPS
    key = frozenset({from_type, to_type})
    types = VALID_RELATIONSHIPS.get(key, [])
    if not types:
        raise HTTPException(
            status_code=400,
            detail=f"No hay relaciones válidas entre {from_type} y {to_type}"
        )
    return [t.value for t in types]