# Attacked.ai — Full Stack Reference (Backend + Frontend)

A containerized platform for **Briefing Failure Index (BFI)** analysis: ingest videos, slice them, analyze, store results, and provide a web frontend for visualization.

**Stack:** FastAPI • Celery • Redis • Postgres • MinIO • React • TypeScript • Vite • Tailwind CSS • ffmpeg • Vosk • librosa/pyworld • OpenCV

> One-command run: `docker compose up`  
> Offline-first: uses open-source defaults; optional vendor plugins enabled via `.env`.

---

## Features

### Backend (BFI Engine)
- **Ingest**: Video URL or local upload
- **Slice & Analyze**: Compute scores (content, delivery, impact) and **Briefing Failure Index**
- **Store Results**: Postgres + MinIO
- **API Endpoints**:
  - `POST /v1/jobs` → submit video for processing
  - `GET /v1/jobs/{job_id}` → check job status
  - `GET /v1/briefings` → list briefings for dashboard
  - `GET /v1/briefings/{id}` → full briefing details
  - `GET /v1/briefings/{id}/slices` → slice-level analysis
  - `GET /v1/health` → API health
- **Deterministic Scoring** — fixed seeds for reproducibility
- **Privacy & Safety** — token redaction, retention policies
- **Unit Tests** — jargon ratio, risk phrase detection, aggregator
- **Sample Run** — `scripts/ingest_sample.sh`
- **Tiny Dashboard** — `/` serves a static page with briefings and top risks

### Frontend (BFI Dashboard)
- **Dashboard**: Stats overview, recent briefings
- **Upload**: File or URL upload with real-time polling
- **Briefings**: List, filter, search all briefings
- **Briefing Details**: Scores, highlights, volatility
- **Slices**: Slice-level analysis with transcript search
- **Settings**: Polling intervals and theme preferences
- **Dark Mode**: Full light/dark/system support
- **Responsive**: Mobile-first, works on all devices
- **Accessible**: WCAG compliant, keyboard navigation, screen reader support

---

## Quick Start (Local with Docker Compose)

### Prerequisites
- Docker + Docker Compose
- ~4–6 GB free disk (models + images)
- Node.js 18+ and npm/yarn (for frontend dev)

### 1. Clone and prepare env
```bash
git clone <repository-url>
cd attacked
cp .env.example .env
# Optional: edit .env to set external model paths or vendor keys
