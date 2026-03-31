<div align="center">

# 🥗 Smart Calorie Tracker

### AI-powered nutrition tracking personalized to your health profile

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)

</div>

---

## 📌 Overview

**Smart Calorie Tracker** is a full-stack web application that uses **Google Gemini AI** to analyze meals and provide personalized nutritional insights. Simply enter what you ate, and the app returns calories, macros, sugar, oil content, a health score, warnings specific to your medical conditions/allergies, and a personalized health assessment.

Every user has their own separate tracker with a personalized health profile so that recommendations are tailored specifically to them.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Meal Analysis** | Gemini 1.5 Flash analyzes every meal for calories, protein, carbs, fat, sugar, fiber, sodium, and oil content |
| 👤 **Health Profile** | Stores your age, height, weight, gender, activity level, medical conditions, and allergies |
| ⚠️ **Smart Warnings** | Flags meals that may be unsafe for your conditions (e.g., high sugar for diabetics, nut-based dishes for nut allergies) |
| ✅ **Suitability Score** | AI judges whether a meal is suitable for YOU specifically (1–10 health score) |
| 📊 **Progress Dashboard** | Animated calorie progress rings, macro breakdown, daily vs goal comparison |
| 📈 **Weekly Trends** | Chart.js line chart of your 7-day calorie intake vs goal |
| 🔐 **Secure Auth** | JWT-based authentication with per-user data isolation |
| 🐳 **Docker Ready** | One-command local setup with Docker Compose |

---

## 🖼️ Screenshots

| Landing Page | Auth | Onboarding |
|---|---|---|
| Premium dark-mode hero | Login / Register tabs | 3-step health wizard |

| Dashboard | Log Meal | Profile |
|---|---|---|
| Progress rings + weekly chart | AI analysis result card | BMI + edit profile |

---

## 🏗️ Architecture

```
Smart Calorie Tracker
├── frontend/          # React + Vite (→ Vercel)
│   ├── src/pages/     # LandingPage, Auth, Onboarding, Dashboard, LogMeal, Profile
│   ├── src/components/# ProgressRing, WeeklyChart, MealCard, HealthBadge, Navbar
│   ├── src/services/  # Axios API layer
│   └── src/store/     # React Context (JWT auth state)
│
├── backend/           # FastAPI (→ Railway / Render)
│   └── app/
│       ├── routers/   # /auth, /meals, /profile, /dashboard
│       ├── models/    # Beanie ODM documents (User, MealLog)
│       ├── schemas/   # Pydantic request/response models
│       ├── services/  # Gemini AI + BMR calculator
│       └── core/      # JWT, bcrypt, config, auth dependency
│
└── docker-compose.yml # Local dev orchestration
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Chart.js, Axios |
| **Styling** | Vanilla CSS with custom design system (dark mode, glassmorphism) |
| **Backend** | FastAPI (Python 3.11), Uvicorn |
| **Database** | MongoDB Atlas (cloud), Beanie ODM, Motor (async driver) |
| **AI** | Google Gemini 1.5 Flash |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-calorie-tracker.git
cd smart-calorie-tracker
```

### 2. Configure Environment Variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# JWT secret (generate a random string)
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google Gemini API key
GOOGLE_API_KEY=your-gemini-api-key

# Frontend API base URL
VITE_API_URL=http://localhost:8000
```

> **⚠️ MongoDB Atlas — Allow your IP:**
> Go to **Atlas → Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`) to allow connections during development.

---

### Option A: Run Manually (Recommended for Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

### Option B: Docker Compose

```bash
docker compose up --build
```

Both services start automatically. Frontend at `:3000`, backend at `:8000`.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register with email + password |
| `POST` | `/auth/login` | Login → returns JWT token |
| `GET` | `/auth/me` | Get current authenticated user |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile/` | Get user health profile |
| `PUT` | `/profile/` | Update profile (triggers calorie goal recalculation) |

### Meals
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/meals/log` | Log a meal — Gemini AI analyzes it |
| `GET` | `/meals/today` | Get today's meal logs |
| `GET` | `/meals/history?days=7` | Get meal history (up to 30 days) |
| `DELETE` | `/meals/{id}` | Delete a meal log |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Today's calorie totals vs goal |
| `GET` | `/dashboard/weekly` | 7-day trend data for charts |

