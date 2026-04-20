from pydantic import BaseModel

class Character(BaseModel):
    name: str
    group: str