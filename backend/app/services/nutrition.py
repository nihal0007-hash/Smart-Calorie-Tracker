def calculate_calorie_goal(age: int, gender: str, height_cm: float, weight_kg: float, activity_level: str) -> int:
    """Mifflin-St Jeor BMR × activity factor."""
    if gender.lower() == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    factors = {
        "sedentary": 1.2, "light": 1.375,
        "moderate": 1.55, "active": 1.725, "very_active": 1.9,
    }
    return round(bmr * factors.get(activity_level.lower(), 1.2))
