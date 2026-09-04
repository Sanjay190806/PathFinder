# PathFinder Developer Guide

## 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or 20.x
- **Package Managers**: `pip` and `npm`
- **Git**: For version control

---

## 2. Local Environment Setup

### 2.1 Backend Setup
1. Clone the repository and navigate to root:
   ```bash
   cd "C:\Sanjay\Project\AI PathFinder"
   ```
2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Set `GROQ_API_KEY` (optional; system falls back to deterministic provider if omitted).
5. Start the FastAPI development server:
   ```bash
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

### 2.2 Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   App available at: `http://localhost:3000`

---

## 3. Running Automated Tests

### 3.1 Backend Tests (`pytest`)
Run the full test suite (258+ tests across Phases 1–9):
```bash
pytest backend/tests -v
```
Run specific test stages:
```bash
# Phase 9 Stage 12 Release Verification
pytest backend/tests/test_phase9_stage12_release_verification.py -v

# Global Hardening Tests
pytest backend/tests/test_phase9_stage11_global_hardening.py -v
```

### 3.2 Frontend Typecheck & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 4. Coding Conventions & Invariants
- **Python**: PEP 8 compliance, explicit type annotations, Pydantic v2 schemas for all API contracts.
- **Frontend**: Next.js 14 App Router, TypeScript strict mode, Tailwind CSS utility classes, Lucide React icons.
- **Zero Fabrication**: Any new career, resource, or salary benchmark must include explicit source attribution and verification status.
