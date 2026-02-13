# Deployment Guide

## Backend (Render.com)
1. **Create Account**: Sign up at https://render.com.
2. **New Web Service**: Connect your GitHub repository.
3. **Settings**:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app` (You need to add gunicorn to requirements.txt)
   - **Environment Variables**:
     - `JWT_SECRET_KEY`: (Generate a strong random string)
     - `PYTHON_VERSION`: `3.11.0`

## Frontend (Netlify or Vercel)
1. **Create Account**: Sign up at https://netlify.com or https://vercel.com.
2. **New Site**: Import from GitHub.
3. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: The URL of your deployed Backend (e.g., `https://qr-menu-backend.onrender.com`)

## Local Development
1. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   .venv/Scripts/activate
   pip install -r requirements.txt
   python -m app.main
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
