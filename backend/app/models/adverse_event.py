"""Adverse event model."""

from sqlalchemy import Column, String, Integer, Boolean, Date, TIMESTAMP, Text, ForeignKey, Numeric, Index, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class AdverseEvent(Base):
    """Adverse event report model."""

    __tablename__ = "adverse_events"

    # Primary key
    id = Column(BigInteger, primary_key=True, index=True)
    vaers_id = Column(Integer, unique=True, nullable=False, index=True)

    # Foreign key to batch
    batch_code = Column(
        String(50),
        ForeignKey("batches.batch_code", ondelete="CASCADE"),
        index=True,
    )

    # Patient demographics
    age = Column(Integer)
    sex = Column(String(1))  # M, F, U
    state = Column(String(2))
    country = Column(String(3), default="USA")

    # Severity flags
    died = Column(Boolean, default=False, index=True)
    disabled = Column(Boolean, default=False)
    life_threatening = Column(Boolean, default=False)
    hospitalized = Column(Boolean, default=False)
    er_visit = Column(Boolean, default=False)

    # Temporal information
    vaccination_date = Column(Date)
    symptom_onset_date = Column(Date)
    onset_days = Column(Integer)  # Days from vaccination to symptom onset
    report_date = Column(Date, nullable=False, index=True)

    # Text fields
    symptom_text = Column(Text)
    medical_history = Column(Text)
    allergies = Column(Text)
    current_medications = Column(Text)

    # Severity score (calculated or ML-predicted)
    severity_score = Column(Numeric(5, 2))

    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    batch = relationship("Batch", back_populates="adverse_events")
    symptoms = relationship(
        "Symptom",
        back_populates="event",
        cascade="all, delete-orphan",
    )

    # Indexes
    __table_args__ = (
        Index("idx_ae_batch_code", "batch_code"),
        Index("idx_ae_report_date", "report_date"),
        Index("idx_ae_severity_flags", "died", "disabled", "life_threatening", "hospitalized"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<AdverseEvent(id={self.id}, vaers_id={self.vaers_id}, batch_code='{self.batch_code}')>"

    @property
    def is_severe(self) -> bool:
        """Check if event is severe."""
        return self.died or self.disabled or self.life_threatening or self.hospitalized

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "vaers_id": self.vaers_id,
            "batch_code": self.batch_code,
            "age": self.age,
            "sex": self.sex,
            "state": self.state,
            "country": self.country,
            "died": self.died,
            "disabled": self.disabled,
            "life_threatening": self.life_threatening,
            "hospitalized": self.hospitalized,
            "er_visit": self.er_visit,
            "vaccination_date": self.vaccination_date.isoformat() if self.vaccination_date else None,
            "symptom_onset_date": self.symptom_onset_date.isoformat() if self.symptom_onset_date else None,
            "onset_days": self.onset_days,
            "report_date": self.report_date.isoformat() if self.report_date else None,
            "severity_score": float(self.severity_score) if self.severity_score else None,
        }
