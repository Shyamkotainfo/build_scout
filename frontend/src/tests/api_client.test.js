import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../services/api_client';

describe('apiClient', () => {
  it('should have the correct base URL and content type', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('response interceptor', () => {
    it('should map 404 error correctly', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {}
        }
      };

      try {
        await apiClient.interceptors.response.handlers[0].rejected(mockError);
      } catch (error) {
        expect(error.code).toBe('NOT_FOUND');
        expect(error.message).toBe('Resource not found.');
      }
    });

    it('should map network failure correctly', async () => {
      const mockError = {}; // No response object

      try {
        await apiClient.interceptors.response.handlers[0].rejected(mockError);
      } catch (error) {
        expect(error.code).toBe('NETWORK_FAILURE');
        expect(error.message).toBe('Unable to connect to BuildSmart backend');
      }
    });

    it('should map structured backend errors correctly', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'CUSTOM_ERROR',
              message: 'Custom message from backend',
              details: { foo: 'bar' }
            }
          }
        }
      };

      try {
        await apiClient.interceptors.response.handlers[0].rejected(mockError);
      } catch (error) {
        expect(error.code).toBe('CUSTOM_ERROR');
        expect(error.message).toBe('Custom message from backend');
        expect(error.details.foo).toBe('bar');
      }
    });
  });
});
