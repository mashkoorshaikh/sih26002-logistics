# Production Deployment Guide — SIH26002 NER Logistics Platform

This document provides step-by-step instructions for deploying the **SIH26002** platform with:
- **Frontend**: Vercel
- **Backend**: Render or Railway (FastAPI + Uvicorn)
- **Database**: Managed Cloud PostgreSQL (Neon, Supabase, Render Postgres, or Railway Postgres)

---

## Architecture Overview

```
[ Client Browser (Mobile / Desktop) ]
                |
                v  HTTPS
    [ Vercel Frontend (React + Vite) ]
                |
                v  REST API (HTTPS + JWT)
   [ Render / Railway (FastAPI + Uvicorn) ]
        |               |
        v               v
 [ Managed PostgreSQL ]  [ OpenAI API / ML Models ]
```

---

## Phase 1: Managed Cloud PostgreSQL Setup

1. **Create a Database Instance**:
   - **Neon / Supabase / Render Postgres**: Create a free PostgreSQL instance.
   - Note the connection string (URI):
     ```
     postgresql://user:password@ep-cool-sample.region.neon.tech/ner_logistics_db?sslmode=require
     ```
2. **Compatibility Note**:
   The backend automatically converts `postgres://` or `postgresql://` URIs to async driver format `postgresql+asyncpg://`.
3. **Table Initialization**:
   SQLAlchemy tables are automatically created on backend startup via the application lifespan hook (`Base.metadata.create_all`).

---

## Phase 2: Backend Deployment (Render or Railway)

### Option A: Render (Recommended)
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2 --proxy-headers --forwarded-allow-ips "*"`
4. Configure **Environment Variables** (see table below).
5. Set Health Check Path to `/health`.
6. Deploy and copy your backend URL (e.g. `https://sih26002-backend.onrender.com`).

### Option B: Railway
1. Click **New Project** ➔ **Deploy from GitHub repo**.
2. Set root directory to `/backend`.
3. Railway automatically detects `Procfile` or `requirements.txt`.
4. Add environment variables in the **Variables** tab.
5. Generate a public domain under **Settings ➔ Networking**.

---

## Phase 3: Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New... ➔ Project**.
2. Import your GitHub repository.
3. In project setup:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://sih26002-backend.onrender.com
   ```
5. Click **Deploy**.
6. SPA client-side routing is automatically handled via [`vercel.json`](file:///e:/hackathon/frontend/vercel.json).

---

## Phase 4: Production Environment Variables Reference

### Backend Variables

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `ENVIRONMENT` | App environment flag | `production` |
| `PORT` | Web server port | `8000` (auto-assigned by host) |
| `DATABASE_URL` | Cloud PostgreSQL URI | `postgresql+asyncpg://user:pass@host:5432/db?ssl=require` |
| `SECRET_KEY` | JWT encryption key (32+ chars) | Generate via `openssl rand -hex 32` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session validity duration | `1440` (24 hours) |
| `ALLOWED_ORIGINS` | Permitted frontend origins (CORS) | `https://sih26002.vercel.app,https://your-custom-domain.com` |
| `OPENAI_API_KEY` | Optional: OpenAI LLM Key | `sk-proj-...` |
| `OPENAI_MODEL` | Grounded reasoning model | `gpt-4o-mini` |

### Frontend Variables

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production Backend HTTPS URL | `https://sih26002-backend.onrender.com` |

---

## Phase 5: Domain Configuration

1. **Custom Domain on Vercel**:
   - Go to **Project Settings ➔ Domains** on Vercel.
   - Add your domain: `logistics.yourorganization.org`.
   - Add the specified `CNAME` record (`cname.vercel-dns.com`) in your DNS provider (Cloudflare/GoDaddy/Route53).
2. **Update Backend CORS**:
   - Add the new domain to `ALLOWED_ORIGINS` in your backend environment variables:
     `ALLOWED_ORIGINS=https://sih26002.vercel.app,https://logistics.yourorganization.org`

---

## Phase 6: Production Verification & Smoke Testing

Run the following smoke tests against your live production endpoints:

1. **Service & Database Health**:
   ```bash
   curl -i https://sih26002-backend.onrender.com/health
   # Expected: {"status":"healthy","database":"connected","environment":"production"}
   ```

2. **Route Optimization Pipeline**:
   ```bash
   curl -X POST https://sih26002-backend.onrender.com/api/routes/calculate \
     -H "Content-Type: application/json" \
     -d '{"source":"Guwahati","destination":"Shillong","vehicle_type":"Truck","vehicle_weight":10,"cargo_type":"Vegetables"}'
   ```

3. **CORS Verification**:
   ```bash
   curl -I -X OPTIONS https://sih26002-backend.onrender.com/api/routes/calculate \
     -H "Origin: https://sih26002.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```

---

## Running the Complete System Locally

Before deploying, you can test the entire stack locally:

### 1. Start Backend:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.
