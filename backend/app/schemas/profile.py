from pydantic import BaseModel
from typing import Optional, List


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    diseases: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
