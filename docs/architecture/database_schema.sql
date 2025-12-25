-- ============================================================================
-- Long COVID Risk Assessment System (LCRAS) - Database Schema
-- ============================================================================
-- Version: 1.0
-- Date: 2025-12-25
-- Author: Arch-Agent
-- Database: PostgreSQL 14+
--
-- This schema supports:
-- - Batch code tracking and risk scoring
-- - Adverse event reporting with full symptom data
-- - ML-generated clusters and association rules
-- - Analytics and user search tracking
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Batches Table
-- Stores vaccine batch information and aggregated statistics
-- ----------------------------------------------------------------------------
CREATE TABLE batches (
    batch_code VARCHAR(50) PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(50) NOT NULL DEFAULT 'COVID-19',

    -- Aggregate counts
    total_reports INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    disabilities INTEGER NOT NULL DEFAULT 0,
    life_threatening INTEGER NOT NULL DEFAULT 0,
    hospitalizations INTEGER NOT NULL DEFAULT 0,
    er_visits INTEGER NOT NULL DEFAULT 0,

    -- Calculated percentages
    severe_reports_pct DECIMAL(5,2),  -- (deaths + disabilities + life_threatening + hosp) / total
    lethality_pct DECIMAL(5,2),       -- deaths / total

    -- ML-generated risk score
    risk_score DECIMAL(5,2),          -- 0.00 to 10.00
    risk_level VARCHAR(20),           -- 'Low', 'Medium', 'High'

    -- Temporal information
    first_report_date DATE,
    last_report_date DATE,
    report_date_range_days INTEGER GENERATED ALWAYS AS (
        last_report_date - first_report_date
    ) STORED,

    -- Geographic distribution (JSONB for flexibility)
    country_distribution JSONB,       -- {"US": 500, "CA": 50, "UK": 30}
    state_distribution JSONB,         -- {"CA": 120, "TX": 80, "NY": 75}

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_total_reports CHECK (total_reports >= 0),
    CONSTRAINT chk_deaths CHECK (deaths >= 0 AND deaths <= total_reports),
    CONSTRAINT chk_risk_score CHECK (risk_score >= 0 AND risk_score <= 10)
);

-- Indexes for batches table
CREATE INDEX idx_batches_manufacturer ON batches(manufacturer);
CREATE INDEX idx_batches_risk_score ON batches(risk_score DESC NULLS LAST);
CREATE INDEX idx_batches_report_dates ON batches(first_report_date, last_report_date);
CREATE INDEX idx_batches_total_reports ON batches(total_reports DESC);
CREATE INDEX idx_batches_lethality ON batches(lethality_pct DESC NULLS LAST);

-- GIN index for JSONB columns (fast lookups)
CREATE INDEX idx_batches_country_dist ON batches USING GIN (country_distribution);
CREATE INDEX idx_batches_state_dist ON batches USING GIN (state_distribution);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_batches_updated_at
BEFORE UPDATE ON batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE batches IS 'Vaccine batch codes with aggregated adverse event statistics';
COMMENT ON COLUMN batches.risk_score IS 'ML-generated risk score from 0 (lowest) to 10 (highest)';
COMMENT ON COLUMN batches.country_distribution IS 'JSON object mapping country codes to report counts';

-- ----------------------------------------------------------------------------
-- Adverse Events Table
-- Individual adverse event reports from VAERS
-- ----------------------------------------------------------------------------
CREATE TABLE adverse_events (
    id BIGSERIAL PRIMARY KEY,
    vaers_id INTEGER UNIQUE NOT NULL,  -- VAERS unique identifier
    batch_code VARCHAR(50) REFERENCES batches(batch_code) ON DELETE CASCADE,

    -- Patient demographics
    age INTEGER,
    sex CHAR(1) CHECK (sex IN ('M', 'F', 'U')),
    state VARCHAR(2),                   -- US state code (CA, TX, etc.)
    country VARCHAR(3) DEFAULT 'USA',   -- ISO 3-letter country code

    -- Severity flags (Y/N in VAERS, converted to boolean)
    died BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    life_threatening BOOLEAN DEFAULT FALSE,
    hospitalized BOOLEAN DEFAULT FALSE,
    er_visit BOOLEAN DEFAULT FALSE,

    -- Temporal information
    vaccination_date DATE,
    symptom_onset_date DATE,
    onset_days INTEGER,                 -- Days from vaccination to symptom onset
    report_date DATE NOT NULL,

    -- Additional VAERS fields
    symptom_text TEXT,                  -- Free-text symptom description
    medical_history TEXT,               -- Pre-existing conditions
    allergies TEXT,
    current_medications TEXT,

    -- Severity score (calculated or ML-predicted)
    severity_score DECIMAL(5,2),        -- 0.00 to 10.00

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_age CHECK (age >= 0 AND age <= 120),
    CONSTRAINT chk_onset_days CHECK (onset_days >= 0)
);

