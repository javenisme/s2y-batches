/**
 * Batch Service - API calls for batch-related endpoints
 */

import apiClient from './api';
import type { 
  BatchDetails, 
  BatchSearchResponse, 
  BatchSearchParams, 
  TopSymptom,
  SymptomDetail,
  SymptomsResponse,
  RiskExplanation,
  SymptomFilter,
  SymptomTimeDistribution
} from '../types';

export const batchService = {
  /**
   * Search batches with filters
   */
  async searchBatches(params: BatchSearchParams): Promise<BatchSearchResponse> {
    const response = await apiClient.get('/batch/search', { params });
    return response.data;
  },

  /**
   * Get details for a specific batch code
   */
  async getBatchDetails(batchCode: string): Promise<BatchDetails> {
    const response = await apiClient.get(`/batch/${batchCode}`);
    return response.data;
  },

  /**
   * Get top symptoms for a batch code
   */
  async getTopSymptoms(batchCode: string, limit: number = 10): Promise<TopSymptom[]> {
    const response = await apiClient.get(`/batch/${batchCode}/top-symptoms`, {
      params: { limit },
    });
    return response.data.symptoms;
  },

  /**
   * Get detailed symptoms for a batch code with filtering
   * User Story 3: Symptom detail transparency
   */
  async getSymptomsDetail(
    batchCode: string, 
    filter?: SymptomFilter
  ): Promise<SymptomsResponse> {
    const response = await apiClient.get(`/batch/${batchCode}/symptoms`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get symptom time distribution for a batch
   * User Story 3: Symptom time analysis
   */
  async getSymptomTimeDistribution(batchCode: string): Promise<SymptomTimeDistribution[]> {
    const response = await apiClient.get(`/batch/${batchCode}/symptoms/time-distribution`);
    return response.data.distributions;
  },

  /**
   * Get risk explanation with plain language
   * User Story 2: Clear risk interpretation
   */
  async getRiskExplanation(batchCode: string): Promise<RiskExplanation> {
    const response = await apiClient.get(`/batch/${batchCode}/risk-explanation`);
    return response.data;
  },
};
