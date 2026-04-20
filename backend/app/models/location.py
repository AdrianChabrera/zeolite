from pydantic import BaseModel
from backend.app.enums.location_category import LocationCategory

class Location(BaseModel):
    name: str
    description: str
    category: LocationCategory
