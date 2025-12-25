# Development Environment Setup Guide

**Project**: Long COVID Risk Assessment System (LCRAS)
**Version**: 1.0
**Last Updated**: 2025-12-25

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Structure](#repository-structure)
3. [Backend Setup (FastAPI)](#backend-setup-fastapi)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Database Setup (PostgreSQL)](#database-setup-postgresql)
6. [Running the Full Stack](#running-the-full-stack)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Git**: 2.30+
- **Python**: 3.10+ (conda recommended)
- **Node.js**: 18+ LTS
- **PostgreSQL**: 14+
- **Docker**: 20+ (optional but recommended)
- **Docker Compose**: 1.29+ (optional)

### Recommended Tools

- **VS Code** with extensions:
  - Python (Microsoft)
  - Pylance
  - Prettier
  - ESLint
  - GitLens
  - Thunder Client (API testing)
- **PostgreSQL Client**: pgAdmin 4 or DBeaver
- **API Testing**: Postman or Insomnia

---

## Repository Structure

```
s2y-batches/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── api/               # API routers
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── risk.py
│   │   │   │   ├── symptom.py
│   │   │   │   ├── batch.py
│   │   │   │   └── analytics.py
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── batch.py
│   │   │   ├── adverse_event.py
│   │   │   └── symptom.py
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── risk.py
│   │   │   └── batch.py
│   │   ├── services/          # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── risk_assessment.py
│   │   │   ├── symptom_pattern.py
│   │   │   └── ml_model.py
│   │   ├── ml/                # ML models
│   │   │   ├── __init__.py
│   │   │   ├── risk_scorer.py
│   │   │   ├── clustering.py
│   │   │   └── association_rules.py
│   │   ├── db/                # Database utilities
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   └── utils/             # Helper functions
│   │       ├── __init__.py
│   │       └── cache.py
│   ├── tests/                 # Backend tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   └── test_services/
│   ├── alembic/               # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt       # Python dependencies
│   ├── requirements-dev.txt   # Development dependencies
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components/        # Reusable components
│   │   │   ├── RiskScoreCard.tsx
│   │   │   ├── SymptomClusterView.tsx
│   │   │   └── NetworkGraph.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── RiskAssessment.tsx
│   │   │   └── SymptomPatterns.tsx
│   │   ├── services/          # API client
│   │   │   ├── api.ts
│   │   │   ├── risk.ts
│   │   │   └── symptom.ts
│   │   ├── store/             # Redux store
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Helper functions
│   │   └── types/             # TypeScript types
│   ├── tests/                 # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── README.md
│
├── notebooks/                  # Jupyter notebooks (DS work)
│   ├── 01_EDA_VAERS_LongCovid.ipynb
│   ├── 02_Feature_Engineering.ipynb
│   ├── 03_Baseline_Models.ipynb
│   └── 04_Clustering_Analysis.ipynb
│
├── data/                       # Data files (gitignored)
│   ├── raw/                   # Raw VAERS CSV files
│   ├── processed/             # Processed datasets
│   └── models/                # Trained ML models
│
├── docs/                       # Documentation
│   ├── api/
│   │   └── openapi.yaml
│   ├── architecture/
│   │   ├── ARCHITECTURE.md
│   │   └── database_schema.sql
│   ├── requirements/
│   │   └── PRD_LongCovid_v1.md
│   ├── sprints/
│   │   └── SPRINT_1_TASKS.md
│   └── multi-agent/
│       └── AGENT_KICKOFF.md
│
├── docker-compose.yml          # Multi-container orchestration
├── .gitignore
├── README.md
└── DEVELOPMENT_SETUP.md        # This file
```

---

## Backend Setup (FastAPI)

### Step 1: Create Conda Environment

```bash
# Navigate to project root
cd s2y-batches

# Create conda environment for backend
conda create -n lcras-backend python=3.10 -y
conda activate lcras-backend

# Install Python dependencies
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Step 2: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**`.env` file contents:**

```env
# Database
DATABASE_URL=postgresql://lcras_user:lcras_pass@localhost:5432/lcras_db

# Redis
REDIS_URL=redis://localhost:6379/0

# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=LCRAS API
DEBUG=True

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# ML Models
MODEL_PATH=../data/models
```

### Step 3: Initialize Database

```bash
# Apply database schema
psql -U lcras_user -d lcras_db -f ../docs/architecture/database_schema.sql

# Initialize Alembic (if using migrations)
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Step 4: Run Backend Server

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Makefile (if provided)
make run

# Access API docs
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Step 5: Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api/test_risk.py -v
```

---

## Frontend Setup (React)

### Step 1: Install Node Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### Step 2: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env
nano .env
```

**`.env` file contents:**

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# App Settings
VITE_APP_NAME=LCRAS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
```

### Step 3: Run Frontend Development Server

```bash
# Start Vite dev server
npm run dev

# Or using yarn
yarn dev

# Access frontend
# http://localhost:3000
```

### Step 4: Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Step 5: Run Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

---

## Database Setup (PostgreSQL)

### Option 1: Local PostgreSQL Installation

#### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database and user
createdb lcras_db
psql lcras_db

# In psql:
CREATE USER lcras_user WITH PASSWORD 'lcras_pass';
GRANT ALL PRIVILEGES ON DATABASE lcras_db TO lcras_user;
\q
```

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In psql:
CREATE DATABASE lcras_db;
CREATE USER lcras_user WITH PASSWORD 'lcras_pass';
GRANT ALL PRIVILEGES ON DATABASE lcras_db TO lcras_user;
\q
```

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name lcras-postgres \
  -e POSTGRES_DB=lcras_db \
  -e POSTGRES_USER=lcras_user \
  -e POSTGRES_PASSWORD=lcras_pass \
  -p 5432:5432 \
  -v lcras_pgdata:/var/lib/postgresql/data \
  -d postgres:14
```

### Apply Database Schema

```bash
# Apply schema from SQL file
psql -U lcras_user -d lcras_db -h localhost -f docs/architecture/database_schema.sql

# Verify tables created
psql -U lcras_user -d lcras_db -h localhost -c "\dt"
```

### Redis Setup

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run --name lcras-redis -p 6379:6379 -d redis:7-alpine
```

---

## Running the Full Stack

### Option 1: Manual (Multiple Terminals)

**Terminal 1 - Database:**
```bash
# If using Docker
docker start lcras-postgres
docker start lcras-redis
```

**Terminal 2 - Backend:**
```bash
conda activate lcras-backend
cd backend
uvicorn app.main:app --reload
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: lcras-postgres
    environment:
      POSTGRES_DB: lcras_db
      POSTGRES_USER: lcras_user
      POSTGRES_PASSWORD: lcras_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docs/architecture/database_schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    container_name: lcras-redis
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: lcras-backend
    environment:
      DATABASE_URL: postgresql://lcras_user:lcras_pass@postgres:5432/lcras_db
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./data:/data
    depends_on:
      - postgres
      - redis
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    container_name: lcras-frontend
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Run with Docker Compose:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/us-001-risk-score
   ```

3. **Start development environment:**
   ```bash
   docker-compose up -d
   # Or manually start services
   ```

4. **Make changes and test:**
   ```bash
   # Backend tests
   cd backend && pytest

   # Frontend tests
   cd frontend && npm test
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat(risk): add risk score calculation endpoint"
   ```

6. **Push and create PR:**
   ```bash
   git push origin feature/us-001-risk-score
   # Create PR on GitHub
   ```

### Code Quality Checks

#### Backend (Python)

```bash
# Format with black
black app/

# Lint with flake8
flake8 app/

# Type checking with mypy
mypy app/

# Sort imports
isort app/
```

#### Frontend (TypeScript/React)

```bash
# Format with prettier
npm run format

# Lint with ESLint
npm run lint

# Type checking
npm run type-check
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add user_preferences table"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
# Or
sudo systemctl status postgresql

# Check connection string in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

#### 2. Port Already in Use

**Error:** `Address already in use: 8000`

**Solution:**
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

#### 3. Module Import Errors (Backend)

**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```bash
# Ensure conda environment is activated
conda activate lcras-backend

# Reinstall dependencies
pip install -r requirements.txt

# Add project root to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

#### 4. Frontend API Connection Errors

**Error:** `Network Error` or `CORS policy`

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS settings in backend/.env
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Check frontend .env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### 5. Docker Compose Build Failures

**Error:** `failed to solve with frontend dockerfile.v0`

**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
```

### Getting Help

- **GitHub Issues**: https://github.com/your-org/s2y-batches/issues
- **Sprint Documentation**: `docs/sprints/`
- **Architecture Docs**: `docs/architecture/ARCHITECTURE.md`
- **API Docs**: http://localhost:8000/docs (when backend running)

---

## Next Steps

Once your development environment is set up:

1. ✅ Verify all services are running
2. ✅ Access API docs at http://localhost:8000/docs
3. ✅ Access frontend at http://localhost:3000
4. ✅ Run test suites to ensure everything works
5. ⏳ Start working on Sprint 1 tasks (see `docs/sprints/SPRINT_1_TASKS.md`)
6. ⏳ Follow Git workflow and code quality guidelines

**Happy Coding! 🚀**

---

**Last Updated**: 2025-12-25
**Maintainer**: Arch-Agent, Ops-Agent
**Version**: 1.0
