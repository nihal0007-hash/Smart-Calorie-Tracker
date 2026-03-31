import json
import re
import asyncio
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

# Try to find a working model name
_cached_working_model = None


async def _get_model():
    global _cached_working_model
    if _cached_working_model:
        return genai.GenerativeModel(_cached_working_model)

    try:
        # Dynamically discover models with robust attribute checking
        model_objs = await asyncio.to_thread(lambda: list(genai.list_models()))
        
        # Filter and pick the first flash model
        # We'll just look for 'flash' in name to be safe
        flash_names = [m.name for m in model_objs if "flash" in m.name.lower()]
        if flash_names:
            # Prefer '1.5-flash' if it exists in any form, else first flash
            preferred = [n for n in flash_names if "1.5" in n]
            _cached_working_model = preferred[0] if preferred else flash_names[0]
            print(f"Gemini: Using discovered flash model {_cached_working_model}")
            return genai.GenerativeModel(_cached_working_model)
        
        if model_objs:
            _cached_working_model = model_objs[0].name
            return genai.GenerativeModel(_cached_working_model)
    except Exception as e:
        print(f"Gemini Discovery Error (falling back): {e}")
    
    # Absolute fallback to standard name
    _cached_working_model = "gemini-1.5-flash"
    return genai.GenerativeModel(_cached_working_model)


def _build_prompt(meal_name: str, meal_description: str, user_profile: dict) -> str:
    diseases = ", ".join(user_profile.get("diseases", [])) or "None"
    allergies = ", ".join(user_profile.get("allergies", [])) or "None"
    return f"""You are a professional nutritionist AI. Analyze the meal below for the given user profile.
Return ONLY a valid JSON object. No markdown, no extra text.

MEAL: {meal_name}
DETAILS: {meal_description or "No additional details"}

USER PROFILE:
- Age: {user_profile.get("age", "unknown")} | Gender: {user_profile.get("gender", "unknown")}
- Height: {user_profile.get("height_cm", "unknown")}cm | Weight: {user_profile.get("weight_kg", "unknown")}kg
- Activity: {user_profile.get("activity_level", "sedentary")}
- Medical Conditions: {diseases}
- Allergies: {allergies}
- Daily Calorie Goal: {user_profile.get("daily_calorie_goal", 2000)} kcal

Return this exact JSON:
{{
  "calories": <number>,
  "protein_g": <number>,
  "carbs_g": <number>,
  "fat_g": <number>,
  "sugar_g": <number>,
  "fiber_g": <number>,
  "sodium_mg": <number>,
  "oil_content": "<low|medium|high>",
  "health_score": <integer 1-10>,
  "is_suitable": <true|false>,
  "warnings": ["<specific concern for this user>"],
  "benefits": ["<health benefit>"],
  "ai_summary": "<2-3 sentence personalized health assessment>"
}}"""


def _parse_response(text: str) -> dict:
    # Clean markdown if present
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return json.loads(text.strip())


async def analyze_meal(meal_name: str, meal_description: str, user_profile: dict) -> dict:
    prompt = _build_prompt(meal_name, meal_description, user_profile)
    try:
        model = await _get_model()
        response = await asyncio.to_thread(model.generate_content, prompt)
        return _parse_response(response.text)
    except Exception as e:
        print(f"Gemini Analysis Error: {type(e).__name__}: {e}")
        # Return fallback values but with the error logged
        return {
            "calories": 250, "protein_g": 10, "carbs_g": 30, "fat_g": 8,
            "sugar_g": 4, "fiber_g": 2, "sodium_mg": 400, "oil_content": "low",
            "health_score": 5, "is_suitable": True,
            "warnings": ["AI analysis service currently unavailable. Using estimated defaults."], 
            "benefits": ["Estimation provided"],
            "ai_summary": "System is currently estimating nutritional values. Please verify manually.",
        }
