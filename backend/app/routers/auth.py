from fastapi import APIRouter, HTTPException, Depends
from app.schemas.auth import RegisterRequest, LoginRequest
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> dict:
    return {
        "id": str(user.id), "email": user.email, "name": user.name,
        "onboarding_complete": user.onboarding_complete,
        "approved": user.approved,
        "daily_calorie_goal": user.daily_calorie_goal,
        "diseases": user.diseases, "allergies": user.allergies,
        "age": user.age, "gender": user.gender,
        "height_cm": user.height_cm, "weight_kg": user.weight_kg,
        "activity_level": user.activity_level,
    }


@router.post("/register")
async def register(data: RegisterRequest):
    if await User.find_one(User.email == data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, password_hash=get_password_hash(data.password))
    await user.insert()
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": _user_response(user)}


@router.post("/login")
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": _user_response(user)}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_response(current_user)
