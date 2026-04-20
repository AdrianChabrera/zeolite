from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from app.enums.character_status import CharacterStatus

class Character(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    race: str
    age: int
    status: CharacterStatus
    biography: str
    personality: str
    appearance: str
