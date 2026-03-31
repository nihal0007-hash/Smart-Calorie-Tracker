from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.profile import ProfileUpdate
from app.core.dependencies import get_current_user
from app.services.nutrition import calculate_calorie_goal

router = APIRouter(prefix="/profile", tags=["profile"])


def _profile_response(u: User) -> dict:
    return {
        "id": str(u.id), "email": u.email, "name": u.name, "age": u.age,
        "gender": u.gender, "height_cm": u.height_cm, "weight_kg": u.weight_kg,
        "activity_level": u.activity_level, "diseases": u.diseases,
        "allergies": u.allergies, "daily_calorie_goal": u.daily_calorie_goal,
        "onboarding_complete": u.onboarding_complete,
    }


@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user)):
    return _profile_response(current_user)


@router.put("/")
async def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, key, value)

    if all([current_user.age, current_user.gender, current_user.height_cm,
            current_user.weight_kg, current_user.activity_level]):
        current_user.daily_calorie_goal = calculate_calorie_goal(
            current_user.age, current_user.gender,
            current_user.height_cm, current_user.weight_kg,
            current_user.activity_level,
        )

    if all([current_user.name, current_user.age, current_user.gender,
            current_user.height_cm, current_user.weight_kg]):
        current_user.onboarding_complete = True

    await current_user.save()
    return _profile_response(current_user)