---

## 🗄️ Data Models

### User
```json
{
  "email": "user@example.com",
  "name": "Rahul",
  "age": 25,
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 70,
  "activity_level": "moderate",
  "diseases": ["Diabetes"],
  "allergies": ["Nuts"],
  "daily_calorie_goal": 2200,
  "onboarding_complete": true
}
```

### MealLog (after AI analysis)
```json
{
  "meal_name": "Chicken Biryani",
  "meal_type": "lunch",
  "calories": 650,
  "protein_g": 35,
  "carbs_g": 75,
  "fat_g": 18,
  "sugar_g": 4,
  "oil_content": "medium",
  "health_score": 7,
  "is_suitable": true,
  "warnings": ["High carbohydrate content — monitor for blood sugar"],
  "benefits": ["Good protein source", "Contains spices with anti-inflammatory properties"],
  "ai_summary": "Chicken Biryani is a balanced meal overall, providing good protein. As a diabetic, monitor portion size due to the high carb content from rice. The chicken adds valuable protein to support muscle maintenance."
}
```

---

## 🌍 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Push to GitHub → import in Vercel
# Set environment variable: VITE_API_URL=https://your-backend-url.railway.app
```

### Backend → Railway / Render

1. Connect your GitHub repo
2. Set root directory to `backend/`
3. Add all environment variables from `.env`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

---

## 🧠 How Gemini AI Works

When you log a meal, the backend sends a structured prompt to **Gemini 1.5 Flash** that includes:

- The meal name and any additional details you provided
- Your full health profile (age, weight, diseases, allergies, daily calorie goal)

Gemini returns a structured JSON with **realistic nutritional estimates** + a **personalized health assessment** that considers your specific conditions and allergies.

**Example prompt context:**
```
MEAL: Chicken Biryani (1 large plate with raita)
USER: Age 25, Male, Diabetic, Nut allergy, Goal: 2200 kcal
```

**Gemini returns:**
- Calories, protein, carbs, fat, sugar, fiber, sodium, oil content
- Health score (1–10)
- Suitability flag (`true`/`false`)
- Personalized warnings (e.g., "High glycemic rice — monitor blood sugar")
- Health benefits
- 2–3 sentence AI summary tailored to the user

---

## 🔑 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `SECRET_KEY` | JWT signing secret | ✅ |
| `ALGORITHM` | JWT algorithm (default: `HS256`) | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL (default: `10080` = 7 days) | ✅ |
| `GOOGLE_API_KEY` | Gemini API key from AI Studio | ✅ |
| `VITE_API_URL` | Backend URL for frontend | ✅ |

---

## 📁 Project Structure

```
smart-calorie-tracker/
├── .env                        # Your credentials (not committed)
├── .env.example                # Template
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app entry + CORS
│       ├── database.py         # MongoDB + Beanie init
│       ├── core/
│       │   ├── config.py       # Pydantic Settings
│       │   ├── security.py     # JWT + bcrypt
│       │   └── dependencies.py # Auth dependency
│       ├── models/
│       │   ├── user.py
│       │   └── meal_log.py
│       ├── schemas/
│       │   ├── auth.py
│       │   ├── meal.py
│       │   └── profile.py
│       ├── services/
│       │   ├── gemini_service.py
│       │   └── nutrition.py
│       └── routers/
│           ├── auth.py
│           ├── meals.py
│           ├── profile.py
│           └── dashboard.py
│
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── AuthPage.jsx
        │   ├── Onboarding.jsx
        │   ├── Dashboard.jsx
        │   ├── LogMeal.jsx
        │   └── Profile.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProgressRing.jsx
        │   ├── WeeklyChart.jsx
        │   ├── MealCard.jsx
        │   └── HealthBadge.jsx
        ├── services/
        │   └── api.js
        └── store/
            └── AuthContext.jsx
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

---

<div align="center">
  Built with ❤️ using FastAPI, React, MongoDB Atlas & Google Gemini AI
</div>
