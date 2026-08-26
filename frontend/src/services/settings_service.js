import apiClient from './api_client';

export const getSettings = async () => {
  try {
    const response = await apiClient.get('/api/v1/settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSettings = async (updates) => {
  try {
    const response = await apiClient.put('/api/v1/settings', updates);
    return response.data;
  } catch (error) {
    throw error;
  }
};
