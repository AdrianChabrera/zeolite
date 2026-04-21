from enum import Enum


class EntityType(str, Enum):
    CHARACTER = "Character"
    LOCATION = "Location"
    GROUP = "Group"
    OBJECT = "Object"
    EVENT = "Event"