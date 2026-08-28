import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../contexts/DataContext';
import { HealthProvider } from '../contexts/HealthContext';
import * as analysisService from '../services/analysis_service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/analysis_service');

const wrapper = ({ children }) => (
  <HealthProvider>
    <DataProvider>{children}</DataProvider>
  </HealthProvider>
);

describe('DataContext Caching Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const STORAGE_KEY = 'buildscout.analysis_history.v1';

  it('A. Backend available + existing analyses: displays backend data and updates cache', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    const mockData = [{ analysis_id: 'a1', status: 'COMPLETED' }];
    analysisService.getAnalyses.mockResolvedValue(mockData);
    analysisService.getAnalysis.mockResolvedValue(mockData[0]);

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(result.current.isCached).toBe(false);
    expect(result.current.history[0].analysis_id).toBe('a1');

    const cacheData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(cacheData.analyses[0].analysis_id).toBe('a1');
  });

  it('B. Backend unavailable + valid cache: displays cached analyses', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Down'));
    analysisService.getAnalyses.mockRejectedValue(new Error('Down'));

    const cachedPayload = {
      timestamp: new Date().toISOString(),
      analyses: [{ analysis_id: 'cached-1', status: 'COMPLETED' }]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedPayload));

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(result.current.isCached).toBe(true);
    expect(result.current.history[0].analysis_id).toBe('cached-1');
  });

  it('C. Backend unavailable + no cache: sets refresh error properly', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Down'));
    analysisService.getAnalyses.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.refreshError).toBe('Network Error');
    });

    expect(result.current.history).toHaveLength(0);
    expect(result.current.isCached).toBe(false);
  });

  it('D. Backend returns empty list: updates cache to empty', async () => {
    // Populate old cache
    const oldCache = {
      timestamp: new Date().toISOString(),
      analyses: [{ analysis_id: 'stale-1' }]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldCache));

    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    analysisService.getAnalyses.mockResolvedValue([]); // Backend says empty!

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.history).toEqual([]); // Should NOT be old cache!
    });

    expect(result.current.isCached).toBe(false);
    
    // Verify cache was cleared out/set to empty
    const newCache = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(newCache.analyses).toEqual([]);
  });

  it('J. Corrupted cache safely ignored', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Down'));
    analysisService.getAnalyses.mockRejectedValue(new Error('Down'));

    localStorage.setItem(STORAGE_KEY, 'invalid-json-{');

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.refreshError).toBe('Down');
    });

    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull(); // Cleaned up
  });

});
