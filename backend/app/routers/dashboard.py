from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.models.meal_log import MealLog
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    start = datetime(today.year, today.month, today.day, 0, 0, 0)
    end = datetime(today.year, today.month, today.day, 23, 59, 59)

    meals = await MealLog.find(
        MealLog.user_id == current_user.id,
        MealLog.logged_at >= start, MealLog.logged_at <= end
    ).to_list()

    total_cal = sum(m.calories for m in meals)
    goal = current_user.daily_calorie_goal or 2000
    avg_hs = (sum(m.health_score for m in meals) / len(meals)) if meals else 0

    return {
        "date": today.isoformat(),
        "total_calories": round(total_cal, 1),
        "total_protein_g": round(sum(m.protein_g for m in meals), 1),
        "total_carbs_g": round(sum(m.carbs_g for m in meals), 1),
        "total_fat_g": round(sum(m.fat_g for m in meals), 1),
        "total_sugar_g": round(sum(m.sugar_g for m in meals), 1),
        "meal_count": len(meals),
        "calorie_goal": goal,
        "goal_percentage": round((total_cal / goal) * 100, 1) if goal else 0,
        "avg_health_score": round(avg_hs, 1),
        "has_warnings": any(m.warnings for m in meals),
    }


@router.get("/weekly")
async def get_weekly(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    labels, calories, protein, carbs, fat = [], [], [], [], []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        s = datetime(day.year, day.month, day.day, 0, 0, 0)
        e = datetime(day.year, day.month, day.day, 23, 59, 59)
        meals = await MealLog.find(
            MealLog.user_id == current_user.id,
            MealLog.logged_at >= s, MealLog.logged_at <= e
        ).to_list()
        labels.append(day.strftime("%a %d"))
        calories.append(round(sum(m.calories for m in meals), 1))
        protein.append(round(sum(m.protein_g for m in meals), 1))
        carbs.append(round(sum(m.carbs_g for m in meals), 1))
        fat.append(round(sum(m.fat_g for m in meals), 1))

    return {
        "labels": labels, "calories": calories,
        "protein": protein, "carbs": carbs, "fat": fat,
        "calorie_goal": current_user.daily_calorie_goal or 2000,
    }
