"""Symptom model."""

from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, Index, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Symptom(Base):
    """Symptom model."""

    __tablename__ = "symptoms"

    # Primary key
    id = Column(BigInteger, primary_key=True, index=True)

    # Foreign key to adverse event
    event_id = Column(
        BigInteger,
        ForeignKey("adverse_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Symptom information
    symptom_name = Column(String(200), nullable=False, index=True)
    symptom_category = Column(String(50), index=True)  # Neurological, Cardiovascular, etc.
    severity_level = Column(String(20))  # Mild, Moderate, Severe
    symptom_order = Column(Integer)  # 1st, 2nd, 3rd symptom reported

    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    event = relationship("AdverseEvent", back_populates="symptoms")

    # Indexes
    __table_args__ = (
        Index("idx_symptoms_event_id", "event_id"),
        Index("idx_symptoms_name", "symptom_name"),
        Index("idx_symptoms_category", "symptom_category"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Symptom(id={self.id}, event_id={self.event_id}, name='{self.symptom_name}')>"

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "event_id": self.event_id,
            "symptom_name": self.symptom_name,
            "symptom_category": self.symptom_category,
            "severity_level": self.severity_level,
            "symptom_order": self.symptom_order,
        }
