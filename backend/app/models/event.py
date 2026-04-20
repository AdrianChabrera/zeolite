from uuid import UUID, uuid4

from pydantic import BaseModel, Field

class Event(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    importance: int = Field(default=1, ge=1, le=5, description="Nivel de impacto en la historia")
