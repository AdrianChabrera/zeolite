from enum import Enum

class LocationCategory(str, Enum):
    SETTLEMENT = "Settlement"    
    CITY = "City"                  
    VILLAGE = "Village"           
    FORTRESS = "Fortress"         
    TAVERN = "Tavern"             
    REGION = "Region"            
    MOUNTAIN = "Mountain"         
    FOREST = "Forest"         
    RIVER = "River"                
    CAVE = "Cave"
    LANDMARK = "Landmark"
    RUINS = "Ruins"
    PORTAL = "Portal"
    OTHER = "Other"