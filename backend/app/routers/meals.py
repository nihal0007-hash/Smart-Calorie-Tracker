from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from beanie import PydanticObjectId
from app.models.meal_log import MealLog
from app.models.user import User
from app.schemas.meal import MealLogRequest
from app.core.dependencies import get_current_user, get_approved_user
from app.services.gemini_service import analyze_meal

router = APIRouter(prefix="/meals", tags=["meals"])


def _today_range():
    today = datetime.utcnow().date()
    start = datetime(today.year, today.month, today.day, 0, 0, 0)
    end = datetime(today.year, today.month, today.day, 23, 59, 59)
    return start, end


def _meal_dict(m: MealLog) -> dict:
    return {
        "id": str(m.id), "meal_name": m.meal_name,
        "meal_description": m.meal_description, "meal_type": m.meal_type,
        "logged_at": m.logged_at, "calories": m.calories,
        "protein_g": m.protein_g, "carbs_g": m.carbs_g, "fat_g": m.fat_g,
        "sugar_g": m.sugar_g, "fiber_g": m.fiber_g, "sodium_mg": m.sodium_mg,
        "oil_content": m.oil_content, "health_score": m.health_score,
        "is_suitable": m.is_suitable, "ai_summary": m.ai_summary,
        "warnings": m.warnings, "benefits": m.benefits,
    }


from app.schemas.meal import MealLogRequest, MealLogCreate


@router.post("/analyze")
async def analyze_pre_log(data: MealLogRequest, current_user: User = Depends(get_approved_user)):
    user_profile = {
        "age": current_user.age, "gender": current_user.gender,
        "height_cm": current_user.height_cm, "weight_kg": current_user.weight_kg,
        "activity_level": current_user.activity_level,
        "diseases": current_user.diseases, "allergies": current_user.allergies,
        "daily_calorie_goal": current_user.daily_calorie_goal,
    }
    analysis = await analyze_meal(
        data.meal_name, 
        data.meal_description or "", 
        user_profile,
        data.images
    )
    return {**data.dict(), **analysis}


@router.post("/log")
async def log_meal(meal_data: MealLogCreate, current_user: User = Depends(get_approved_user)):
    meal = MealLog(
        user_id=current_user.id, 
        **meal_data.dict()
    )
    await meal.insert()
    return _meal_dict(meal)


@router.get("/today")
async def get_today_meals(current_user: User = Depends(get_approved_user)):
    start, end = _today_range()
    meals = await MealLog.find(
        MealLog.user_id == current_user.id,
        MealLog.logged_at >= start, MealLog.logged_at <= end
    ).sort("-logged_at").to_list()
    return [_meal_dict(m) for m in meals]


@router.get("/history")
async def get_history(current_user: User = Depends(get_approved_user), days: int = Query(7, ge=1, le=30)):
    since = datetime.utcnow() - timedelta(days=days)
    meals = await MealLog.find(
        MealLog.user_id == current_user.id, MealLog.logged_at >= since
    ).sort("-logged_at").to_list()
    return [_meal_dict(m) for m in meals]


@router.delete("/{meal_id}")
async def delete_meal(meal_id: str, current_user: User = Depends(get_approved_user)):
    meal = await MealLog.get(PydanticObjectId(meal_id))
    if not meal or meal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    await meal.delete()
    return {"message": "Deleted"}
