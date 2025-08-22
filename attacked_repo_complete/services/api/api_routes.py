from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from .db import SessionLocal
from . import models
from .schemas import JobStatus, BriefingOut, SliceOut
from .tasks import process_briefing
from .config import settings
from datetime import datetime
import os, shutil, uuid, httpx

router = APIRouter(prefix="/v1")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/jobs")
def create_job(video_url: str | None = None, file: UploadFile | None = File(default=None), db: Session = Depends(get_db)):
    if not video_url and not file:
        raise HTTPException(400, detail="Provide video_url or upload a file")
    job_id = str(uuid.uuid4())
    job = models.Job(id=job_id, status="PENDING", progress=0)
    db.add(job); db.commit()

    # Persist local temp and schedule task
    os.makedirs("/tmp/attacked", exist_ok=True)
    slice_len = 45
    if file:
        local_path = f"/tmp/attacked/{job_id}_{file.filename}"
        with open(local_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        key = f"uploads/{job_id}/{file.filename}"
    else:
        local_path = f"/tmp/attacked/{job_id}.mp4"
        with httpx.stream("GET", video_url, follow_redirects=True, timeout=60) as r:
            r.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
        key = f"uploads/{job_id}/remote.mp4"

    # Enqueue
    process_briefing.apply_async(args=[local_path, key, slice_len], task_id=job_id)
    return {"job_id": job_id}

@router.get("/jobs/{job_id}")
def job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(404, detail="job not found")
    return JobStatus(job_id=job.id, status=job.status, progress=job.progress, error=job.error, briefing_id=job.briefing_id)

@router.get("/briefings")
def list_briefings(db: Session = Depends(get_db)):
    q = db.query(models.Briefing).order_by(models.Briefing.created_at.desc()).limit(50)
    return [
        {
            "id": b.id,
            "video_src": b.video_src,
            "scores": b.scores,
            "created_at": b.created_at.isoformat()+"Z",
        } for b in q.all()
    ]

@router.get("/briefings/{briefing_id}")
def get_briefing(briefing_id: str, db: Session = Depends(get_db)):
    b = db.get(models.Briefing, briefing_id)
    if not b:
        raise HTTPException(404, detail="not found")
    return BriefingOut(
        id=b.id, video_src=b.video_src, duration_s=b.duration_s, slice_len_s=b.slice_len_s,
        scores=b.scores, highlights=b.highlights, volatility=b.volatility,
        created_at=b.created_at.isoformat()+"Z",
    )

@router.get("/briefings/{briefing_id}/slices")
def get_slices(briefing_id: str, db: Session = Depends(get_db)):
    rows = db.query(models.Slice).filter(models.Slice.briefing_id==briefing_id).order_by(models.Slice.t_start).all()
    return [
        {
            "slice_id": s.id,
            "t_start": s.t_start,
            "t_end": s.t_end,
            "transcript": s.transcript,
            "metrics": s.metrics,
            "risk_tags": s.risk_tags,
            "thumbnails": s.thumbnails,
            "au": s.au,
        } for s in rows
    ]

@router.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()+"Z"}
