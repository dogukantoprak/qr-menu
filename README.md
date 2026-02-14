# 🍽️ QR Menu

Modern QR kod tabanlı dijital menü ve sipariş sistemi.

Müşteriler QR kod ile menüye erişir, sepete ürün ekler ve sipariş verir.  
Restoran sahipleri admin paneli üzerinden sistemi yönetir.

---

## 🚀 Özellikler

### 👤 Müşteri
- QR ile menü erişimi  
- Kategorili ve görselli menü  
- Sepet & sipariş oluşturma  
- Sipariş durumu görüntüleme  

### 🛠️ Admin
- Kategori & ürün yönetimi (CRUD)  
- Sipariş takibi  
- Masa oluşturma & QR üretimi  
- Görsel yükleme  
- Restoran ayarları  

---

## 🧱 Teknolojiler

### 🔹 Backend
- Python  
- Flask  
- Flask-JWT-Extended  
- SQLAlchemy  
- SQLite / PostgreSQL  
- Gunicorn  
- Flask-CORS  

### 🔹 Frontend
- React  
- Vite  
- React Router  
- Axios  
- TailwindCSS  

---

## 📦 Kurulum

### 🔙 Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
python -m app.main
```

Backend: http://localhost:5000

---

### 🎨 Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 🔑 Ortam Değişkenleri

### backend/.env

```env
JWT_SECRET_KEY=secret
DATABASE_URL=sqlite:///qrmenu.db
FRONTEND_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 👤 Demo

| Email | Şifre |
|-------|--------|
| owner@demo.com | 123456 |

Admin → `/admin/login`  
Menü → `/r/demo-restoran`

---

## 🔌 API

### Public
- `GET /api/public/restaurants/:slug/menu`
- `POST /api/public/orders`
- `GET /api/public/orders/:id`

### Auth
- `POST /api/auth/login`

### Admin (JWT gerekli)
- `/api/admin/categories`
- `/api/admin/items`
- `/api/admin/orders`
- `/api/admin/tables`
- `/api/admin/settings`

---

## 🌍 Deployment

### Backend → Render
Start:
```bash
gunicorn app.main:app
```

Environment:
- JWT_SECRET_KEY
- DATABASE_URL
- FRONTEND_URL

### Frontend → Vercel
Env:
- VITE_API_BASE_URL

---

## 📁 Proje Yapısı

```bash
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
        ├── context/
        ├── layouts/
        └── api/
```

---

## 🧠 Uygulanan Konseptler

- RESTful API
- JWT Authentication
- Role-based authorization
- Relational DB design
- Modular Flask Blueprint
- CORS & production configuration

---

## 🎯 Proje Türü

Portfolyo Projesi – Full Stack Web Application
