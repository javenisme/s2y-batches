/**
 * TypeScript type definitions for frontend
 */

// Batch Types
export interface BatchSummary {
  batch_code: string;
  manufacturer: string;
  total_reports: number;
  deaths: number;
  disabilities: number;
  life_threatening: number;
  hospitalizations: number;
  severe_reports_pct: number | null;
  lethality_pct: number | null;
  risk_score: number | null;
  risk_level: string | null;
}

export interface BatchDetails extends BatchSummary {
  vaccine_type: string;
  first_report_date: string | null;
  last_report_date: string | null;
  country_distribution: Record<string, number> | null;
  state_distribution: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface BatchSearchParams {
  manufacturer?: string;
  risk_score_min?: number;
  risk_score_max?: number;
  min_reports?: number;
  limit?: number;
  offset?: number;
}

export interface BatchSearchResponse {
  batches: BatchSummary[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface TopSymptom {
  symptom: string;
  count: number;
  percentage: number;
}

// Risk Assessment Types
export interface UserProfile {
  age: number;
  sex: string;
  pre_existing_conditions?: string[];
  previous_covid_infection: boolean;
  dose_number?: number;
}

export interface RiskAssessmentRequest {
  batch_code: string;
  user_profile: UserProfile;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface ComparativeStats {
  batch_total_reports: number;
  batch_severe_pct: number;
  batch_deaths: number;
  national_avg_risk: number;
  percentile_rank: number;
}

export interface RiskAssessmentResponse {
  batch_code: string;
  manufacturer: string;
  risk_score: number;
  risk_level: string;
  confidence: number;
  risk_factors: RiskFactor[];
  comparative_stats: ComparativeStats;
  timestamp: string;
}

export interface BatchRiskStats {
  batch_code: string;
  manufacturer: string;
  risk_score: number;
  risk_level: string;
  total_reports: number;
  severe_reports_pct: number;
  age_distribution: Record<string, number>;
  sex_distribution: Record<string, number>;
  top_symptoms: TopSymptom[];
  geographic_distribution: Record<string, number>;
}

// Enhanced Types for User Story 2 & 3

export interface SymptomDetail {
  symptom: string;
  frequency: number;
  percentage: number;
  severity: 'severe' | 'common' | 'mild';
  avg_onset_days: number | null;
  median_duration_days: number | null;
  hospitalization_rate: number | null;
  mortality_rate: number | null;
}

export interface SymptomsResponse {
  batch_code: string;
  total_symptoms: number;
  symptoms: SymptomDetail[];
  date_range: {
    start: string;
    end: string;
  };
}

export interface RiskExplanation {
  batch_code: string;
  risk_score: number;
  risk_level: string;
  summary: string;
  interpretation: string;
  recommendations: string[];
  calculation_method: string;
  comparison_benchmark: {
    national_avg: number;
    percentile_rank: number;
    comparison_text: string;
  };
}

export interface SymptomFilter {
  severity?: 'all' | 'severe' | 'common' | 'mild';
  dose_number?: number;
  date_range?: '7d' | '30d' | '90d' | 'all';
}

export interface SymptomTimeDistribution {
  range: string;
  common_count: number;
  severe_count: number;
}
