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
    CAUSED = "CAUSED"
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

    # Generic
    RELATED_TO = "RELATED_TO"