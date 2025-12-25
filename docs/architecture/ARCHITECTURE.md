# Long COVID Risk Assessment System - Architecture Design

**Version**: 1.0
**Date**: 2025-12-25
**Author**: Arch-Agent
**Status**: Sprint 1 - Design Phase

---

## Executive Summary

This document defines the system architecture for the Long COVID Risk Assessment System (LCRAS), a data-driven platform that provides personalized risk assessments and symptom pattern analysis based on VAERS vaccine batch data.

**Key Design Principles**:
- **Scalability**: Handle 10,000+ monthly active users
- **Performance**: P95 API response < 200ms
- **Modularity**: Microservices-ready architecture
- **Data-Driven**: ML-powered insights and predictions
- **User-Centric**: Fast, intuitive, mobile-responsive UI

---

## 1. System Overview

### 1.1 High-Level Architecture (C4 Level 1: System Context)

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  VAERS   │  │  Google  │  │ Medical  │  │  Analytics  │ │
│  │ Database │  │Analytics │  │Literature│  │   Services  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└───────┼─────────────┼─────────────┼────────────────┼────────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌────────────────────────────────────────────────────────────┐
│         Long COVID Risk Assessment System (LCRAS)          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Web UI    │  │  Mobile UI  │  │  Public API     │   │
│  │   (React)   │  │  (Future)   │  │  (REST/GraphQL) │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐              │
│         │     Backend Services (FastAPI)     │              │
│         │  - Risk Assessment Service         │              │
│         │  - Symptom Analysis Service        │              │
│         │  - ML Model Service                │              │
│         │  - Data ETL Service                │              │
│         └─────────────────┬─────────────────┘              │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐              │
│         │         Data Layer                 │              │
│         │  ┌──────────┐    ┌──────────────┐ │              │
│         │  │PostgreSQL│    │  Redis Cache │ │              │
│         │  │ Database │    │              │ │              │
│         │  └──────────┘    └──────────────┘ │              │
│         └───────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                End Users & Stakeholders                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐│
│  │ Vaccine  │  │ Medical  │  │Research  │  │  Public     ││
│  │Recipients│  │Personnel │  │Scientists│  │  Health     ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit / React Query
- **UI Library**: Material-UI (MUI) / Ant Design
- **Charts**: Chart.js, D3.js (for network graphs)
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library

#### Backend
- **Framework**: FastAPI (Python 3.10+)
- **API Docs**: OpenAPI/Swagger automatic generation
- **Async Runtime**: uvicorn with async/await
- **Authentication**: JWT tokens
- **Validation**: Pydantic models

#### Data & ML
- **Database**: PostgreSQL 14+ with TimescaleDB extension
- **Cache**: Redis 7+
- **ML Framework**: scikit-learn, XGBoost, PyTorch
- **Data Processing**: pandas, numpy
- **Feature Store**: Feast (optional, future)

#### Infrastructure
- **Deployment**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages (frontend) + Cloud Run/Railway (backend)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging (JSON) with ELK stack

---

## 2. Component Architecture (C4 Level 2: Container Diagram)

### 2.1 Frontend Container

```
┌───────────────────────────────────────────────────────────┐
│              React Frontend Application                    │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Pages & Routes                          │ │
│  │  /              - Home & Batch Lookup               │ │
│  │  /risk          - Risk Assessment Dashboard         │ │
│  │  /patterns      - Symptom Pattern Explorer          │ │
│  │  /network       - Symptom Network Visualization     │ │
│  │  /compare       - Batch Comparison Tool             │ │
│  └───────────────────────────��─────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Components Layer                        │ │
│  │  - RiskScoreCard                                    │ │
│  │  - SymptomClusterView                               │ │
│  │  - TimelineChart                                    │ │
│  │  - NetworkGraph                                     │ │
│  │  - BatchComparison                                  │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              State Management                        │ │
│  │  - Redux Store (global state)                       │ │
│  │  - React Query (server state cache)                │ │
│  │  - Context API (theme, user prefs)                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Client Layer                        │ │
│  │  - Axios instance with interceptors                │ │
│  │  - API service modules (risk, symptom, batch)      │ │
│  │  - Error handling & retry logic                    │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/JSON
                            ▼
              ┌─────────────────────────┐
              │   Backend API Gateway   │
              └─────────────────────────┘
```

