# 🍽️ CaseroAI

**AI-powered family meal planner for Latin American households**

> Built for ALGOfest Hackathon 2026 — AI & Machine Learning Track

---

## 🧠 The Problem

Every day, millions of families face the same question: *¿Qué cocinamos hoy?*

Existing meal planners are generic, English-first, and disconnected from how Latin American families actually shop and cook.

## ✨ The Solution

CaseroAI is an intelligent weekly meal planner that:

- 🗓️ Generates personalized 7-day meal plans using a constraint-based algorithm
- 👨‍👩‍👧‍👦 Adapts to each family member's preferences and restrictions
- 🥦 Gradually introduces new dishes to picky eaters using a progressive scoring system
- 🛒 Consolidates ingredients into a smart shopping list
- 🏪 Suggests when to shop based on your local store schedules
- 🇦🇷 Built with Argentine and Latin American cuisine as first-class citizens

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Database:** Firebase Firestore
- **AI:** Anthropic Claude API
- **Deploy:** Vercel

## 🚀 Getting Started

Clone the repo, install dependencies, and add your environment variables:

    git clone https://github.com/TU_USUARIO/caseroai
    cd caseroai
    npm install
    cp .env.example .env
    npm run dev

## 🔑 Environment Variables

Create a .env file with the following keys:

    VITE_ANTHROPIC_API_KEY=your_anthropic_key
    VITE_FIREBASE_API_KEY=your_firebase_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id

## 👤 Author

Built solo by **Marcelo** — shift worker, father of two, and home cooking enthusiast from Buenos Aires, Argentina.

*"I built this because I live this problem every day."*

---

*ALGOfest Hackathon 2026 submission*
