from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.enums.entity_type import EntityType

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/world-summary")
def get_world_summary(db=Depends(get_db)):
    query = """
    CALL { MATCH (c:Character) RETURN count(c) AS chars }
    CALL { MATCH (l:Location) RETURN count(l) AS locs }
    CALL { MATCH (g:Group) RETURN count(g) AS groups }
    CALL { MATCH (o:Object) RETURN count(o) AS objs }
    CALL { MATCH (e:Event) RETURN count(e) AS evts }
    CALL { MATCH ()-[r]->() RETURN count(r) AS rels }
    RETURN chars, locs, groups, objs, evts, rels
    """
    result = db.run(query)
    record = result.single()
    return {
        "characters": record["chars"],
        "locations": record["locs"],
        "groups": record["groups"],
        "objects": record["objs"],
        "events": record["evts"],
        "relationships": record["rels"],
        "total_nodes": record["chars"] + record["locs"] + record["groups"] + record["objs"] + record["evts"]
    }

@router.get("/location-importance")
def get_location_importance(db=Depends(get_db)):
    """Analiza qué localizaciones son clave basándose en los eventos que ocurren allí."""
    query = """
    MATCH (e:Event)-[:SITE_OF]-(l:Location)
    RETURN 
        l.name AS location, 
        count(e) AS total_events, 
        sum(e.importance) AS cumulative_importance,
        collect(e.name) AS events
    ORDER BY cumulative_importance DESC
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/character-network/{character_id}")
def get_character_influence(character_id: str, db=Depends(get_db)):
    query = """
    MATCH (c:Character {id: $id})-[:ALLIED_WITH|KNOWS|FAMILY_OF*1..2]-(connected)
    WHERE c <> connected
    RETURN 
        connected.name AS name, 
        labels(connected)[0] AS type,
        connected.id AS id
    """
    result = db.run(query, id=character_id)
    return [dict(record) for record in result]

@router.get("/plot-holes")
def get_plot_holes(db=Depends(get_db)):
    query = """
    MATCH (n)
    WHERE NOT (n)-[]-()
    RETURN 
        n.name AS name, 
        labels(n)[0] AS type, 
        n.id AS id
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/hotspots")
def get_story_hotspots(db=Depends(get_db)):
    query = """
    MATCH (l:Location)-[:SITE_OF]-(e:Event)
    RETURN 
        l.name AS location, 
        count(e) AS event_count, 
        avg(e.importance) AS average_impact
    ORDER BY average_impact DESC
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/event-chain")
def get_event_chain(db=Depends(get_db)):
    query = """
    MATCH (e1:Event)-[:CAUSED]->(e2:Event)
    RETURN 
        e1.name AS cause, 
        e1.importance AS cause_impact,
        e2.name AS consequence,
        e2.importance AS consequence_impact
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/social-centrality")
def get_social_centrality(db=Depends(get_db)):
    query = """
    MATCH (c:Character)-[r]-(other:Character)
    RETURN 
        c.name AS character, 
        count(r) AS connection_count
    ORDER BY connection_count DESC
    LIMIT 10
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/basic/character-full-context/{character_id}")
def get_character_full_context(character_id: str, db=Depends(get_db)):
    query = """
    MATCH (c:Character {id: $id})
    OPTIONAL MATCH (c)-[r]-(related)
    RETURN 
        c.name AS name,
        collect({
            relation: type(r),
            entity: related.name,
            type: labels(related)[0]
        }) AS connections
    """
    result = db.run(query, id=character_id)
    return result.single().data()