### 2.2 Backend Container

```
┌───────────────────────────────────────────────────────────┐
│              FastAPI Backend Application                   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Layer (Routers)                     │ │
│  │  /api/v1/risk      - Risk assessment endpoints      │ │
│  │  /api/v1/symptom   - Symptom analysis endpoints     │ │
│  │  /api/v1/batch     - Batch data endpoints           │ │
│  │  /api/v1/ml        - ML model endpoints             │ │
│  │  /api/v1/analytics - Analytics endpoints            │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Service Layer                           │ │
│  │  - RiskAssessmentService                            │ │
│  │  - SymptomPatternService                            │ │
│  │  - BatchAnalysisService                             │ │
│  │  - MLModelService                                   │ │
│  │  - CacheService (Redis integration)                │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Repository Layer (Data Access)          │ │
│  │  - BatchRepository (SQL queries)                    │ │
│  │  - SymptomRepository                                │ │
│  │  - UserRepository                                   │ │
│  │  - AnalyticsRepository                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              ML Model Layer                          │ │
│  │  - RiskScoreModel (XGBoost)                        │ │
│  │  - ClusteringModel (K-Means, DBSCAN)               │ │
│  │  - AssociationRulesEngine (Apriori)                │ │
│  │  - TimeSeriesPredictor (LSTM)                      │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                ▼                      ▼
        ┌──────────────┐      ┌──────────────┐
        │  PostgreSQL  │      │    Redis     │
        │   Database   │      │    Cache     │
        └──────────────┘      └──────────────┘
```

### 2.3 Data Pipeline Container

