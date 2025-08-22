from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, Float, ForeignKey, JSON, Integer
from datetime import datetime
import uuid

class Base(DeclarativeBase):
    pass

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # celery task id
    status: Mapped[str] = mapped_column(String(32), default="PENDING")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str | None] = mapped_column(String(512))
    briefing_id: Mapped[str | None] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Briefing(Base):
    __tablename__ = "briefings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    video_src: Mapped[str] = mapped_column(String(512))
    duration_s: Mapped[int] = mapped_column(Integer)
    slice_len_s: Mapped[int] = mapped_column(Integer)
    scores: Mapped[dict] = mapped_column(JSON)
    highlights: Mapped[list] = mapped_column(JSON)
    volatility: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    slices: Mapped[list['Slice']] = relationship(back_populates="briefing", cascade="all, delete-orphan")

class Slice(Base):
    __tablename__ = "slices"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    briefing_id: Mapped[str] = mapped_column(ForeignKey("briefings.id"))
    t_start: Mapped[int] = mapped_column(Integer)
    t_end: Mapped[int] = mapped_column(Integer)
    transcript: Mapped[str] = mapped_column(String)
    metrics: Mapped[dict] = mapped_column(JSON)
    risk_tags: Mapped[list] = mapped_column(JSON)
    thumbnails: Mapped[list] = mapped_column(JSON)
    au: Mapped[dict] = mapped_column(JSON)

    briefing: Mapped[Briefing] = relationship(back_populates="slices")
