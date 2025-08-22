from .celery_app import celery_app
import uuid
import os
from pathlib import Path
from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import Briefing, Job, Slice
import logging

# Analyzer modules
from analyzer.media_prep import slice_video, prepare_slice
from analyzer.asr import transcribe as asr_transcribe
from analyzer.nlp_metrics import score_content, detect_risks
from analyzer.delivery_metrics import score_delivery, estimate_nonverbal
from analyzer.impact_metrics import score_impact, detect_media_risks
from analyzer.aggregation import aggregate_briefing

logger = logging.getLogger(__name__)


@celery_app.task(name="api.tasks.process_briefing", bind=True)
def process_briefing(self, local_path: str, object_key: str | None = None, slice_len: int = 45):
    """
    Complete BFI pipeline processing task
    """
    try:
        # Resolve job id from Celery task context
        job_id = getattr(self.request, "id", None)

        # Open DB session
        db: Session = SessionLocal()

        # Update job status to processing
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise Exception(f"Job {job_id} not found")

        # Update job progress
        job.status = "PROCESSING"
        job.progress = 0
        db.commit()

        logger.info(f"Starting processing for job {job_id}, file: {local_path}")

        # 1. Load and validate video file
        self.update_state(state="PROCESSING", meta={"progress": 10, "step": "Loading video"})
        if not os.path.exists(local_path):
            raise Exception(f"Video file not found: {local_path}")

        job.progress = 10
        db.commit()

        # 2. Slice media
        self.update_state(state="PROCESSING", meta={"progress": 20, "step": "Slicing media"})
        slices_meta = slice_video(local_path, slice_len=slice_len)

        job.progress = 20
        db.commit()

        job.progress = 30
        db.commit()

        # 3. Process each slice through the pipeline
        self.update_state(state="PROCESSING", meta={"progress": 40, "step": "Analyzing content"})
        results = []
        total = max(1, len(slices_meta))
        for i, sm in enumerate(slices_meta):
            # Prepare slice: extract wav + thumbnail
            wav_path, thumbnails = prepare_slice(sm)

            # ASR - extract transcript (graceful fallback if model missing)
            try:
                transcript, _words = asr_transcribe(wav_path)
            except Exception as e:
                logger.warning(f"ASR failed for slice {i}: {e}; using empty transcript")
                transcript = ""

            # NLP - analyze content
            content_scores = score_content(transcript)

            # Delivery - analyze audio/visual delivery
            delivery_scores = score_delivery(wav_path, transcript)
            nonverbal = estimate_nonverbal(sm["video_path"])  # simple motion proxy

            # Impact - analyze potential impact
            impact_scores = score_impact(transcript, content_scores, delivery_scores)

            # Risk tags (union of NLP + media-sensitive)
            risk_tags = sorted(list(set(detect_risks(transcript) + detect_media_risks(transcript))))

            # Accumulate for aggregation and later DB persistence
            results.append({
                "idx": sm["idx"],
                "t_start": sm["t_start"],
                "t_end": sm["t_end"],
                "transcript": transcript,
                "metrics": {
                    "content": content_scores,
                    "delivery": {**delivery_scores},
                    "impact": impact_scores,
                },
                "risk_tags": risk_tags,
                "thumbnails": thumbnails,
                "au": nonverbal,
            })

            # Update progress
            progress = 40 + int((i + 1) / total * 40)
            job.progress = min(progress, 80)
            db.commit()

        # 4. Aggregate results
        self.update_state(state="PROCESSING", meta={"progress": 85, "step": "Aggregating results"})
        agg = aggregate_briefing(results, slice_len_s=slice_len)

        job.progress = 90
        db.commit()

        # 5. Create briefing record
        briefing = Briefing(
            video_src=local_path,
            duration_s=int(agg.get("duration_s", 0)),
            slice_len_s=int(slice_len),
            scores=agg.get("scores", {}),
            highlights=agg.get("highlights", []),
            volatility=agg.get("volatility", {}),
        )
        db.add(briefing)
        db.commit()

        # 6. Persist slices
        for r in results:
            srow = Slice(
                briefing_id=briefing.id,
                t_start=int(r["t_start"]),
                t_end=int(r["t_end"]),
                transcript=r["transcript"],
                metrics=r["metrics"],
                risk_tags=r["risk_tags"],
                thumbnails=r["thumbnails"],
                au=r["au"],
            )
            db.add(srow)
        db.commit()

        # 7. Update job with briefing_id
        job.status = "SUCCESS"
        job.progress = 100
        job.briefing_id = briefing.id
        db.commit()

        logger.info(f"Successfully processed job {job_id}, created briefing {briefing.id}")

        return {
            "ok": True,
            "briefing_id": briefing.id,
            "slices_processed": len(results),
            "duration": int(agg.get('duration_s', 0)),
        }

    except Exception as e:
        logger.error(f"Processing failed for job {job_id}: {str(e)}")

        # Update job with error
        try:
            job.status = "FAILURE"
            job.error = str(e)
            db.commit()
        except Exception:
            pass

        # Re-raise for Celery
        raise e


def _mock_processing(self, job_id: str, local_path: str, db: Session):
    """
    Mock processing when analyzer modules aren't available
    """
    import json
    import time

    # Simulate processing time
    time.sleep(2)

    # Create mock briefing
    briefing_id = str(uuid.uuid4())
    briefing = Briefing(
        id=briefing_id,
        video_src=local_path,
        duration_s=30,
        slice_len_s=30,
        scores={
            "composite": 0.75,
            "content": {"score": 0.8, "jargon_ratio": 0.15},
            "delivery": {"score": 0.7, "tone": "professional"},
            "impact": {"score": 0.75, "risk_level": "medium"}
        },
        highlights=[{"timestamp": 15, "text": "Key point identified", "risk": "medium"}],
        volatility={"trend": "stable", "variance": 0.1}
    )

    db.add(briefing)

    # Update job
    job = db.query(Job).filter(Job.id == job_id).first()
    job.status = "COMPLETED"
    job.progress = 100
    job.briefing_id = briefing_id

    db.commit()

    return {
        "ok": True,
        "briefing_id": briefing_id,
        "note": "Mock processing - analyzer modules not available"
    }