-- Indexes for adverse_events table
CREATE INDEX idx_ae_batch_code ON adverse_events(batch_code);
CREATE INDEX idx_ae_vaers_id ON adverse_events(vaers_id);
CREATE INDEX idx_ae_report_date ON adverse_events(report_date DESC);
CREATE INDEX idx_ae_severity_flags ON adverse_events(died, disabled, life_threatening, hospitalized);
CREATE INDEX idx_ae_onset_days ON adverse_events(onset_days);

-- Partial index for severe cases only (faster filtering)
CREATE INDEX idx_ae_severe_only ON adverse_events(batch_code, severity_score)
WHERE died = TRUE OR disabled = TRUE OR life_threatening = TRUE OR hospitalized = TRUE;

-- Full-text search index on symptom text
CREATE INDEX idx_ae_symptom_text_fts ON adverse_events USING GIN (to_tsvector('english', symptom_text));

COMMENT ON TABLE adverse_events IS 'Individual adverse event reports from VAERS database';
COMMENT ON COLUMN adverse_events.onset_days IS 'Days from vaccination to first symptom (NULL if unknown)';
COMMENT ON COLUMN adverse_events.severity_score IS 'Calculated severity score based on outcomes';

-- ----------------------------------------------------------------------------
-- Symptoms Table
-- Individual symptoms associated with adverse events (many-to-many)
-- ----------------------------------------------------------------------------
CREATE TABLE symptoms (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES adverse_events(id) ON DELETE CASCADE,
    symptom_name VARCHAR(200) NOT NULL,
    symptom_category VARCHAR(50),       -- Neurological, Cardiovascular, etc.
    severity_level VARCHAR(20),         -- Mild, Moderate, Severe
    symptom_order INTEGER,              -- 1st, 2nd, 3rd symptom reported

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_symptom_order CHECK (symptom_order >= 1 AND symptom_order <= 10)
);

-- Indexes for symptoms table
CREATE INDEX idx_symptoms_event_id ON symptoms(event_id);
CREATE INDEX idx_symptoms_name ON symptoms(symptom_name);
CREATE INDEX idx_symptoms_category ON symptoms(symptom_category);

-- Composite index for common query pattern
CREATE INDEX idx_symptoms_event_name ON symptoms(event_id, symptom_name);

-- Trigram index for fuzzy symptom name search
CREATE INDEX idx_symptoms_name_trgm ON symptoms USING GIN (symptom_name gin_trgm_ops);

COMMENT ON TABLE symptoms IS 'Individual symptoms extracted from adverse event reports';
COMMENT ON COLUMN symptoms.symptom_order IS 'Order in which symptom was reported (1-10)';

-- ============================================================================
-- ML MODEL TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Symptom Clusters Table
-- Stores results from K-Means/DBSCAN clustering
-- ----------------------------------------------------------------------------
CREATE TABLE symptom_clusters (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL,
    cluster_name VARCHAR(100),
    cluster_description TEXT,

    -- Cluster characteristics
    symptom_names TEXT[] NOT NULL,      -- Array of symptom names
    patient_count INTEGER NOT NULL,
    avg_severity DECIMAL(5,2),
    avg_age DECIMAL(5,2),

    -- Batch associations
    batches_affected TEXT[],            -- Array of batch codes

    -- Model metadata
    model_version VARCHAR(20) NOT NULL,
    model_algorithm VARCHAR(50),        -- 'KMeans', 'DBSCAN', etc.
    silhouette_score DECIMAL(5,4),      -- Quality metric

    -- Temporal
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_patient_count CHECK (patient_count > 0),
    CONSTRAINT chk_silhouette CHECK (silhouette_score >= -1 AND silhouette_score <= 1)
);

-- Indexes for symptom_clusters table
CREATE INDEX idx_sc_cluster_id ON symptom_clusters(cluster_id);
CREATE INDEX idx_sc_model_version ON symptom_clusters(model_version);
CREATE INDEX idx_sc_patient_count ON symptom_clusters(patient_count DESC);