```
┌───────────────────────────────────────────────────────────┐
│              ETL Data Pipeline                             │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Extraction Layer                             │ │
│  │  - VAERS Data Downloader (Selenium + Captcha)       │ │
│  │  - CSV File Parser                                  │ │
│  │  - Data Validator                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌───────────────���─────────────────────────────────────┐ │
│  │         Transformation Layer                         │ │
│  │  - Data Cleaner (null handling, normalization)      │ │
│  │  - Feature Engineer (severity scores, flags)        │ │
│  │  - Batch Aggregator                                 │ │
│  │  - Symptom Histogram Generator                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Loading Layer                                │ │
│  │  - Database Loader (PostgreSQL bulk insert)         │ │
│  │  - JSON File Generator (static data)                │ │
│  │  - Cache Warmer (Redis preload)                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Scheduling & Orchestration                   │ │
│  │  - Weekly VAERS Update Job                          │ │
│  │  - Daily Model Retraining Job                       │ │
│  │  - Hourly Cache Refresh Job                         │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Data Model & Database Schema

### 3.1 Core Tables

#### `batches` Table
```sql
CREATE TABLE batches (
    batch_code VARCHAR(50) PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(50) NOT NULL,
    total_reports INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    disabilities INTEGER NOT NULL DEFAULT 0,
    life_threatening INTEGER NOT NULL DEFAULT 0,
    hospitalizations INTEGER NOT NULL DEFAULT 0,
    severe_reports_pct DECIMAL(5,2),
    lethality_pct DECIMAL(5,2),
    risk_score DECIMAL(5,2),  -- Calculated ML score
    first_report_date DATE,
    last_report_date DATE,
    country_distribution JSONB,  -- {"US": 500, "CA": 50}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_manufacturer (manufacturer),
    INDEX idx_risk_score (risk_score DESC),
    INDEX idx_report_dates (first_report_date, last_report_date)
);
```

#### `adverse_events` Table
```sql
CREATE TABLE adverse_events (
    id BIGSERIAL PRIMARY KEY,
    vaers_id INTEGER UNIQUE NOT NULL,
    batch_code VARCHAR(50) REFERENCES batches(batch_code),
    age INTEGER,
    sex CHAR(1),  -- M/F/U
    state VARCHAR(2),
    country VARCHAR(3) DEFAULT 'USA',
    died BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    life_threatening BOOLEAN DEFAULT FALSE,
    hospitalized BOOLEAN DEFAULT FALSE,
    er_visit BOOLEAN DEFAULT FALSE,
    onset_days INTEGER,  -- Days from vaccination to symptom onset
    symptom_text TEXT,
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_batch_code (batch_code),
    INDEX idx_report_date (report_date),
    INDEX idx_severity (died, disabled, life_threatening, hospitalized)
);
```

#### `symptoms` Table
```sql
CREATE TABLE symptoms (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES adverse_events(id) ON DELETE CASCADE,
    symptom_name VARCHAR(200) NOT NULL,
    symptom_category VARCHAR(50),  -- Neurological, Cardiovascular, etc.
    severity_level VARCHAR(20),  -- Mild/Moderate/Severe
    INDEX idx_event_id (event_id),
    INDEX idx_symptom_name (symptom_name),
    INDEX idx_category (symptom_category)
);
```

#### `symptom_clusters` Table (ML-generated)
```sql
CREATE TABLE symptom_clusters (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL,
    cluster_name VARCHAR(100),
    cluster_description TEXT,
    symptom_names TEXT[],  -- Array of symptom names
    patient_count INTEGER,
    avg_severity DECIMAL(3,2),
    model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cluster_id (cluster_id)
);
```

#### `association_rules` Table (ML-generated)
```sql
CREATE TABLE association_rules (
    id SERIAL PRIMARY KEY,
    antecedent TEXT[],  -- ["Headache", "Fatigue"]
    consequent TEXT[],  -- ["Chest pain"]
    support DECIMAL(5,4),  -- 0.0-1.0
    confidence DECIMAL(5,4),  -- 0.0-1.0
    lift DECIMAL(8,4),
    batch_code VARCHAR(50) REFERENCES batches(batch_code),
    model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_batch_code (batch_code),
    INDEX idx_confidence (confidence DESC)
);
```

#### `user_searches` Table (Analytics)
```sql
CREATE TABLE user_searches (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    batch_code VARCHAR(50),
    user_age INTEGER,
    user_sex CHAR(1),
    user_conditions TEXT[],  -- Pre-existing conditions
    risk_score_returned DECIMAL(5,2),
    search_timestamp TIMESTAMP DEFAULT NOW(),
    INDEX idx_batch_code (batch_code),
    INDEX idx_timestamp (search_timestamp DESC)
);
```

### 3.2 Materialized Views (Performance Optimization)

```sql
-- Pre-aggregated batch statistics
CREATE MATERIALIZED VIEW batch_stats_mv AS
SELECT
    b.batch_code,
    b.manufacturer,
    COUNT(ae.id) as total_events,
    SUM(CASE WHEN ae.died THEN 1 ELSE 0 END) as death_count,
    AVG(ae.onset_days) as avg_onset_days,
    COUNT(DISTINCT ae.state) as state_count,
    array_agg(DISTINCT s.symptom_category) as categories
FROM batches b
LEFT JOIN adverse_events ae ON b.batch_code = ae.batch_code
LEFT JOIN symptoms s ON ae.id = s.event_id
GROUP BY b.batch_code, b.manufacturer;

CREATE UNIQUE INDEX ON batch_stats_mv (batch_code);
REFRESH MATERIALIZED VIEW CONCURRENTLY batch_stats_mv;

-- Top symptoms by batch
CREATE MATERIALIZED VIEW top_symptoms_by_batch_mv AS
SELECT
    ae.batch_code,
    s.symptom_name,
    COUNT(*) as frequency,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ae.batch_code) as percentage
FROM adverse_events ae
JOIN symptoms s ON ae.id = s.event_id
GROUP BY ae.batch_code, s.symptom_name
HAVING COUNT(*) >= 5  -- Filter low-frequency symptoms
ORDER BY ae.batch_code, frequency DESC;

