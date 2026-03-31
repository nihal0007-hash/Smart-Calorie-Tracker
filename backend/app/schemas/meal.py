from pydantic import BaseModel
from typing import Optional, List


class MealLogRequest(BaseModel):
    meal_name: str
    meal_description: Optional[str] = None
    meal_type: str = "snack"
    images: Optional[List[str]] = None


class MealLogCreate(BaseModel):
    meal_name: str
    meal_description: Optional[str] = None
    meal_type: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    sugar_g: float
    fiber_g: float
    sodium_mg: float
    oil_content: str
    health_score: int
    is_suitable: bool
    ai_summary: str
    warnings: List[str]
    benefits: List[str]