-- GIN index for array searches
CREATE INDEX idx_sc_symptom_names ON symptom_clusters USING GIN (symptom_names);
CREATE INDEX idx_sc_batches_affected ON symptom_clusters USING GIN (batches_affected);

COMMENT ON TABLE symptom_clusters IS 'ML-generated symptom clusters from unsupervised learning';
COMMENT ON COLUMN symptom_clusters.silhouette_score IS 'Clustering quality metric (-1 to 1, higher is better)';

-- ----------------------------------------------------------------------------
-- Association Rules Table
-- Stores Apriori algorithm output (symptom co-occurrence rules)
-- ----------------------------------------------------------------------------
CREATE TABLE association_rules (
    id SERIAL PRIMARY KEY,

    -- Rule components
    antecedent TEXT[] NOT NULL,         -- ["Headache", "Fatigue"]
    consequent TEXT[] NOT NULL,         -- ["Chest pain"]

    -- Rule metrics
    support DECIMAL(6,5) NOT NULL,      -- 0.00000 to 1.00000
    confidence DECIMAL(6,5) NOT NULL,   -- 0.00000 to 1.00000
    lift DECIMAL(10,5) NOT NULL,        -- Can be > 1

    -- Context
    batch_code VARCHAR(50) REFERENCES batches(batch_code),  -- NULL = global rule

    -- Model metadata
    model_version VARCHAR(20) NOT NULL,
    min_support_threshold DECIMAL(6,5),
    min_confidence_threshold DECIMAL(6,5),

    -- Interpretation (auto-generated)
    interpretation TEXT,

    -- Temporal
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_support CHECK (support >= 0 AND support <= 1),
    CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 1),
    CONSTRAINT chk_lift CHECK (lift > 0)
);

-- Indexes for association_rules table
CREATE INDEX idx_ar_batch_code ON association_rules(batch_code);
CREATE INDEX idx_ar_confidence ON association_rules(confidence DESC);
CREATE INDEX idx_ar_lift ON association_rules(lift DESC);

-- GIN indexes for array searches
CREATE INDEX idx_ar_antecedent ON association_rules USING GIN (antecedent);
CREATE INDEX idx_ar_consequent ON association_rules USING GIN (consequent);

COMMENT ON TABLE association_rules IS 'Symptom association rules from Apriori algorithm';
COMMENT ON COLUMN association_rules.lift IS 'Lift > 1 indicates positive correlation';

-- ----------------------------------------------------------------------------
-- ML Model Metadata Table
-- Tracks deployed models and their performance
-- ----------------------------------------------------------------------------
CREATE TABLE ml_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL,    -- 'XGBoost', 'KMeans', 'Apriori'

    -- Model artifacts
    model_path TEXT,                    -- Path to serialized model file
    feature_names TEXT[],
    hyperparameters JSONB,

    -- Performance metrics
    training_metrics JSONB,             -- {"rmse": 0.45, "mae": 0.32}
    validation_metrics JSONB,

    -- Training metadata
    training_data_size INTEGER,
    training_date TIMESTAMP,
    trained_by VARCHAR(100),            -- 'DS-Agent', 'AutoML', etc.

    -- Deployment status
    status VARCHAR(20) DEFAULT 'trained',  -- 'trained', 'deployed', 'retired'
    deployed_at TIMESTAMP,
    retired_at TIMESTAMP,

    -- Temporal
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (model_name, model_version)
);

CREATE INDEX idx_ml_models_status ON ml_models(status);
CREATE INDEX idx_ml_models_version ON ml_models(model_version);

COMMENT ON TABLE ml_models IS 'Registry of trained ML models with metadata';

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- User Searches Table
-- Tracks user risk assessment queries for analytics
-- ----------------------------------------------------------------------------
CREATE TABLE user_searches (
    id BIGSERIAL PRIMARY KEY,

    -- Session tracking
    session_id UUID DEFAULT uuid_generate_v4(),
    ip_address INET,
    user_agent TEXT,

    -- Search parameters
    batch_code VARCHAR(50),
    user_age INTEGER,
    user_sex CHAR(1),
    user_conditions TEXT[],             -- Pre-existing conditions

    -- Results
    risk_score_returned DECIMAL(5,2),
    risk_level_returned VARCHAR(20),

    -- Temporal
    search_timestamp TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_us_age CHECK (user_age >= 0 AND user_age <= 120)
);