CREATE INDEX ON top_symptoms_by_batch_mv (batch_code, frequency DESC);
```

---

## 4. API Design

### 4.1 REST API Endpoints (OpenAPI v3)

#### Risk Assessment Endpoints

**POST /api/v1/risk/assess**
- **Purpose**: Calculate personalized risk score for a batch code
- **Request**:
```json
{
  "batch_code": "EN6201",
  "user_profile": {
    "age": 45,
    "sex": "M",
    "pre_existing_conditions": ["hypertension", "diabetes"],
    "previous_covid_infection": true,
    "dose_number": 2
  }
}
```
- **Response**:
```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "risk_score": 7.2,
  "risk_level": "Medium",
  "confidence": 0.85,
  "risk_factors": [
    {
      "factor": "Age group 40-50",
      "impact": "+1.5",
      "description": "Slightly elevated risk in this age group"
    },
    {
      "factor": "Pre-existing conditions",
      "impact": "+2.0",
      "description": "Hypertension and diabetes increase risk"
    }
  ],
  "comparative_stats": {
    "batch_avg_severity": 6.5,
    "global_avg_severity": 4.2,
    "percentile": 75
  },
  "timestamp": "2025-12-25T10:30:00Z"
}
```

**GET /api/v1/risk/batch/{batch_code}**
- **Purpose**: Get aggregate risk statistics for a batch
- **Response**:
```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "total_reports": 1250,
  "deaths": 45,
  "disabilities": 120,
  "life_threatening": 80,
  "hospitalizations": 300,
  "severe_reports_pct": 43.6,
  "lethality_pct": 3.6,
  "risk_score": 7.2,
  "top_symptoms": [
    {"name": "Chest pain", "frequency": 342, "percentage": 27.4},
    {"name": "Dyspnea", "frequency": 256, "percentage": 20.5}
  ]
}
```

#### Symptom Pattern Endpoints

**GET /api/v1/symptom/clusters**
- **Purpose**: Get identified symptom clusters
- **Query Params**: `batch_code` (optional), `min_size` (default: 50)
- **Response**:
```json
{
  "clusters": [
    {
      "cluster_id": 1,
      "name": "Cardiovascular Cluster",
      "description": "Symptoms related to heart and blood vessels",
      "symptoms": ["Chest pain", "Palpitations", "Dyspnea", "Tachycardia"],
      "patient_count": 450,
      "avg_severity": 7.8,
      "batches_affected": ["EN6201", "EN5318", "EP2163"]
    },
    {
      "cluster_id": 2,
      "name": "Neurological Cluster",
      "description": "Nervous system related symptoms",
      "symptoms": ["Headache", "Dizziness", "Paresthesia", "Confusion"],
      "patient_count": 380,
      "avg_severity": 6.2,
      "batches_affected": ["EN6201", "FA4598"]
    }
  ],
  "total_clusters": 8,
  "model_version": "v1.2.0",
  "last_updated": "2025-12-24T00:00:00Z"
}
```

**GET /api/v1/symptom/associations**
- **Purpose**: Get symptom association rules
- **Query Params**: `batch_code`, `min_confidence` (default: 0.5)
- **Response**:
```json
{
  "rules": [
    {
      "antecedent": ["Headache", "Fatigue"],
      "consequent": ["Chest pain"],
      "support": 0.15,
      "confidence": 0.72,
      "lift": 2.3,
      "interpretation": "If a patient has Headache AND Fatigue, there is a 72% chance they also have Chest pain"
    }
  ],
  "batch_code": "EN6201",
  "total_rules": 45
}
```

**GET /api/v1/symptom/network/{batch_code}**
- **Purpose**: Get symptom co-occurrence network data for visualization
- **Response**:
```json
{
  "nodes": [
    {"id": "Headache", "size": 342, "category": "Neurological"},
    {"id": "Chest pain", "size": 256, "category": "Cardiovascular"}
  ],
  "edges": [
    {"source": "Headache", "target": "Chest pain", "weight": 0.45}
  ],
  "batch_code": "EN6201"
}
```

#### Batch Comparison Endpoints

**POST /api/v1/batch/compare**
- **Purpose**: Compare multiple batches side-by-side
- **Request**:
```json
{
  "batch_codes": ["EN6201", "EN5318", "FA4598"],
  "metrics": ["risk_score", "deaths", "top_symptoms", "clusters"]
}
```
- **Response**:
```json
{
  "comparison": [
    {
      "batch_code": "EN6201",
      "manufacturer": "Pfizer",
      "risk_score": 7.2,
      "deaths": 45,
      "total_reports": 1250,
      "dominant_cluster": "Cardiovascular"
    },
    {
      "batch_code": "EN5318",
      "manufacturer": "Pfizer",
      "risk_score": 5.8,
      "deaths": 22,
      "total_reports": 890,
      "dominant_cluster": "Neurological"
    }
  ],
  "statistical_tests": {
    "risk_score_anova_p_value": 0.003,
    "significant_difference": true
  }
}
```

### 4.2 GraphQL API (Future Enhancement)

```graphql
type Query {
  batch(code: String!): Batch
  batches(manufacturer: String, riskScoreMin: Float): [Batch]
  symptomClusters(batchCode: String, minSize: Int): [SymptomCluster]
  riskAssessment(input: RiskAssessmentInput!): RiskAssessment
}

