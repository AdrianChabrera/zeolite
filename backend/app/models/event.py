from pydantic import BaseModel, Field

class Event(BaseModel):
    name: str
    description: str
    importance: int = Field(default=1, ge=1, le=5, description="Nivel de impacto en la historia")
