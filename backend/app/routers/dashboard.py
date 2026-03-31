from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.models.meal_log import MealLog
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.timezone import ist_today, get_now_ist, date_to_ist_range, ensure_ist

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(current_user: User = Depends(get_current_user), date: str = None):
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            target_date = ist_today()
    else:
        target_date = ist_today()

    start, end = date_to_ist_range(target_date)

    meals = await MealLog.find(
        MealLog.user_id == current_user.id,
        MealLog.logged_at >= start, MealLog.logged_at <= end
    ).to_list()

    total_cal = sum(m.calories for m in meals)
    goal = current_user.daily_calorie_goal or 2000
    avg_hs = (sum(m.health_score for m in meals) / len(meals)) if meals else 0

    return {
        "date": target_date.isoformat(),
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
    today = ist_today()
    start_of_week, _ = date_to_ist_range(today - timedelta(days=6))
    _, end_of_today = date_to_ist_range(today)

    # One single query for the entire week
    all_meals = await MealLog.find(
        MealLog.user_id == current_user.id,
        MealLog.logged_at >= start_of_week,
        MealLog.logged_at <= end_of_today
    ).to_list()

    labels, calories, protein, carbs, fat = [], [], [], [], []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        # Filter meals for this specific day in memory
        s, e = date_to_ist_range(day)
        day_meals = [m for m in all_meals if s <= ensure_ist(m.logged_at) <= e]
        
        labels.append(day.strftime("%a %d"))
        calories.append(round(sum(m.calories for m in day_meals), 1))
        protein.append(round(sum(m.protein_g for m in day_meals), 1))
        carbs.append(round(sum(m.carbs_g for m in day_meals), 1))
        fat.append(round(sum(m.fat_g for m in day_meals), 1))

    return {
        "labels": labels, "calories": calories,
        "protein": protein, "carbs": carbs, "fat": fat,
        "calorie_goal": current_user.daily_calorie_goal or 2000,
    }
