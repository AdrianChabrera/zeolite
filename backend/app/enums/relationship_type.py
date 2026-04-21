from enum import Enum


class RelationshipType(str, Enum):
    # Character <-> Character
    KNOWS = "KNOWS"
    ALLIED_WITH = "ALLIED_WITH"
    ENEMY_OF = "ENEMY_OF"
    FAMILY_OF = "FAMILY_OF"
    MENTOR_OF = "MENTOR_OF"
    STUDENT_OF = "STUDENT_OF"
    BETRAYED = "BETRAYED"
    LOVES = "LOVES"
    RIVALS_WITH = "RIVALS_WITH"

    # Character <-> Location
    LIVES_IN = "LIVES_IN"
    BORN_IN = "BORN_IN"
    VISITED = "VISITED"
    RULES = "RULES"
    EXILED_FROM = "EXILED_FROM"

    # Character <-> Group
    MEMBER_OF = "MEMBER_OF"
    LEADS = "LEADS"
    FOUNDED = "FOUNDED"
    DEFECTED_FROM = "DEFECTED_FROM"

    # Character <-> Object
    OWNS = "OWNS"
    CREATED = "CREATED"
    SEEKS = "SEEKS"
    LOST = "LOST"

    # Character <-> Event
    PARTICIPATED_IN = "PARTICIPATED_IN"
    TRIGGERED = "TRIGGERED"
    WITNESSED = "WITNESSED"
    AFFECTED_BY = "AFFECTED_BY"

    # Location <-> Location
    PART_OF = "PART_OF"
    BORDERS = "BORDERS"
    CONNECTED_TO = "CONNECTED_TO"

    # Location <-> Event
    SITE_OF = "SITE_OF"

    # Group <-> Group
    ALLIED_GROUPS = "ALLIED_GROUPS"
    AT_WAR_WITH = "AT_WAR_WITH"
    SUBGROUP_OF = "SUBGROUP_OF"

    # Group <-> Event
    INVOLVED_IN = "INVOLVED_IN"

    # Object <-> Event
    USED_IN = "USED_IN"

    # Event <-> Event
    CAUSED = "CAUSED"

VALID_RELATIONSHIPS: dict[frozenset, list[RelationshipType]] = {
    frozenset({"Character", "Character"}): [
        RelationshipType.KNOWS, RelationshipType.ALLIED_WITH,
        RelationshipType.ENEMY_OF, RelationshipType.FAMILY_OF,
        RelationshipType.MENTOR_OF, RelationshipType.STUDENT_OF,
        RelationshipType.BETRAYED, RelationshipType.LOVES,
        RelationshipType.RIVALS_WITH,
    ],
    frozenset({"Character", "Location"}): [
        RelationshipType.LIVES_IN, RelationshipType.BORN_IN,
        RelationshipType.VISITED, RelationshipType.RULES,
        RelationshipType.EXILED_FROM,
    ],
    frozenset({"Character", "Group"}): [
        RelationshipType.MEMBER_OF, RelationshipType.LEADS,
        RelationshipType.FOUNDED, RelationshipType.DEFECTED_FROM,
    ],
    frozenset({"Character", "Object"}): [
        RelationshipType.OWNS, RelationshipType.CREATED,
        RelationshipType.SEEKS, RelationshipType.LOST,
    ],
    frozenset({"Character", "Event"}): [
        RelationshipType.PARTICIPATED_IN, RelationshipType.CAUSED,
        RelationshipType.WITNESSED, RelationshipType.AFFECTED_BY,
    ],
    frozenset({"Location", "Location"}): [
        RelationshipType.PART_OF, RelationshipType.BORDERS,
        RelationshipType.CONNECTED_TO,
    ],
    frozenset({"Location", "Event"}): [
        RelationshipType.SITE_OF,
    ],
    frozenset({"Group", "Group"}): [
        RelationshipType.ALLIED_GROUPS, RelationshipType.AT_WAR_WITH,
        RelationshipType.SUBGROUP_OF,
    ],
    frozenset({"Group", "Event"}): [
        RelationshipType.INVOLVED_IN,
    ],
    frozenset({"Object", "Event"}): [
        RelationshipType.USED_IN,
    ],
    frozenset({"Event", "Event"}): [
        RelationshipType.CAUSED,
    ],
}