# LCRAS Backend API

FastAPI backend for Long COVID Risk Assessment System.

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### 3. Run Development Server

```bash
# Start server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── batch.py       # Batch endpoints
│   │       └── risk.py        # Risk assessment endpoints
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   ├── db/                    # Database utilities
│   ├── config.py              # Configuration
│   └── main.py                # FastAPI app entry point
├── tests/                     # Tests
├── requirements.txt           # Dependencies
└── .env.example               # Environment template
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Batch Endpoints
- `GET /api/v1/batch/search` - Search batches with filters
- `GET /api/v1/batch/{batch_code}` - Get batch details
- `GET /api/v1/batch/{batch_code}/top-symptoms` - Top symptoms for batch

### Risk Assessment Endpoints
- `POST /api/v1/risk/assess` - Calculate personalized risk score
- `GET /api/v1/risk/batch/{batch_code}` - Get batch risk statistics

## Development

### Run Tests

```bash
pytest tests/ -v
```

### Code Formatting

```bash
black app/
isort app/
```

### Type Checking

```bash
mypy app/
```

## Database Setup

See `docs/architecture/database_schema.sql` for complete schema.

```bash
# Apply schema
psql -U lcras_user -d lcras_db -f ../docs/architecture/database_schema.sql
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `DEBUG`: Enable debug mode (True/False)
- `BACKEND_CORS_ORIGINS`: Allowed origins for CORS

## Sprint 2 Status

✅ Project structure initialized
✅ SQLAlchemy models (Batch, AdverseEvent, Symptom)
✅ Pydantic schemas (BatchResponse, RiskAssessmentRequest, etc.)
✅ Health check endpoint
✅ Batch search and details endpoints
✅ Risk assessment endpoint (simplified logic)

⏳ Full ML model integration (Sprint 3)
⏳ Caching with Redis (Sprint 3)
⏳ Rate limiting (Sprint 3)
⏳ Authentication (Sprint 4)

## License

MIT
