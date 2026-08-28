# PATHFINDER ? DEPLOYMENT & OPERATION GUIDE

This document describes how to deploy, configure, and operate the PathFinder platform in local, staging, and production environments.

---

## 1. System Requirements
- **Python**: 3.11+
- **Node.js**: 18.17+ or 20+
- **npm**: 9+
- **Database**: SQLite (default / embedded) or PostgreSQL 15+

---

## 2. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Configure the following key parameters:
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SECRET_KEY` | JWT encryption secret key | *(generate random 32+ char secret)* |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./pathfinder.db` or `postgresql://...` |
| `AI_PROVIDER` | AI Coach reasoning backend | `gemini` (or `deterministic`) |
| `GEMINI_API_KEY` | Google Gemini API Key | *(optional if deterministic)* |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | `http://localhost:8000/api/v1` |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` |

---

## 3. Backend Setup & Startup
1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run database verification & startup**:
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```
   *Note: Database tables and demo data will be seeded automatically on initial startup.*

4. **Execute backend test suite**:
   ```bash
   python -m pytest backend/tests
   ```

---

## 4. Frontend Setup & Build
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Create production build**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm run start
   ```
   *(Or for local development: `npm run dev` on port 3000)*

---

## 5. Health Check & Monitoring
- **Health Check Endpoint**: `GET /health` $	o$ `{"status": "healthy"}`
- **OpenAPI Schema**: `GET /api/v1/openapi.json`
- **Interactive Swagger Docs**: `GET /docs`
