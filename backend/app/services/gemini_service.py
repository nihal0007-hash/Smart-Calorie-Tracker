import json
import re
import asyncio
import google.generativeai as genai
from app.core.config import settings
from app.services.ai_limiter import ai_limiter
from fastapi import HTTPException

genai.configure(api_key=settings.GOOGLE_API_KEY)

# Try to find a working model name
_cached_working_model = None


async def _get_model():
    global _cached_working_model
    if _cached_working_model:
        return genai.GenerativeModel(_cached_working_model)

    try:
        # Strategy: Get the REAL list from your account and find the best 1.5-flash variant
        print("Gemini: Discovering available models in your account...")
        model_objs = await asyncio.to_thread(lambda: list(genai.list_models()))
        all_names = [m.name for m in model_objs]
        flash_names = [n for n in all_names if "flash" in n.lower()]
        
        # Log discovered models for debugging
        print(f"Gemini: Discovered Flash models: {flash_names}")

        # 1. Look for the most stable and high-quota models using the names found in YOUR list.
        # Your account uses 'gemini-flash-latest' for the stable 1.5 version.
        preferred_stables = [
            n for n in flash_names 
            if "1.5" in n or n.endswith("gemini-flash-latest")
        ]
        
        if preferred_stables:
            # Prioritize 'gemini-flash-latest' specifically if found, as it's the 1,500 RPD one
            preferred_stables.sort(key=lambda x: "gemini-flash-latest" in x, reverse=True)
            _cached_working_model = preferred_stables[0]
            print(f"Gemini: Selected high-quota model from your list: {_cached_working_model}")
            return genai.GenerativeModel(_cached_working_model)

        # 2. Try 2.0-flash before 2.5 (usually 2.0 has higher limits than 2.5 preview)
        preferred_2_0 = [n for n in flash_names if "2.0" in n]
        if preferred_2_0:
            _cached_working_model = preferred_2_0[0]
            print(f"Gemini: Falling back to 2.0-flash: {_cached_working_model}")
            return genai.GenerativeModel(_cached_working_model)

        # 3. Last resort: whatever flash is there (we avoid 2.5 if possible)
        remaining_flash = [n for n in flash_names if "2.5" not in n]
        if remaining_flash:
            _cached_working_model = remaining_flash[0]
            return genai.GenerativeModel(_cached_working_model)
        
        if flash_names:
            _cached_working_model = flash_names[0]
            return genai.GenerativeModel(_cached_working_model)

    except Exception as e:
        print(f"Gemini Discovery Error: {e}")
    
    # Absolute fallback guess if list_models itself failed
    _cached_working_model = "models/gemini-1.5-flash"
    return genai.GenerativeModel(_cached_working_model)


def _build_prompt(meal_name: str, meal_description: str, user_profile: dict, has_images: bool) -> str:
    diseases = ", ".join(user_profile.get("diseases", [])) or "None"
    allergies = ", ".join(user_profile.get("allergies", [])) or "None"
    
    image_context = ""
    if has_images:
        image_context = "I have attached images of the nutrition labels/packaging for this meal. Please use the data from these images for maximum precision in your analysis. If the images contain a dish/plate of food instead of a label, prioritize the text description but you may use the image as secondary context."

    return f"""You are a professional nutritionist AI. Analyze the meal below for the given user profile.
{image_context}
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


async def analyze_meal(meal_name: str, meal_description: str, user_profile: dict, images: list[str] = None) -> dict:
    prompt = _build_prompt(meal_name, meal_description, user_profile, bool(images))
    
    # Prepare content parts
    content = [prompt]
    if images:
        for img_base64 in images:
            try:
                # Remove data:image/...;base64, prefix if present
                if "," in img_base64:
                    header, data = img_base64.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                else:
                    data = img_base64
                    mime_type = "image/jpeg" # Fallback
                
                content.append({
                    "mime_type": mime_type,
                    "data": data
                })
            except Exception as e:
                print(f"Error processing image part: {e}")

    try:
        model = await _get_model()

        # Token Tracking & Rate Limiting
        # Pre-count tokens to be safe
        token_count_obj = await asyncio.to_thread(model.count_tokens, content)
        request_tokens = getattr(token_count_obj, "total_tokens", 500) # Fallback to 500 if unknown

        # Check limits before calling the API
        ai_limiter.check_limits(request_tokens)

        # Performance the generation
        response = await asyncio.to_thread(model.generate_content, content)
        
        # Log successful request
        ai_limiter.log_request(request_tokens)
        
        return _parse_response(response.text)
    except HTTPException as he:
        # Re-raise rate limit exceptions
        raise he
    except Exception as e:
        print(f"Gemini Analysis Error: {type(e).__name__}: {e}")
        # Instead of fallbacks, we now let the user know the service is hit or down
        raise HTTPException(
            status_code=429, 
            detail="the AI model has reached its limit, pls try later"
        )