-- Indexes for user_searches table
CREATE INDEX idx_us_batch_code ON user_searches(batch_code);
CREATE INDEX idx_us_timestamp ON user_searches(search_timestamp DESC);
CREATE INDEX idx_us_session_id ON user_searches(session_id);

-- Partial index for recent searches only (faster analytics)
CREATE INDEX idx_us_recent ON user_searches(search_timestamp DESC)
WHERE search_timestamp > NOW() - INTERVAL '30 days';

COMMENT ON TABLE user_searches IS 'Anonymized user search queries for analytics';

-- ----------------------------------------------------------------------------
-- Batch Views Table
-- Tracks batch code page views
-- ----------------------------------------------------------------------------
CREATE TABLE batch_views (
    id BIGSERIAL PRIMARY KEY,
    batch_code VARCHAR(50) REFERENCES batches(batch_code),
    session_id UUID,
    view_timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bv_batch_code ON batch_views(batch_code);
CREATE INDEX idx_bv_timestamp ON batch_views(view_timestamp DESC);

COMMENT ON TABLE batch_views IS 'Tracks batch code page views for popularity analytics';

-- ============================================================================
-- MATERIALIZED VIEWS (Pre-aggregated for performance)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Batch Statistics Materialized View
-- Pre-aggregates batch statistics for fast lookups
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW batch_stats_mv AS
SELECT
    b.batch_code,
    b.manufacturer,
    b.total_reports,
    b.deaths,
    b.disabilities,
    b.risk_score,

    -- Aggregated event data
    COUNT(ae.id) AS event_count,
    AVG(ae.onset_days) AS avg_onset_days,
    COUNT(DISTINCT ae.state) AS state_count,
    COUNT(DISTINCT ae.country) AS country_count,

    -- Symptom diversity
    COUNT(DISTINCT s.symptom_name) AS unique_symptom_count,

    -- Temporal
    MIN(ae.report_date) AS first_report,
    MAX(ae.report_date) AS last_report,

    -- Age demographics
    AVG(ae.age) FILTER (WHERE ae.age IS NOT NULL) AS avg_age,
    MIN(ae.age) AS min_age,
    MAX(ae.age) AS max_age
FROM batches b
LEFT JOIN adverse_events ae ON b.batch_code = ae.batch_code
LEFT JOIN symptoms s ON ae.id = s.event_id
GROUP BY b.batch_code, b.manufacturer, b.total_reports, b.deaths, b.disabilities, b.risk_score;

-- Unique index required for CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_batch_stats_mv_batch_code ON batch_stats_mv(batch_code);

COMMENT ON MATERIALIZED VIEW batch_stats_mv IS 'Pre-aggregated batch statistics for fast API responses';

-- Refresh schedule: Daily (manual or cron job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY batch_stats_mv;

-- ----------------------------------------------------------------------------
-- Top Symptoms by Batch Materialized View
-- Pre-calculates top symptoms for each batch
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW top_symptoms_by_batch_mv AS
WITH symptom_counts AS (
    SELECT
        ae.batch_code,
        s.symptom_name,
        COUNT(*) AS frequency,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ae.batch_code) AS percentage,
        ROW_NUMBER() OVER (PARTITION BY ae.batch_code ORDER BY COUNT(*) DESC) AS rank
    FROM adverse_events ae
    JOIN symptoms s ON ae.id = s.event_id
    WHERE ae.batch_code IS NOT NULL
    GROUP BY ae.batch_code, s.symptom_name
)
SELECT
    batch_code,
    symptom_name,
    frequency,
    ROUND(percentage::numeric, 2) AS percentage,
    rank
FROM symptom_counts
WHERE rank <= 50  -- Top 50 symptoms per batch
ORDER BY batch_code, rank;

CREATE INDEX idx_tsbb_mv_batch_code ON top_symptoms_by_batch_mv(batch_code);
CREATE INDEX idx_tsbb_mv_frequency ON top_symptoms_by_batch_mv(batch_code, frequency DESC);

COMMENT ON MATERIALIZED VIEW top_symptoms_by_batch_mv IS 'Top 50 symptoms per batch with frequencies';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Calculate Severity Score Function
-- Assigns numeric severity based on outcome flags
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_severity_score(
    p_died BOOLEAN,
    p_disabled BOOLEAN,
    p_life_threatening BOOLEAN,
    p_hospitalized BOOLEAN,
    p_er_visit BOOLEAN
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    score DECIMAL(5,2) := 0;
BEGIN
    -- Weighted severity calculation
    IF p_died THEN
        score := score + 10.0;  -- Maximum severity
    ELSIF p_disabled THEN
        score := score + 8.0;
    ELSIF p_life_threatening THEN
        score := score + 7.0;
    ELSIF p_hospitalized THEN
        score := score + 5.0;
    ELSIF p_er_visit THEN
        score := score + 3.0;
    ELSE
        score := 1.0;  -- Reported but not severe
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_severity_score IS 'Calculates numeric severity score from outcome flags';

-- Example usage:
-- UPDATE adverse_events SET severity_score = calculate_severity_score(died, disabled, life_threatening, hospitalized, er_visit);

-- ----------------------------------------------------------------------------
-- Refresh All Materialized Views Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY batch_stats_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY top_symptoms_by_batch_mv;
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refreshes all materialized views concurrently';

-- ============================================================================
-- DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Ensure batch aggregates match event counts (trigger-based validation)
CREATE OR REPLACE FUNCTION validate_batch_aggregates()
RETURNS TRIGGER AS $$
DECLARE
    actual_count INTEGER;
    actual_deaths INTEGER;
BEGIN
    -- Count actual events for this batch
    SELECT COUNT(*), SUM(CASE WHEN died THEN 1 ELSE 0 END)
    INTO actual_count, actual_deaths
    FROM adverse_events
    WHERE batch_code = NEW.batch_code;

    -- Validate total_reports
    IF NEW.total_reports != COALESCE(actual_count, 0) THEN
        RAISE WARNING 'Batch % total_reports (%) does not match event count (%)',
            NEW.batch_code, NEW.total_reports, actual_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger is disabled by default to avoid performance overhead
-- Enable only during data validation:
-- CREATE TRIGGER trigger_validate_batch_agg BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION validate_batch_aggregates();

-- ============================================================================
-- SAMPLE QUERIES (For Testing)
-- ============================================================================

-- Query 1: Get batch with top symptoms
/*
SELECT
    b.batch_code,
    b.manufacturer,
    b.risk_score,
    b.total_reports,
    b.deaths,
    json_agg(
        json_build_object(
            'symptom', ts.symptom_name,
            'frequency', ts.frequency,
            'percentage', ts.percentage
        ) ORDER BY ts.frequency DESC
    ) FILTER (WHERE ts.rank <= 10) AS top_10_symptoms
FROM batches b
LEFT JOIN top_symptoms_by_batch_mv ts ON b.batch_code = ts.batch_code
WHERE b.batch_code = 'EN6201'
GROUP BY b.batch_code, b.manufacturer, b.risk_score, b.total_reports, b.deaths;
*/

-- Query 2: Find association rules for a batch
/*
SELECT
    array_to_string(antecedent, ' + ') AS antecedent_str,
    array_to_string(consequent, ' → ') AS consequent_str,
    ROUND(confidence::numeric, 3) AS conf,
    ROUND(lift::numeric, 2) AS lift,
    interpretation
FROM association_rules
WHERE batch_code = 'EN6201'
  AND confidence >= 0.7
  AND lift >= 2.0
ORDER BY lift DESC
LIMIT 20;
*/

-- Query 3: Symptom cluster summary
/*
SELECT
    cluster_id,
    cluster_name,
    patient_count,
    ROUND(avg_severity::numeric, 2) AS avg_severity,
    array_length(symptom_names, 1) AS symptom_count,
    symptom_names[1:5] AS top_5_symptoms
FROM symptom_clusters
WHERE model_version = 'v1.0'
ORDER BY patient_count DESC;
*/

-- ============================================================================
-- GRANTS & PERMISSIONS (Adjust as needed for your deployment)
-- ============================================================================

-- Example: Create read-only role for API service
-- CREATE ROLE api_readonly;
-- GRANT CONNECT ON DATABASE lcras TO api_readonly;
-- GRANT USAGE ON SCHEMA public TO api_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_readonly;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO api_readonly;

-- Example: Create read-write role for ETL pipeline
-- CREATE ROLE etl_readwrite;
-- GRANT CONNECT ON DATABASE lcras TO etl_readwrite;
-- GRANT USAGE ON SCHEMA public TO etl_readwrite;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO etl_readwrite;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO etl_readwrite;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
