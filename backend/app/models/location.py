from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from app.enums.location_category import LocationCategory

class Location(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    category: LocationCategory
