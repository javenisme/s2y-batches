"""Batch model."""

from sqlalchemy import Column, String, Integer, Numeric, Date, TIMESTAMP, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Batch(Base):
    """Vaccine batch model."""

    __tablename__ = "batches"

    # Primary key
    batch_code = Column(String(50), primary_key=True, index=True)

    # Basic information
    manufacturer = Column(String(100), nullable=False, index=True)
    vaccine_type = Column(String(50), nullable=False, default="COVID-19")

    # Aggregate counts
    total_reports = Column(Integer, nullable=False, default=0)
    deaths = Column(Integer, nullable=False, default=0)
    disabilities = Column(Integer, nullable=False, default=0)
    life_threatening = Column(Integer, nullable=False, default=0)
    hospitalizations = Column(Integer, nullable=False, default=0)
    er_visits = Column(Integer, nullable=False, default=0)

    # Calculated percentages
    severe_reports_pct = Column(Numeric(5, 2))
    lethality_pct = Column(Numeric(5, 2))

    # ML-generated risk score
    risk_score = Column(Numeric(5, 2), index=True)
    risk_level = Column(String(20))  # 'Low', 'Medium', 'High'

    # Temporal information
    first_report_date = Column(Date)
    last_report_date = Column(Date)

    # Geographic distribution (JSONB)
    country_distribution = Column(JSONB)
    state_distribution = Column(JSONB)

    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    adverse_events = relationship(
        "AdverseEvent",
        back_populates="batch",
        cascade="all, delete-orphan",
    )

    # Indexes (defined in schema.sql, documented here)
    __table_args__ = (
        Index("idx_batches_manufacturer", "manufacturer"),
        Index("idx_batches_risk_score", "risk_score"),
        Index("idx_batches_report_dates", "first_report_date", "last_report_date"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Batch(batch_code='{self.batch_code}', manufacturer='{self.manufacturer}', risk_score={self.risk_score})>"

    @property
    def severe_events(self) -> int:
        """Calculate total severe events."""
        return (
            self.deaths + self.disabilities + self.life_threatening + self.hospitalizations
        )

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "batch_code": self.batch_code,
            "manufacturer": self.manufacturer,
            "vaccine_type": self.vaccine_type,
            "total_reports": self.total_reports,
            "deaths": self.deaths,
            "disabilities": self.disabilities,
            "life_threatening": self.life_threatening,
            "hospitalizations": self.hospitalizations,
            "severe_reports_pct": float(self.severe_reports_pct) if self.severe_reports_pct else None,
            "lethality_pct": float(self.lethality_pct) if self.lethality_pct else None,
            "risk_score": float(self.risk_score) if self.risk_score else None,
            "risk_level": self.risk_level,
            "first_report_date": self.first_report_date.isoformat() if self.first_report_date else None,
            "last_report_date": self.last_report_date.isoformat() if self.last_report_date else None,
            "country_distribution": self.country_distribution,
            "state_distribution": self.state_distribution,
        }
