from pydantic import BaseModel

from backend.app.enums.character_status import CharacterStatus

class Character(BaseModel):
    name: str
    race: str
    age: int
    status: CharacterStatus
    biography: str
    personality: str
    appearance: str
