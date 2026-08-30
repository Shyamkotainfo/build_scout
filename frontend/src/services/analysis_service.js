import apiClient from './api_client';

export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAnalysis = async (user_request) => {
  try {
    const response = await apiClient.post('/api/v1/analyses', { user_request });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnalysisStatus = async (analysis_id) => {
  try {
    const response = await apiClient.get(`/api/v1/analyses/${analysis_id}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnalysis = async (analysis_id) => {
  try {
    const response = await apiClient.get(`/api/v1/analyses/${analysis_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnalyses = async () => {
  try {
    const response = await apiClient.get('/api/v1/analyses');
    return response.data;
  } catch (error) {
    throw error;
  }
};
