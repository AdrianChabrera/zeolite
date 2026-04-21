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

@router.get("/plot-holes")
def get_plot_holes(db=Depends(get_db)):
    query = """
    MATCH (n)
    WHERE NOT (n)-[]-()
    RETURN 
        n.name AS name, 
        labels(n)[0] AS type, 
        n.id AS id
    ORDER BY type ASC, name ASC
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

@router.get("/audit/narrative-orphans")
def get_narrative_orphans(db=Depends(get_db)):
    query = """
    MATCH (c:Character)
    WHERE NOT (c)-[:BORN_IN]->(:Location)
    RETURN c.id AS id, c.name AS name, "Character" AS type, 
           "NARRATIVE_ORPHAN" AS issue, "No birth location" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/isolated-characters")
def get_isolated_characters(db=Depends(get_db)):
    query = """
    MATCH (c:Character)
    WHERE NOT (c)-[]-(:Character)
    RETURN c.id AS id, c.name AS name, "Character" AS type, 
           "ISOLATED_CHARACTER" AS issue, "No relationships with other characters" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/empty-stages")
def get_empty_stages(db=Depends(get_db)):
    query = """
    MATCH (l:Location)
    WHERE NOT (l)-[]-(:Event) AND NOT (l)-[]-(:Character)
    RETURN l.id AS id, l.name AS name, "Location" AS type, 
           "EMPTY_STAGE" AS issue, "No events or characters connected" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/ghost-events")
def get_ghost_events(db=Depends(get_db)):
    query = """
    MATCH (e:Event)
    WHERE NOT (e)<-[:WITNESSED]-(:Character) AND NOT (e)<-[:PARTICIPATED_IN]-(:Character)
    RETURN e.id AS id, e.name AS name, "Event" AS type, 
           "GHOST_EVENT" AS issue, "No witnesses or participants" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/consequence-gaps")
def get_consequence_gaps(db=Depends(get_db)):
    query = """
    MATCH (e:Event)
    WHERE NOT (e)-[:CAUSED]->(:Event)
    RETURN e.id AS id, e.name AS name, "Event" AS type, 
           "CONSEQUENCE_GAP" AS issue, "Dead-end narrative branch" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/forgotten-objects")
def get_forgotten_objects(db=Depends(get_db)):
    query = """
    MATCH (o:Object)
    WHERE NOT (o)-[:OWNS|:LOST|:CREATED]-(:Character)
      AND NOT (o)-[:USED_IN]-(:Event)
    RETURN o.id AS id, o.name AS name, "Object" AS type, 
           "FORGOTTEN_OBJECT" AS issue, "Object is not owned by anyone or used in events" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]

@router.get("/audit/empty-groups")
def get_empty_groups(db=Depends(get_db)):
    query = """
    MATCH (g:Group {is_active: true})
    WHERE NOT (g)<-[:MEMBER_OF|LEADS]-(:Character)
    RETURN g.id AS id, g.name AS name, "Group" AS type, 
           "EMPTY_GROUP" AS issue, "No active members or leaders" AS detail
    """
    result = db.run(query)
    return [dict(record) for record in result]