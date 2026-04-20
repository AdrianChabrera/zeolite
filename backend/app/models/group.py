from uuid import UUID, uuid4

from pydantic import BaseModel, Field

class Group(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    is_active: bool