type Batch {
  batchCode: String!
  manufacturer: String!
  riskScore: Float!
  totalReports: Int!
  adverseEvents: [AdverseEvent]
  topSymptoms: [SymptomFrequency]
  clusters: [SymptomCluster]
}

type SymptomCluster {
  clusterId: Int!
  name: String!
  symptoms: [String]!
  patientCount: Int!
  avgSeverity: Float!
}

input RiskAssessmentInput {
  batchCode: String!
  age: Int!
  sex: String!
  preExistingConditions: [String]
}
```

---

## 5. Machine Learning Architecture

### 5.1 ML Pipeline Overview

```
┌────────────────────────────────────────────────────────────┐
│                   ML Pipeline Flow                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Raw VAERS  │───▶│   Feature    │───▶│   Model     │  │
│  │     Data     │    │ Engineering  │    │  Training   │  │
│  └──────────────┘    └──────────────┘    └──────┬──────┘  │
│                                                   │          │
│                                          ┌────────▼──────┐  │
│                                          │  Model Store  │  │
│                                          │  (MLflow)     │  │
│                                          └────────┬──────┘  │
│                                                   │          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────▼──────┐  │
│  │   Real-time  │◀───│  Prediction  │◀───│   Model     │  │
│  │  Predictions │    │   Service    │    │  Serving    │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Continuous Monitoring                       │  │
│  │  - Prediction latency: <50ms                         │  │
│  │  - Model drift detection (weekly)                    │  │
│  │  - Performance metrics (precision, recall, F1)       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Feature Engineering

**Batch-Level Features**:
- Total adverse event count
- Deaths, disabilities, hospitalizations (raw + percentages)
- Symptom diversity (entropy)
- Geographic spread (Jensen-Shannon distance)
- Temporal distribution (first/last report dates, duration)
- Manufacturer encoding

**Event-Level Features**:
- Patient demographics (age, sex, state)
- Onset time (days from vaccination)
- Severity flags (died, disabled, life_threatening, hospitalized)
- Symptom count per event
- Symptom category distribution
- Temporal features (report month, year, day of week)

**Symptom-Level Features**:
- TF-IDF vectors of symptom text
- Symptom category embeddings
- Co-occurrence matrices
- Association rule metrics (support, confidence, lift)

### 5.3 ML Models

#### Model 1: Risk Score Predictor (XGBoost Regression)
- **Input**: Batch features + user profile features
- **Output**: Risk score (0-10 continuous)
- **Training Data**: Historical VAERS data with engineered severity scores
- **Validation**: 80/20 train-test split, 5-fold cross-validation
- **Metrics**: RMSE, MAE, R²
- **Update Frequency**: Weekly (incremental learning)

```python
# Pseudo-code
from xgboost import XGBRegressor

model = XGBRegressor(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.05,
    objective='reg:squarederror',
    eval_metric='rmse'
)

features = [
    'total_reports', 'deaths', 'disabilities',
    'life_threatening', 'hospitalizations',
    'user_age', 'user_sex_encoded', 'pre_conditions_count',
    'symptom_diversity', 'geographic_spread'
]

model.fit(X_train[features], y_train)
```

#### Model 2: Symptom Clustering (K-Means + DBSCAN)
- **Input**: Symptom co-occurrence matrix (TF-IDF)
- **Output**: Cluster assignments (8-12 clusters)
- **Algorithm**: K-Means for initial clustering, DBSCAN for outlier detection
- **Validation**: Silhouette score (target: >0.6), Davies-Bouldin index
- **Update Frequency**: Monthly

