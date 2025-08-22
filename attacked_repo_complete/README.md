# Attacked.ai — Backend AI Developer Packaging (Reference Implementation)

A containerized backend service that ingests briefing videos, slices them, analyzes them against the **Briefing Failure Index (BFI)**, stores results, and exposes a versioned REST API with a tiny dashboard.

**Stack:** FastAPI • Celery • Redis • Postgres • MinIO • ffmpeg • Vosk • librosa/pyworld • OpenCV

> One-command run: `docker compose up`  
> Offline-first: uses open-source defaults; optional vendor plugins enabled via `.env`.

---

## 0) Features & Acceptance Criteria Mapping

- **API contract**
  - `POST /v1/jobs` (video URL or file upload) → `{ job_id }`
  - `GET /v1/jobs/{job_id}` → status, progress %, errors
  - `GET /v1/briefings/{id}` → briefing-level JSON (scores, flags, timeline)
  - `GET /v1/briefings/{id}/slices` → slice-level metrics list
  - `GET /v1/briefings` → (extra) list briefings for dashboard
  - `GET /v1/health` → liveness/readiness
- **Deterministic scoring** — fixed seeds across all modules
- **Unit tests** — jargon ratio, risk phrase detector, aggregator
- **Sample run** — scripted `scripts/ingest_sample.sh`
- **Privacy & safety** — token redaction in logs, retention toggles in `configs/default.yml`
- **Docs** — this README + MODEL_CARD + vendor_plugins
- **Tiny dashboard** — `/` serves a static page that lists briefings and top risks

---

## 1) Quickstart (Local with Docker Compose)

### Prereqs
- Docker + Docker Compose
- ~4–6 GB free disk (models + images)

### 1. Clone and prepare env
```bash
cp .env.example .env
# (Optional) edit .env to set external model paths or vendor keys
```

### 2. (Optional) Download offline models
```bash
bash scripts/download_models.sh
# This fetches a small Vosk EN model into ./sample_data/models/vosk
```

### 3. Launch the stack
```bash
docker compose up --build
```
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- Tiny dashboard: http://localhost:8000/
- MinIO: http://localhost:9001  (admin: `minioadmin` / password in `.env`)
- Postgres: on service `postgres:5432` (see `.env`)

### 4. Run a sample job
- Place a short `.mp4` in `sample_data/clips/briefing.mp4` (or edit URL in the script)
```bash
bash scripts/ingest_sample.sh
# Prints job id, polls status, then fetches briefing JSON
```

---

## 2) Directory Overview

```
services/api       # FastAPI app + Celery entrypoints + SQLAlchemy models
services/analyzer  # Modular pipeline (media, asr, nlp, delivery, impact, aggregation)
configs            # Runtime config (YAML)
scripts            # Utilities for ingestion & model downloads
tests              # Unit tests (pytest)
sample_data        # Clips and golden JSON for regression/demo
```

---

## 3) API Reference (v1)

### POST /v1/jobs
Submit a video for analysis.

**Body options:**
- JSON: `{ "video_url": "https://.../file.mp4" }`
- Multipart: `file=@/path/to/local.mp4`

**Response:** `{ "job_id": "celery-task-id" }`

### GET /v1/jobs/{job_id}
Returns `{ status, progress, error, briefing_id? }`.

### GET /v1/briefings
List basic metadata of processed briefings (for dashboard).

### GET /v1/briefings/{id}
Full briefing-level object (composite + layer scores, volatility, highlights).

### GET /v1/briefings/{id}/slices
Array of slice objects (metrics, transcripts, risk tags, thumbnails).

### GET /v1/health
`{"status":"ok"}` when all dependencies reachable.

---

## 4) Operational Notes

- **Determinism**: seeds set in `services/analyzer/utils.py` and used across modules.
- **Retention**: configure `RESULT_TTL_DAYS` and `PURGE_MEDIA` in `configs/default.yml`.
- **Object storage**: artifacts saved to MinIO bucket `attacked-artifacts/` (prefix by briefing id).
- **Observability**: structured logs with trace ids; sensitive strings redacted.
- **Offline/Online**: defaults to Vosk + simple vision; you can enable Hume/Deepgram via `.env`.

---

## 5) Development

```bash
# Lint & tests inside containers
docker compose exec api pytest -q

# Rebuild after code changes
docker compose build api worker && docker compose up -d api worker
```

---

## 6) Security & Privacy
- Logs redact tokens/URLs; no PII beyond supplied media.
- Abuse policy in MODEL_CARD.md; **not** a lie detector; use results responsibly.

---

## 7) License
MIT (placeholder). Replace per your needs.
