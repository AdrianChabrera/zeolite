from pydantic import BaseModel

class Object(BaseModel):
    name: str
    description: str
