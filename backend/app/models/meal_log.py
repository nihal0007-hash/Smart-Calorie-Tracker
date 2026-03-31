from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime


class MealLog(Document):
    user_id: PydanticObjectId
    meal_name: str
    meal_description: Optional[str] = None
    meal_type: str = "snack"
    logged_at: datetime = Field(default_factory=datetime.utcnow)
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    sugar_g: float = 0
    fiber_g: float = 0
    sodium_mg: float = 0
    oil_content: str = "low"
    health_score: int = 5
    is_suitable: bool = True
    ai_summary: str = ""
    warnings: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)

    class Settings:
        name = "meal_logs"
        indexes = ["user_id", "logged_at"]
