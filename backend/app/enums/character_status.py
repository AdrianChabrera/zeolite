from enum import Enum

class CharacterStatus(str, Enum):
    ALIVE = "Alive"
    DECEASED = "Deceased"
    UNKNOWN = "Unknown"