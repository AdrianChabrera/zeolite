from pydantic import BaseModel

class Group(BaseModel):
    name: str
    description: str
    is_active: bool

