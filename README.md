🍽️ QR Menu

QR kod tabanlı dijital menü ve sipariş sistemi.

Müşteriler QR kod ile menüye erişir, sepete ürün ekler ve sipariş verir.
Restoran sahipleri admin panelinden sistemi yönetir.

✨ Özellikler
👤 Müşteri

QR ile menü erişimi

Kategorili menü yapısı

Sepet & sipariş oluşturma

Sipariş durumu görüntüleme

🛠️ Admin

Kategori & ürün CRUD

Sipariş takibi

Masa oluşturma & QR üretimi

Görsel yükleme

Restoran ayarları

🧱 Teknolojiler

Backend: Flask • SQLAlchemy • Flask-JWT-Extended • SQLite/PostgreSQL
Frontend: React • Vite • TailwindCSS • React Router

🚀 Kurulum
Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.main

Backend: http://localhost:5000

Frontend
cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

🔑 Ortam Değişkenleri

backend/.env

JWT_SECRET_KEY=secret
DATABASE_URL=sqlite:///qrmenu.db
FRONTEND_URL=http://localhost:5173

frontend/.env

VITE_API_BASE_URL=http://localhost:5000
🔐 Demo
Email	Şifre
owner@demo.com
	123456

Admin → /admin/login
Menü → /r/demo-restoran

🔌 API
Public

GET /api/public/restaurants/:slug/menu

POST /api/public/orders

GET /api/public/orders/:id

Auth

POST /api/auth/login

Admin (JWT)

/api/admin/categories

/api/admin/items

/api/admin/orders

/api/admin/tables

/api/admin/settings

🌍 Deployment

Backend (Render)
Start: gunicorn app.main:app

Frontend (Vercel)
Env: VITE_API_BASE_URL

📁 Proje Yapısı
qr-menu/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   └── routers/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        └── context/
🧠 Uygulanan Konseptler

RESTful API

JWT Authentication

Role-based access

Relational DB design

Modular Flask Blueprint yapısı
