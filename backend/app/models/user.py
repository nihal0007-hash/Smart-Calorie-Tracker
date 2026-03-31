from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from app.core.timezone import get_now_ist


class User(Document):
    email: str
    password_hash: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = "sedentary"
    diseases: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    daily_calorie_goal: Optional[int] = 2000
    onboarding_complete: bool = False
    approved: bool = False
    created_at: datetime = Field(default_factory=get_now_ist)

    class Settings:
        name = "users"
        indexes = ["email"]
