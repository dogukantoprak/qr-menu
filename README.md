🍽️ QR Menu
Full Stack Restaurant Management System

Backend-focused full stack application built with Flask & React.

📌 Overview

QR Menu is a full stack restaurant management system that allows:

Admins to manage restaurants, categories and menu items

Customers to view public menus via shareable links / QR

Secure login with JWT authentication

Structured REST API architecture

🏗️ Architecture
Backend

Flask

Flask-JWT-Extended

Flask-SQLAlchemy

PostgreSQL / SQLite

Gunicorn (WSGI)

CORS Configuration

Frontend

React

Vite

Axios

🔐 Authentication

JWT-based login system

Role-based access control

Protected admin routes

Public-facing endpoints

Login Endpoint:

POST /api/auth/login
📂 Project Structure
qr-menu/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── models/
│   │   └── schemas/
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── api/
    │   └── layouts/
    └── package.json
🚀 Running Locally
1️⃣ Backend
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m app.main

Health Check:

GET /api/health
2️⃣ Frontend
cd frontend
npm install
npm run dev
⚙️ Environment Variables
Backend

DATABASE_URL

JWT_SECRET_KEY

FRONTEND_URL

Frontend

VITE_API_BASE_URL

Example:

VITE_API_BASE_URL=https://your-backend.onrender.com/api
🛠️ Deployment
Backend (Render)

Root Directory: backend

Start Command:

gunicorn app.main:app
Frontend (Vercel)

Set VITE_API_BASE_URL

Ensure CORS is configured properly

🧪 Demo Credentials
Email: owner@demo.com
Password: 123456
🧠 Core Concepts Applied

RESTful API design

Modular Flask Blueprints

JWT Authentication

Database schema design

CORS handling

Production deployment configuration

📎 Repository

👉 https://github.com/dogukantoprak/qr-menu
