/**
 * Batch Service - API calls for batch-related endpoints
 */

import apiClient from './api';
import type { BatchDetails, BatchSearchResponse, BatchSearchParams, TopSymptom } from '../types';

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
};