```python
from sklearn.cluster import KMeans, DBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer

# Vectorize symptoms
vectorizer = TfidfVectorizer(max_features=500)
symptom_vectors = vectorizer.fit_transform(symptom_texts)

# Primary clustering
kmeans = KMeans(n_clusters=10, random_state=42)
cluster_labels = kmeans.fit_predict(symptom_vectors)

# Outlier detection
dbscan = DBSCAN(eps=0.3, min_samples=5)
outlier_labels = dbscan.fit_predict(symptom_vectors)
```

#### Model 3: Association Rule Mining (Apriori Algorithm)
- **Input**: Symptom transaction data (one transaction per adverse event)
- **Output**: Association rules (antecedent → consequent)
- **Algorithm**: Apriori with minimum support=0.05, confidence=0.5
- **Validation**: Lift > 1.5 (positive correlation)
- **Update Frequency**: Monthly

```python
from mlxtend.frequent_patterns import apriori, association_rules

# Create transaction matrix (one-hot encoded symptoms)
transactions = pd.get_dummies(symptoms_df.groupby('event_id')['symptom_name'].apply(list).apply(pd.Series).stack()).groupby(level=0).sum()

# Find frequent itemsets
frequent_itemsets = apriori(transactions, min_support=0.05, use_colnames=True)

# Generate rules
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)
rules = rules[rules['lift'] > 1.5]
```

#### Model 4: Symptom Timeline Predictor (LSTM - Future)
- **Input**: Sequence of symptom onset times
- **Output**: Predicted symptom progression timeline
- **Architecture**: 2-layer LSTM + dense output layer
- **Training**: Sequence-to-sequence learning
- **Status**: Sprint 3+ (deferred)

### 5.4 Model Deployment & Serving

**Model Format**: ONNX (interoperable) or pickle (Python-specific)

**Serving Strategy**:
- **Synchronous**: FastAPI endpoint wraps model.predict()
- **Caching**: Redis cache for repeated requests (TTL: 1 hour)
- **Batch Processing**: Async jobs for bulk predictions
- **Versioning**: MLflow model registry (v1.0, v1.1, etc.)

**Performance Targets**:
- Prediction latency: <50ms (P95)
- Throughput: 100 requests/second
- Model size: <100MB (for fast loading)

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

**Current Phase (Sprint 1-2)**: No authentication (public read-only API)

**Future Implementation**:
- **JWT Tokens**: Issued after email/password or OAuth login
- **Role-Based Access Control (RBAC)**:
  - `public`: Read-only access to batch data
  - `researcher`: Access to raw VAERS data, bulk exports
  - `admin`: Full access, user management

```python
# FastAPI middleware example
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt(token)  # Verify signature, expiration
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return payload
```

### 6.2 Data Privacy & Compliance

**VAERS Data Considerations**:
- VAERS data is **publicly available** (no PHI/PII concerns)
- No patient names, addresses, or direct identifiers
- Age is reported in ranges (not exact)

**User Data**:
- User search queries stored anonymously (no email/name collection)
- Optional account creation for saving assessments
- GDPR-compliant: Right to erasure, data portability

**Security Measures**:
- HTTPS-only (TLS 1.3)
- SQL injection prevention (parameterized queries, ORM)
- XSS prevention (input sanitization, CSP headers)
- Rate limiting (100 requests/minute per IP)
- CORS configuration (whitelist frontend domains)

```python
# Rate limiting example
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/risk/assess")
@limiter.limit("100/minute")
async def assess_risk(request: Request, ...):
    ...
```

---

## 7. Performance & Scalability

### 7.1 Caching Strategy

**Redis Cache Layers**:

1. **API Response Cache** (TTL: 1 hour)
   - Key: `api:risk:assess:{batch_code}:{user_hash}`
   - Value: JSON response
   - Invalidation: On model retrain

2. **Database Query Cache** (TTL: 24 hours)
   - Key: `db:batch:{batch_code}`
   - Value: Serialized batch object
   - Invalidation: On weekly VAERS update

3. **ML Prediction Cache** (TTL: 30 days)
   - Key: `ml:risk:{batch_code}:{profile_hash}`
   - Value: Risk score + factors
   - Invalidation: On model version change

```python
# Cache decorator example
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def cache_result(ttl=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(ttl=3600)
async def get_batch_risk(batch_code: str):
    # Expensive DB query + ML prediction
    ...
```

### 7.2 Database Optimization

