<div align="center">

# 🥗 Smart Calorie Tracker 

### AI-Powered Nutrition Tracking • Personalized Health AI • IST Support

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)

</div>

---

## 📌 Overview

**Smart Calorie Tracker** is a premium, full-stack application designed to make nutrition tracking effortless and scientifically personalized. By leveraging **Google Gemini 1.5 Flash**, the app doesn't just count calories—it understands your unique health profile, medical conditions, and allergies to provide safe, actionable dietary advice.

Whether you're tracking "Live" (today) or backfilling historical data via our **Smart Calendar**, every entry is localized to **Indian Standard Time (IST)** and analyzed against your personal health goals.

---

## ✨ Latest Premium Features

| Feature | Description |
|---|---|
| 🤖 **Advanced AI Analysis** | Multimodal support (Text + Photos) using Gemini 1.5 Flash with **1,500 RPD** optimized limits. |
| 🇮🇳 **IST Timezone Support** | System-wide integration of **Indian Standard Time (+5:30)** for all logs and reports. |
| 📅 **Dashboard Calendar** | Stylish date picker to view and manage historical nutrition reports and meal logs. |
| 🧠 **Smart Contextual Add** | Automatically logs meals to the date you're currently viewing on the dashboard. |
| 🛡️ **Admin Approval** | Built-in user gating system. New accounts require manual approval before tracker access. |
| 🗑️ **Safe Deletion** | Interactive confirmation dialogs for removing meals to prevent accidental data loss. |
| 👤 **Health Profile AI** | Real-time analysis of medical conditions (Diabetes, etc.) and allergies to provide "Smart Warnings." |

---

## 🏗️ Technical Architecture

### 🛡️ Admin & Security
- **Approval System**: Users are initialized with `approved: false`. A dedicated `ApprovalPending` screen blocks access until an admin manually approves them in MongoDB Atlas.
- **JWT Protection**: All core routes are protected via sub-dependency guarding (`get_approved_user`).

### 🐍 Backend (FastAPI)
- **Timezone Management**: Centralized `timezone.py` ensures 100% consistency between backend server time, database storage, and frontend display.
- **AI Rate Limiting**: Intelligent `AILimiter` prevents API overages while prioritizing the highest-quota stable models (1,500 requests/day).
- **Beanie ODM**: Asynchronous MongoDB mapping with Pydantic v2 validation.

### ⚛️ Frontend (React + Vite)
- **Glassmorphism UI**: High-end custom CSS design system using HSL color tokens and modern dark mode aesthetics.
- **Live vs History Modes**: The UI dynamically switches context based on the selected date, offering a dedicated "Live Mode" tag for today's tracking.
- **Responsive Charts**: Interactive weekly trends powered by Chart.js.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.11+** & **Node.js 18+**
- **MongoDB Atlas** Cluster URL
- **Google Gemini API Key** (from AI Studio)

### 2. Deployment / Setup

**Backend Initialization:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Initialization:**
```bash
cd frontend
npm install
npm run dev
```

### 🔑 Environment Variables (.env)
```env
MONGODB_URI=your_atlas_uri
SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_gemini_key
VITE_API_URL=http://localhost:8000
```

---

## 📂 Project Structure

```
Smart Calorie Tracker
├── frontend/           # React 18 + Vite (Vanilla CSS)
│   ├── src/pages/      # Dashboard, LogMeal, Onboarding, Profile, Auth
│   ├── src/components/ # MealCard, ProgressRing, WeeklyChart, HealthBadge
│   └── src/services/   # Axios Core (Auto-injects JWT)
│
└── backend/            # FastAPI + Beanie ODM
    ├── app/core/       # Timezone IST logic, Auth, Rate Limiter
    ├── app/models/     # User (with 'approved' status), MealLog
    ├── app/services/   # Gemini AI Analysis, Nutrition Logic
    └── app/routers/    # Dashboard, Meals, Profile, Auth
```

---

## 🧠 AI Integration Logic

The app uses a high-performance **Gemini 1.5 Flash** model discovered dynamically via a priority-based safety loop.
- **Stable Pick**: Automatically targets `gemini-1.5-flash` or `gemini-flash-latest` for the **1,500 RPD** free-tier limit.
- **Contextual Knowledge**: Gemini is fed your age, height, weight, medical conditions, and allergies to ensure every meal "Health Score" is personalized specifically to your biology.

---

<div align="center">
  Built with ❤️ for a healthier world.
</div>
