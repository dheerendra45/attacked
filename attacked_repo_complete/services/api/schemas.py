from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: int
    error: Optional[str] = None
    briefing_id: Optional[str] = None

class BriefingOut(BaseModel):
    id: str
    video_src: str
    duration_s: int
    slice_len_s: int
    scores: Dict[str, float]
    highlights: List[Dict[str, Any]]
    volatility: Dict[str, float]
    created_at: str

class SliceOut(BaseModel):
    slice_id: str
    t_start: int
    t_end: int
    transcript: str
    metrics: Dict[str, Any]
    risk_tags: List[str]
    thumbnails: List[str]
    au: Dict[str, float]