**Indexing Strategy**:
- B-tree indexes on foreign keys, frequently filtered columns
- Partial indexes on boolean flags (e.g., `WHERE died = TRUE`)
- GIN indexes on JSONB columns for fast lookups
- Covering indexes for common query patterns

**Query Optimization**:
- Use EXPLAIN ANALYZE for slow queries
- Materialized views for pre-aggregated stats
- Connection pooling (max 20 connections)
- Read replicas for analytics queries (future)

```sql
-- Example: Optimized query with covering index
CREATE INDEX idx_ae_batch_severity ON adverse_events(batch_code)
INCLUDE (died, disabled, life_threatening, hospitalized);

-- Query uses index-only scan
SELECT batch_code, COUNT(*) FILTER (WHERE died) as deaths
FROM adverse_events
WHERE batch_code = 'EN6201'
GROUP BY batch_code;
```

### 7.3 Scalability Targets

**Current Capacity** (Single server):
- 10,000 MAU (Monthly Active Users)
- 100 requests/second
- 50ms P95 latency

**Horizontal Scaling Plan** (Future):
- Load balancer (Nginx/Cloudflare)
- Multiple FastAPI instances (Docker Swarm/Kubernetes)
- Read replicas for PostgreSQL
- Redis cluster (master-slave replication)

**Projected Capacity** (3-server cluster):
- 100,000 MAU
- 1,000 requests/second
- 100ms P95 latency

---

## 8. Monitoring & Observability

### 8.1 Metrics to Track

**Application Metrics** (Prometheus):
- Request rate (requests/second)
- Request duration (P50, P95, P99)
- Error rate (4xx, 5xx responses)
- Active connections
- Cache hit ratio

**Business Metrics**:
- Daily/monthly active users
- Top searched batch codes
- Average risk scores returned
- Symptom cluster distribution

**ML Model Metrics**:
- Prediction latency
- Model accuracy (RMSE, MAE)
- Drift detection scores
- Feature importance changes

```python
# Prometheus metrics example
from prometheus_client import Counter, Histogram
import time

request_count = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint'])
request_duration = Histogram('api_request_duration_seconds', 'Request duration')

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    request_count.labels(method=request.method, endpoint=request.url.path).inc()
    request_duration.observe(duration)

    return response
```

### 8.2 Logging Strategy

**Log Levels**:
- **ERROR**: Failed requests, exceptions
- **WARNING**: Slow queries (>1s), cache misses
- **INFO**: API requests, model predictions
- **DEBUG**: Detailed execution flow (dev only)

**Structured Logging** (JSON format):
```json
{
  "timestamp": "2025-12-25T10:30:00Z",
  "level": "INFO",
  "service": "risk-api",
  "endpoint": "/api/v1/risk/assess",
  "batch_code": "EN6201",
  "user_hash": "abc123",
  "duration_ms": 45,
  "cache_hit": true
}
```

**Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)

### 8.3 Alerting Rules

**Critical Alerts** (PagerDuty/Email):
- API error rate > 5% (5min window)
- Database connection pool exhausted
- Model prediction failure rate > 1%

**Warning Alerts** (Slack):
- P95 latency > 500ms
- Cache hit ratio < 70%
- Disk usage > 80%

---

## 9. Deployment Architecture

### 9.1 Development Environment

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - REACT_APP_API_URL=http://localhost:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/lcras
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=lcras
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 9.2 Production Environment

**Frontend**: Cloudflare Pages
- Static build deployment
- Global CDN (200+ locations)
- Automatic HTTPS
- Environment variables for API URL

**Backend**: Railway / Cloud Run
- Containerized FastAPI app
- Auto-scaling (1-5 instances)
- Health checks every 30s
- Environment variables (secrets)

**Database**: Managed PostgreSQL (Railway / Supabase)
- Automated backups (daily)
- Point-in-time recovery
- Connection pooling
- SSL enforcement

**Cache**: Managed Redis (Upstash / Redis Cloud)
- High availability (master-slave)
- Automatic failover
- TLS connections

### 9.3 CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/ --cov

      - name: Run Frontend Tests
        run: |
          cd frontend
          npm install
          npm run test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: railway up --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build React App
        run: |
          cd frontend
          npm install
          npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Model Accuracy Issues** | Medium | High | - Extensive validation with test data<br>- A/B testing before deployment<br>- Human expert review of edge cases |
