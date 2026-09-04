# PathFinder Production Deployment Guide

## 1. Architecture & Services

In production, PathFinder operates as a decoupled two-tier application:
1. **Next.js 14 Frontend**: Pre-rendered static pages + dynamic SSR routes, optimized for CDN or Node.js hosting.
2. **FastAPI Backend**: Asynchronous ASGI application served via Uvicorn/Gunicorn workers behind a reverse proxy (Nginx or Cloudflare).
3. **Database**: PostgreSQL with connection pooling (e.g. PgBouncer) or managed RDS.

---

## 2. Environment Configuration Checklist

| Variable | Description | Production Requirement |
|---|---|---|
| `ENVIRONMENT` | Deployment environment (`production` / `staging`) | `production` |
| `SECRET_KEY` | 256-bit cryptographically secure key for JWT signing | Strong random string (`openssl rand -hex 32`) |
| `DATABASE_URL` | SQLAlchemy connection string | `postgresql://user:pass@host:5432/pathfinder` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `https://pathfinder.yourdomain.com` |
| `GROQ_API_KEY` | Groq API Key for high-speed Llama-3-70B coaching | Optional (system falls back to deterministic provider if omitted) |
| `LOG_LEVEL` | Application logging verbosity | `INFO` or `WARNING` |

---

## 3. Containerization (Docker)

### 3.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 3.2 Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 4. Reverse Proxy & Nginx Configuration

```nginx
server {
    listen 80;
    server_name pathfinder.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pathfinder.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/pathfinder.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pathfinder.yourdomain.com/privkey.pem;

    # Frontend reverse proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API backend reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Health Checks & Monitoring
- **Backend Health**: `GET /health` or `GET /api/v1/education/stages` returns HTTP 200 OK.
- **Frontend Health**: `GET /login` returns HTTP 200 OK.
- **Logging**: Structured JSON logs emitted to stdout, aggregated via CloudWatch, Datadog, or Grafana Loki.
