from uuid import UUID, uuid4
from typing import Optional

from pydantic import BaseModel, Field
from app.enums.entity_type import EntityType
from app.enums.relationship_type import RelationshipType


class Relationship(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    from_id: str = Field(..., description="ID of the source entity")
    from_type: EntityType = Field(..., description="Type of the source entity")
    to_id: str = Field(..., description="ID of the target entity")
    to_type: EntityType = Field(..., description="Type of the target entity")
    relationship_type: RelationshipType
    description: Optional[str] = Field(default=None, description="Optional context for this relationship")


class RelationshipRead(BaseModel):
    id: str
    from_id: str
    from_type: str
    from_name: str
    to_id: str
    to_type: str
    to_name: str
    relationship_type: str
    description: Optional[str] = None