| **Database Performance Bottleneck** | Medium | Medium | - Materialized views for aggregations<br>- Redis caching layer<br>- Query optimization (EXPLAIN ANALYZE) |
| **API Rate Limiting** | Low | Medium | - Redis-based rate limiter<br>- Cloudflare WAF<br>- Request throttling |
| **Data Inconsistency** | Low | High | - Weekly ETL validation checks<br>- Database constraints (foreign keys)<br>- Idempotent data updates |

### 10.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Server Downtime** | Low | High | - Health checks + auto-restart<br>- Multi-region deployment (future)<br>- Static fallback page |
| **VAERS Data Update Failure** | Medium | Medium | - Retry logic with exponential backoff<br>- Manual intervention alerts<br>- Use last known good data |
| **Model Drift** | High | Medium | - Weekly performance monitoring<br>- Automated retraining pipeline<br>- Drift detection alerts |

---

## 11. Future Enhancements (Post-Sprint 1)

### Phase 2 (Sprint 3-4)
- GraphQL API for flexible queries
- User authentication & saved assessments
- Mobile-responsive design improvements
- Batch comparison tool

### Phase 3 (Sprint 5-6)
- LSTM-based symptom timeline predictor
- Interactive symptom network visualization (D3.js force graph)
- Export reports as PDF
- Multi-language support (i18n)

### Phase 4 (Long-term)
- Mobile app (React Native)
- Real-time notifications for new batches
- Integration with medical literature databases (PubMed API)
- Federated learning for privacy-preserving model training

---

## 12. Architecture Decision Records (ADRs)

### ADR-001: Choose FastAPI over Flask
**Decision**: Use FastAPI for backend framework
**Rationale**:
- Native async/await support (better performance)
- Automatic OpenAPI documentation
- Pydantic validation (type safety)
- Modern, actively maintained

**Alternatives Considered**: Flask (synchronous, older), Django REST Framework (heavier)

### ADR-002: Choose PostgreSQL over MongoDB
**Decision**: Use PostgreSQL as primary database
**Rationale**:
- Structured VAERS data (tabular)
- JSONB support for flexible fields
- Mature ecosystem, excellent ORM support (SQLAlchemy)
- ACID compliance for data integrity

**Alternatives Considered**: MongoDB (document DB, less strict schema)

### ADR-003: Use Redis for Caching
**Decision**: Use Redis for multi-layer caching
**Rationale**:
- In-memory speed (sub-millisecond latency)
- TTL support for automatic expiration
- Rich data structures (strings, hashes, sets)
- Excellent Python client (redis-py)

**Alternatives Considered**: Memcached (simpler, no persistence)

### ADR-004: Static Frontend Deployment on Cloudflare Pages
**Decision**: Deploy React frontend on Cloudflare Pages
**Rationale**:
- Already using Cloudflare for existing s2y-batches project
- Global CDN, fast load times
- Free tier sufficient for 10k MAU
- Easy integration with existing domain

**Alternatives Considered**: Vercel (similar), Netlify (similar), self-hosted Nginx

---

## Conclusion

This architecture provides a scalable, performant, and maintainable foundation for the Long COVID Risk Assessment System. Key strengths:

✅ **Modular Design**: Clear separation of concerns (frontend, backend, data, ML)
✅ **Performance-Optimized**: Multi-layer caching, materialized views, optimized queries
✅ **ML-Driven**: XGBoost, clustering, association rules for actionable insights
✅ **Developer-Friendly**: FastAPI auto-docs, Docker Compose, CI/CD automation
✅ **Production-Ready**: Monitoring, logging, security, scalability considerations

**Next Steps** (Sprint 1):
1. ✅ Complete this architecture document
2. ⏳ Create OpenAPI specification (see `docs/api/openapi.yaml`)
3. ⏳ Design database schema (DDL scripts)
4. ⏳ Initialize FastAPI project structure
5. ⏳ Set up development environment (Docker Compose)

---

**Document Metadata**:
- **Author**: Arch-Agent
- **Reviewers**: PM-Agent, BE-Agent, FE-Agent, DS-Agent
- **Status**: Draft v1.0
- **Next Review**: Sprint 1 Review (2025-01-08)
