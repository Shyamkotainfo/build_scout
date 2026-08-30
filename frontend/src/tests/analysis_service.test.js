import { describe, it, expect, vi } from 'vitest';
import { getHealth, createAnalysis, getAnalysis } from '../services/analysis_service';
import apiClient from '../services/api_client';

vi.mock('../services/api_client');

describe('analysis_service', () => {
  it('should successfully get health', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { status: 'healthy' } });
    const response = await getHealth();
    expect(response.status).toBe('healthy');
    expect(apiClient.get).toHaveBeenCalledWith('/health');
  });

  it('should successfully create an analysis', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { analysis_id: '123' } });
    const response = await createAnalysis('test request');
    expect(response.analysis_id).toBe('123');
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/analyses', { user_request: 'test request' });
  });

  it('should successfully get an analysis', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { analysis_id: '123' } });
    const response = await getAnalysis('123');
    expect(response.analysis_id).toBe('123');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analyses/123');
  });
});
