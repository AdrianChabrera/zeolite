from uuid import UUID, uuid4

from pydantic import BaseModel, Field

class Object(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
