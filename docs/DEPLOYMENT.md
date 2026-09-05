# PathFinder Production Deployment & Setup Guide
**Phase 10: Environment Configuration, Database Initialization & Runbook**

---

## 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- SQLite (local/embedded) or PostgreSQL (production)

## 2. Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   .\venv\Scripts\activate   # Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Generate a strong secret key:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Set `SECRET_KEY` in `.env`.
4. Run the API server:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

## 3. Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Build production assets:
   ```bash
   npm run build
   ```
3. Start production server:
   ```bash
   npm start
   ```

## 4. Health Checks
- Backend health: `GET http://localhost:8000/docs`
- Analytics API: `GET http://localhost:8000/api/v1/analytics/definitions`
- Frontend dashboard: `GET http://localhost:3000/analytics`
