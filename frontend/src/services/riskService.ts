/**
 * Risk Service - API calls for risk assessment endpoints
 */

import apiClient from './api';
import type { RiskAssessmentRequest, RiskAssessmentResponse, BatchRiskStats } from '../types';

export const riskService = {
  /**
   * Calculate personalized risk assessment
   */
  async assessRisk(request: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    const response = await apiClient.post('/risk/assess', request);
    return response.data;
  },

  /**
   * Get batch-level risk statistics
   */
  async getBatchRiskStats(batchCode: string): Promise<BatchRiskStats> {
    const response = await apiClient.get(`/risk/batch/${batchCode}`);
    return response.data;
  },
};
