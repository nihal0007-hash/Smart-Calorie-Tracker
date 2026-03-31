from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.meal_log import MealLog


async def init_db():
    try:
        print(f"Connecting to MongoDB at: {settings.MONGODB_URI[:20]}...")
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        await init_beanie(
            database=client.calorie_tracker,
            document_models=[User, MealLog],
        )
        print("Connected to MongoDB successfully via Beanie!")
    except Exception as e:
        print(f"FAILED to connect to MongoDB: {type(e).__name__}: {e}")
        raise e
